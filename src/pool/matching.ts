// Match pool players (last-name-centric labels) to ESPN athletes.

import type { EspnAthlete } from './espn';
import type { Player, PlayerScore } from './types';
import { ALL_PLAYERS } from './players';
import { isKnownCut } from './knownCuts';

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function lastKey(s: string): string {
  // Handle "Last, First" by taking the part before the comma.
  const base = s.includes(',') ? s.split(',')[0] : s;
  return norm(base);
}

export interface MatchIndex {
  byLast: Map<string, EspnAthlete[]>;
  all: EspnAthlete[];
}

export function buildIndex(athletes: EspnAthlete[]): MatchIndex {
  const byLast = new Map<string, EspnAthlete[]>();
  for (const a of athletes) {
    const key = norm(a.last);
    const list = byLast.get(key) ?? [];
    list.push(a);
    byLast.set(key, list);
  }
  return { byLast, all: athletes };
}

/** Find the ESPN athlete that best matches a pool player. */
export function matchPlayer(player: Player, index: MatchIndex): EspnAthlete | undefined {
  const key = lastKey(player.last);
  let candidates = index.byLast.get(key);

  // Fallback: substring match on last name (handles "de Chassart", hyphens).
  if (!candidates || candidates.length === 0) {
    candidates = index.all.filter(
      (a) => norm(a.last).includes(key) || key.includes(norm(a.last)),
    );
  }
  if (!candidates || candidates.length === 0) {
    // Last resort: scan full display names.
    candidates = index.all.filter((a) => norm(a.displayName).includes(key));
  }
  if (!candidates || candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  // Multiple players share a last name — disambiguate by first name.
  if (player.first) {
    const fk = norm(player.first);
    const byFirst = candidates.find((a) => {
      const af = norm(a.first);
      return af === fk || af.startsWith(fk) || fk.startsWith(af);
    });
    if (byFirst) return byFirst;
  }
  // Ambiguous and no first-name hint resolved it — return the first as a guess.
  return candidates[0];
}

/** Build a PlayerScore for a pool player given the ESPN index. */
export function scoreForPlayer(player: Player, index: MatchIndex): PlayerScore {
  const knownCut = isKnownCut(player.id);
  const a = matchPlayer(player, index);
  if (!a) {
    return {
      toPar: null,
      missedCut: knownCut,
      round1: null,
      unmatched: true,
    };
  }
  return {
    espnId: a.id,
    espnName: a.displayName,
    toPar: a.toPar,
    // Authoritative cut override (final after round 2) OR ESPN's own flag.
    missedCut: knownCut || a.missedCut,
    round1: a.round1,
    position: a.position,
    thru: a.thru,
    rawStatus: a.rawStatus,
    unmatched: false,
  };
}

/** Map every pool player to a live score (id -> PlayerScore). */
export function scoreAllPlayers(index: MatchIndex): Map<string, PlayerScore> {
  const map = new Map<string, PlayerScore>();
  for (const p of ALL_PLAYERS) {
    map.set(p.id, scoreForPlayer(p, index));
  }
  return map;
}
