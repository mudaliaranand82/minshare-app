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

export function scoreEntry(
  entry: Entry,
  scores: Map<string, PlayerScore>,
): ScoredEntry {
  const picks: ScoredPick[] = [];

  for (const group of SCORING_GROUPS) {
    const playerId = entry.picks[group];
    const player = playerId ? getPlayer(playerId) : undefined;
    const score: PlayerScore = player
      ? scores.get(player.id) ?? {
          toPar: null,
          missedCut: false,
          round1ToPar: null,
          unmatched: true,
        }
      : { toPar: null, missedCut: false, round1ToPar: null, unmatched: true };

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
  const eligible = madeCutCount >= 4;

  // Best-4 logic: from the made-cut picks, keep the 4 lowest (best) scores;
  // drop the single worst performer ("lowest performer ... will be deleted").
  const sortedBest = [...madeCut].sort(
    (a, b) => (a.score.toPar! - b.score.toPar!),
  );
  const keep = sortedBest.slice(0, 4);
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
  const tiebreaker = amScore?.round1ToPar ?? null;

  return {
    name: entry.name,
    picks,
    madeCutCount,
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
): ScoredEntry[] {
  const scored = entries.map((e) => scoreEntry(e, scores));

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
