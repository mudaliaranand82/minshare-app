// Known missed-cut players for the 2026 US Open (Shinnecock).
//
// Derived from Mike's official CSV (the round-2 cut is FINAL, so this set is
// stable for the rest of the tournament). Used as an authoritative override so
// cut players are dropped and 2+-cut entries are eliminated, regardless of how
// ESPN happens to encode cut status. Live SCORES still come from ESPN for
// everyone who made the cut.
//
// To reset for a future event, empty RAW (or delete this file's usage).

import type { GroupId } from './types';
import { findPlayerIdByLabel } from './players';

const RAW: [GroupId, string][] = [
  // Group B
  ['B', 'DeChambeau'],
  ['B', 'Koepka'],
  ['B', 'Smith, Cam'],
  // Group C
  ['C', 'Cantlay'],
  ['C', 'Day'],
  ['C', 'English'],
  ['C', 'Hovland'],
  ['C', 'Lowry'],
  ['C', 'Reed'],
  ['C', 'Scott'],
  ['C', 'Taylor'],
  // Group D
  ['D', 'Harrington'],
  ['D', 'Puig'],
  ['D', 'Reitan'],
  ['D', 'Smalley'],
  // Group E
  ['E', 'Gerard'],
  ['E', 'Kirk'],
  ['E', 'Knapp'],
  ['E', 'Kim, TK'],
  ['E', 'Tosti'],
  ['E', 'Yellamaraju'],
];

export const KNOWN_CUT_IDS: Set<string> = new Set(
  RAW.map(([g, l]) => findPlayerIdByLabel(g, l)).filter(
    (id): id is string => !!id,
  ),
);

export function isKnownCut(playerId: string | undefined): boolean {
  return !!playerId && KNOWN_CUT_IDS.has(playerId);
}
