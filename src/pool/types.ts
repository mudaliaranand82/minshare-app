// Core types for the US Open pool automation.

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * A player option as it appears in Mike's groups.
 * `label` is exactly how the name reads in the pool sheet/email.
 * `last` / `first` are matching hints used to line the pick up with an
 * ESPN athlete (ESPN uses full "First Last" display names).
 */
export interface Player {
  /** Stable id, unique within the whole field. */
  id: string;
  group: GroupId;
  /** Display label exactly as written in the pool (often last-name only). */
  label: string;
  /** Last name used for ESPN matching. */
  last: string;
  /** First name (or distinguishing token) when the last name is ambiguous. */
  first?: string;
}

/** A single pool entry (one person can submit up to 3 entries). */
export interface Entry {
  /** Display name of the entrant (e.g. "Anand", "Anand #2"). */
  name: string;
  /** Player id picked from each group. F is the amateur tiebreaker pick. */
  picks: Partial<Record<GroupId, string>>;
}

/** Live data for one player, normalised from the ESPN leaderboard. */
export interface PlayerScore {
  /** ESPN athlete id, when matched. */
  espnId?: string;
  /** ESPN full display name, when matched. */
  espnName?: string;
  /** Score to par (negative is better). null when unknown / not started. */
  toPar: number | null;
  /** True when the player has missed the cut / WD / DQ. */
  missedCut: boolean;
  /** Day-1 (round 1) score to par, used for amateur tiebreakers. */
  round1ToPar: number | null;
  /** Position string from ESPN, e.g. "T5", "CUT". */
  position?: string;
  /** Holes played indicator, e.g. "F", "12", "thru 9". */
  thru?: string;
  /** Raw status text from ESPN, surfaced for debugging/verification. */
  rawStatus?: string;
  /** True when we could not match the pick to any ESPN athlete. */
  unmatched: boolean;
}

/** One counted/dropped pick within a scored entry. */
export interface ScoredPick {
  group: GroupId;
  playerId: string;
  label: string;
  score: PlayerScore;
  /** True if this pick's score is counted toward the entry total. */
  counted: boolean;
  /** Why it was dropped, if applicable. */
  dropReason?: 'missed-cut' | 'worst-performer' | 'unmatched';
}

/** A fully scored entry, ready to rank. */
export interface ScoredEntry {
  name: string;
  picks: ScoredPick[];
  /** Number of A-E picks that made the cut. */
  madeCutCount: number;
  /** Sum of the counted (best 4) made-cut scores, to par. */
  total: number;
  /** Eligible to win: at least 4 of 5 made the cut. */
  eligible: boolean;
  /** Amateur (Group F) round-1 score, used to break ties. */
  tiebreaker: number | null;
  /** The amateur pick label (Group F), for display. */
  amateurLabel?: string;
  /** 1-based rank among eligible entries; null when ineligible. */
  rank: number | null;
}

/** Metadata about the tournament/leaderboard pull. */
export interface LeaderboardMeta {
  eventName: string;
  /** "pre" | "in" | "post" */
  state: string;
  /** Human label, e.g. "Round 3 - In Progress". */
  detail: string;
  /** True once the cut has been applied (after round 2). */
  cutApplied: boolean;
  fetchedAt: string;
}
