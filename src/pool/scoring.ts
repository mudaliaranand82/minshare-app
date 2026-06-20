// Apply Mike's pool rules to produce ranked standings.
//
// Rules (from the email):
//  - Pick one player from each group A-E, plus one amateur from F.
//  - To be eligible to win, at least 4 of the 5 (A-E) picks must make the cut.
//  - Only made-cut scores count.
//  - The lowest performer (worst score) is dropped: your best 4 count.
//  - Lower total (to par) wins.
//  - Ties are broken by the Group F amateur's Round-1 score (lower is better).

import type {
  Entry,
  GroupId,
  PlayerScore,
  ScoredEntry,
  ScoredPick,
} from './types';
import { getPlayer } from './players';

const SCORING_GROUPS: GroupId[] = ['A', 'B', 'C', 'D', 'E'];

export interface ScoringOptions {
  /**
   * When true, apply the email's final rule: drop each entry's worst made-cut
   * score so only the best 4 count. When false (default, matching Mike's
   * running sheet), every made-cut pick is summed.
   */
  dropWorst?: boolean;
}

export function scoreEntry(
  entry: Entry,
  scores: Map<string, PlayerScore>,
  options: ScoringOptions = {},
): ScoredEntry {
  const picks: ScoredPick[] = [];

  for (const group of SCORING_GROUPS) {
    const playerId = entry.picks[group];
    const player = playerId ? getPlayer(playerId) : undefined;
    const score: PlayerScore = player
      ? scores.get(player.id) ?? {
          toPar: null,
          missedCut: false,
          round1: null,
          unmatched: true,
        }
      : { toPar: null, missedCut: false, round1: null, unmatched: true };

    picks.push({
      group,
      playerId: playerId ?? '',
      label: player?.label ?? '(none)',
      score,
      counted: false, // decided below
    });
  }

  // Made-cut picks with a usable numeric score are candidates to count.
  const madeCut = picks.filter(
    (p) => !p.score.missedCut && !p.score.unmatched && p.score.toPar !== null,
  );
  const madeCutCount = madeCut.length;
  const missedCutCount = picks.filter((p) => p.score.missedCut).length;
  const eligible = madeCutCount >= 4;

  // Decide which made-cut picks count. By default every made-cut pick counts
  // (matches Mike's running sheet). With dropWorst, keep only the best 4 —
  // i.e. drop the single worst performer ("lowest performer ... deleted").
  const sortedBest = [...madeCut].sort((a, b) => a.score.toPar! - b.score.toPar!);
  const keep = options.dropWorst ? sortedBest.slice(0, 4) : sortedBest;
  const keepIds = new Set(keep.map((p) => p.playerId));

  let total = 0;
  for (const p of picks) {
    if (keepIds.has(p.playerId) && p.score.toPar !== null) {
      p.counted = true;
      total += p.score.toPar;
    } else {
      p.counted = false;
      if (p.score.unmatched) p.dropReason = 'unmatched';
      else if (p.score.missedCut) p.dropReason = 'missed-cut';
      else p.dropReason = 'worst-performer';
    }
  }

  // Amateur (Group F) tiebreaker: round-1 score.
  const amId = entry.picks.F;
  const amPlayer = amId ? getPlayer(amId) : undefined;
  const amScore = amPlayer ? scores.get(amPlayer.id) : undefined;
  const tiebreaker = amScore?.round1 ?? null;

  return {
    name: entry.name,
    picks,
    madeCutCount,
    missedCutCount,
    total,
    eligible,
    tiebreaker,
    amateurLabel: amPlayer?.label,
    rank: null,
  };
}

/** Score and rank a whole field of entries. */
export function scoreStandings(
  entries: Entry[],
  scores: Map<string, PlayerScore>,
  options: ScoringOptions = {},
): ScoredEntry[] {
  const scored = entries.map((e) => scoreEntry(e, scores, options));

  // Rank: eligible entries first, by total asc, then tiebreaker asc.
  const eligible = scored
    .filter((e) => e.eligible)
    .sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      const at = a.tiebreaker ?? Number.POSITIVE_INFINITY;
      const bt = b.tiebreaker ?? Number.POSITIVE_INFINITY;
      if (at !== bt) return at - bt;
      return a.name.localeCompare(b.name);
    });

  // Assign 1-based ranks with ties sharing a rank.
  let rank = 0;
  let prevKey = '';
  eligible.forEach((e, i) => {
    const key = `${e.total}|${e.tiebreaker ?? 'x'}`;
    if (key !== prevKey) {
      rank = i + 1;
      prevKey = key;
    }
    e.rank = rank;
  });

  // Ineligible entries sorted by made-cut count then total, after eligibles.
  const ineligible = scored
    .filter((e) => !e.eligible)
    .sort((a, b) => {
      if (a.madeCutCount !== b.madeCutCount) return b.madeCutCount - a.madeCutCount;
      return a.total - b.total;
    });

  return [...eligible, ...ineligible];
}

/** Format a to-par number the golf way: "-4", "E", "+2". */
export function formatToPar(n: number | null): string {
  if (n === null) return '—';
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

/** Format the amateur tiebreaker (a raw Round-1 figure) as a plain number. */
export function formatTiebreak(n: number | null): string {
  return n === null ? '—' : `${n}`;
}
