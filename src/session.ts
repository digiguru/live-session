export interface ContributionSessionLike {
  id: string;
  name?: string;
  status: "open" | "closed";
  createdAt?: number;
  updatedAt?: number;
  closedAt?: number | null;
  contributions: Map<string, unknown>;
  baselineContributions?: Map<string, number>;
}

export function baselineContributionTotal(session: ContributionSessionLike): number {
  let total = 0;
  for (const count of (session.baselineContributions ?? new Map()).values()) total += count;
  return total;
}

export function totalContributionCount(session: ContributionSessionLike): number {
  return session.contributions.size + baselineContributionTotal(session);
}

export function publicSessionSummary(session: ContributionSessionLike) {
  return {
    id: session.id,
    name: session.name,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    closedAt: session.closedAt ?? null,
    totalContributions: totalContributionCount(session)
  };
}
