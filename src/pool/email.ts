// Build the plain-text standings email that Mike sends out manually.

import type { LeaderboardMeta, ScoredEntry } from './types';
import { formatToPar, formatTiebreak } from './scoring';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function buildEmail(
  standings: ScoredEntry[],
  meta: LeaderboardMeta,
  payouts: { place: string; amount: number }[] = [],
  dropWorst = false,
): string {
  const lines: string[] = [];
  lines.push(`US Open Pool — Standings`);
  lines.push(`${meta.eventName} • ${meta.detail}`);
  lines.push(
    `Updated ${new Date(meta.fetchedAt).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    })} ET`,
  );
  lines.push('');

  const eligible = standings.filter((e) => e.eligible);
  const ineligible = standings.filter((e) => !e.eligible);

  // Map rank -> payout for quick lookup.
  const payoutByRank = new Map<number, string>();
  payouts.forEach((p, i) => payoutByRank.set(i + 1, `$${p.amount}`));

  lines.push(
    dropWorst
      ? 'LEADERBOARD (best 4 of 5 count, lower is better)'
      : 'LEADERBOARD (all made-cut picks count, lower is better)',
  );
  lines.push('------------------------------------------');
  eligible.forEach((e) => {
    const rankNum = e.rank ?? 0;
    const rank = e.rank ? ordinal(e.rank).padStart(4) : '   -';
    const money = payoutByRank.get(rankNum);
    const counted = e.picks
      .filter((p) => p.counted)
      .map((p) => `${p.label} ${formatToPar(p.score.toPar)}`)
      .join(', ');
    lines.push(
      `${rank}  ${e.name} — ${formatToPar(e.total)}` +
        (money ? `   (${money})` : ''),
    );
    lines.push(`        ${counted}`);
  });

  if (ineligible.length > 0) {
    lines.push('');
    lines.push('NOT YET ELIGIBLE (need 4 of 5 to make the cut)');
    lines.push('------------------------------------------');
    ineligible.forEach((e) => {
      lines.push(
        `   -  ${e.name} — ${e.madeCutCount}/5 made cut` +
          (e.madeCutCount > 0 ? ` (${formatToPar(e.total)} so far)` : ''),
      );
    });
  }

  if (payouts.length > 0) {
    lines.push('');
    lines.push('PAYOUTS');
    lines.push('------------------------------------------');
    payouts.forEach((p, i) => {
      const winner = eligible.find((e) => e.rank === i + 1);
      lines.push(`${p.place}: $${p.amount}${winner ? ` — ${winner.name}` : ''}`);
    });
  }

  lines.push('');
  lines.push(
    `Tiebreaker: amateur (Group F) Round-1 score${
      standings.some((e) => e.amateurLabel)
        ? ` — e.g. lower number wins (${eligible
            .slice(0, 1)
            .map((e) => `${e.name} ${formatTiebreak(e.tiebreaker)}`)
            .join('')})`
        : ''
    }.`,
  );
  lines.push('Auto-generated from the live ESPN leaderboard.');

  return lines.join('\n');
}
