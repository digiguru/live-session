import type { Contribution } from "./model.js";

export interface PresenceConnection {
  participantId: string;
  connected: boolean;
  lastActiveAt?: number;
}

export interface ParticipantPresence {
  participantId: string;
  connected: boolean;
  active: boolean;
  contributed: boolean;
  waiting: boolean;
}

export interface PresenceCounts {
  connected: number;
  active: number;
  contributed: number;
  waiting: number;
}

export const DEFAULT_ACTIVITY_TIMEOUT_MS = 10_000;

export function participantPresence<TValue>(
  connections: Iterable<PresenceConnection>,
  contributions: Iterable<Contribution<TValue>>,
  now = Date.now(),
  timeoutMs = DEFAULT_ACTIVITY_TIMEOUT_MS
): ParticipantPresence[] {
  const contributionIds = new Set<string>();
  for (const contribution of contributions) contributionIds.add(contribution.participantId);

  const byParticipant = new Map<string, { connected: boolean; lastActiveAt?: number }>();
  for (const connection of connections) {
    const existing = byParticipant.get(connection.participantId);
    const lastActiveAt = connection.lastActiveAt;
    if (!existing) {
      const state: { connected: boolean; lastActiveAt?: number } = { connected: connection.connected };
      if (typeof lastActiveAt === "number" && Number.isFinite(lastActiveAt)) {
        state.lastActiveAt = lastActiveAt;
      }
      byParticipant.set(connection.participantId, state);
      continue;
    }
    existing.connected ||= connection.connected;
    if (
      typeof lastActiveAt === "number" &&
      Number.isFinite(lastActiveAt) &&
      (!Number.isFinite(existing.lastActiveAt) || lastActiveAt > existing.lastActiveAt!)
    ) {
      existing.lastActiveAt = lastActiveAt;
    }
  }

  return [...byParticipant.entries()].map(([participantId, connection]) => {
    const hasContribution = contributionIds.has(participantId);
    const recentlyActive =
      Number.isFinite(connection.lastActiveAt) &&
      now - connection.lastActiveAt! <= timeoutMs;
    const active = connection.connected && (hasContribution || recentlyActive);

    return {
      participantId,
      connected: connection.connected,
      active,
      contributed: connection.connected && hasContribution,
      waiting: active && !hasContribution
    };
  });
}

export function countPresence(states: Iterable<ParticipantPresence>): PresenceCounts {
  const counts: PresenceCounts = { connected: 0, active: 0, contributed: 0, waiting: 0 };
  for (const state of states) {
    if (state.connected) counts.connected += 1;
    if (state.active) counts.active += 1;
    if (state.contributed) counts.contributed += 1;
    if (state.waiting) counts.waiting += 1;
  }
  return counts;
}
