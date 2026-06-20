// Build the plain-text standings email that Mike sends out manually.

import type { LeaderboardMeta, ScoredEntry } from './types';
import { formatToPar } from './scoring';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function buildEmail(
  standings: ScoredEntry[],
  meta: LeaderboardMeta,
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

  lines.push('LEADERBOARD (best 4 of 5, lower is better)');
  lines.push('------------------------------------------');
  eligible.forEach((e) => {
    const rank = e.rank ? ordinal(e.rank).padStart(4) : '   -';
    const counted = e.picks
      .filter((p) => p.counted)
      .map((p) => `${p.label} ${formatToPar(p.score.toPar)}`)
      .join(', ');
    lines.push(`${rank}  ${e.name} — ${formatToPar(e.total)}`);
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

  lines.push('');
  lines.push('Tiebreakers use the amateur (Group F) Round-1 score.');
  lines.push('Auto-generated from the live ESPN leaderboard.');

  return lines.join('\n');
}
