export type SessionStatus = "open" | "closed";

export interface Session {
  id: string;
  name?: string;
  status: SessionStatus;
  createdAt?: number;
  updatedAt?: number;
  closedAt?: number | null;
}

export interface Activity {
  id: string;
  name?: string;
}

export interface Participant {
  id: string;
}

export interface Contribution<TValue = unknown> {
  participantId: string;
  activityId?: string;
  value: TValue;
  updatedAt?: number;
}

export interface Aggregate<TValue = unknown> {
  value: TValue;
  contributionCount: number;
}

export type HostCredential = string;

export interface ParticipantRepository<TParticipant extends Participant> {
  getParticipants(): PromiseLike<TParticipant[]>;
  saveParticipants(participants: TParticipant[]): PromiseLike<TParticipant[]>;
}
