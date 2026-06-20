// Live leaderboard fetch + normalisation from ESPN's public golf API.
//
// Endpoint (CORS-open, no key required):
//   https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard
//
// The US Open lives under the PGA tour feed. The JSON shape is only loosely
// documented, so every field access here is defensive and we keep the raw
// status text around so the UI can show exactly what ESPN returned.

import type { LeaderboardMeta } from './types';

const LEADERBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard';

export interface EspnAthlete {
  id: string;
  displayName: string;
  first: string;
  last: string;
  /** Total score to par; null if not available. */
  toPar: number | null;
  /** Round 1 score to par; null if not available. */
  round1ToPar: number | null;
  missedCut: boolean;
  position?: string;
  thru?: string;
  rawStatus?: string;
  isAmateur: boolean;
}

export interface EspnLeaderboard {
  meta: LeaderboardMeta;
  athletes: EspnAthlete[];
}

/** Parse a to-par string ("-5", "E", "+3", "10") into a number. */
function parToNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (v === '' || v === '-' || v === '--') return null;
  if (/^e$/i.test(v)) return 0;
  const n = Number(v.replace('+', ''));
  return Number.isFinite(n) ? n : null;
}

const CUT_RE = /\b(cut|mc|mdf|wd|dq|dsq|withdraw|disqualif)\b/i;

function looksCut(...texts: (unknown | undefined)[]): boolean {
  return texts.some((t) => typeof t === 'string' && CUT_RE.test(t));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function splitName(displayName: string, athlete: any): { first: string; last: string } {
  const first = athlete?.firstName ?? athlete?.first;
  const last = athlete?.lastName ?? athlete?.last;
  if (typeof first === 'string' && typeof last === 'string') {
    return { first, last };
  }
  const parts = (displayName || '').trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') || parts[0] || '' };
}

function normalizeCompetitor(c: any): EspnAthlete | null {
  const athlete = c?.athlete ?? c?.competitor?.athlete;
  if (!athlete) return null;
  const displayName: string = athlete.displayName ?? athlete.fullName ?? '';
  const { first, last } = splitName(displayName, athlete);

  const status = c?.status ?? {};
  const position =
    status?.position?.displayName ??
    status?.position?.abbreviation ??
    c?.status?.displayValue;
  const positionId = status?.position?.id;

  // ESPN encodes the running total in `score` (string) or sometimes an object.
  const scoreRaw = c?.score?.displayValue ?? c?.score ?? status?.score;
  const toPar = parToNumber(scoreRaw);

  // Per-round figures live in linescores[]. We want round 1's to-par.
  let round1ToPar: number | null = null;
  const lines = c?.linescores;
  if (Array.isArray(lines) && lines.length > 0) {
    const r1 =
      lines.find((l: any) => (l?.period ?? l?.round) === 1) ?? lines[0];
    // linescore.value is strokes for the round; we want to-par for that day.
    round1ToPar =
      parToNumber(r1?.toPar) ??
      parToNumber(r1?.displayValue) ??
      parToNumber(r1?.value);
  }

  const rawStatus =
    status?.type?.description ?? status?.type?.name ?? position ?? '';

  const missedCut =
    looksCut(position, rawStatus, status?.type?.name, status?.type?.shortDetail) ||
    positionId === '0';

  const thru =
    status?.thru === 0
      ? 'F'
      : status?.displayThru ?? (status?.thru != null ? String(status.thru) : undefined);

  return {
    id: String(athlete.id ?? displayName),
    displayName,
    first,
    last,
    toPar,
    round1ToPar,
    missedCut,
    position: typeof position === 'string' ? position : undefined,
    thru,
    rawStatus: typeof rawStatus === 'string' ? rawStatus : undefined,
    isAmateur: athlete?.amateur === true || /\(a\)/i.test(displayName),
  };
}

export async function fetchLeaderboard(
  signal?: AbortSignal,
): Promise<EspnLeaderboard> {
  const res = await fetch(LEADERBOARD_URL, { signal });
  if (!res.ok) {
    throw new Error(`ESPN responded ${res.status} ${res.statusText}`);
  }
  const data: any = await res.json();

  const event = data?.events?.[0] ?? {};
  const competition = event?.competitions?.[0] ?? {};
  const statusType = competition?.status?.type ?? event?.status?.type ?? {};

  const competitors: any[] =
    competition?.competitors ?? event?.competitors ?? [];
  const athletes = competitors
    .map(normalizeCompetitor)
    .filter((a): a is EspnAthlete => a !== null);

  const state: string = statusType?.state ?? 'unknown';
  // The cut is applied once at least 36 holes are complete (after round 2).
  const period: number = competition?.status?.period ?? event?.status?.period ?? 0;
  const cutApplied =
    state === 'post' || period >= 3 || athletes.some((a) => a.missedCut);

  const meta: LeaderboardMeta = {
    eventName: event?.name ?? event?.shortName ?? 'US Open',
    state,
    detail:
      statusType?.detail ??
      statusType?.shortDetail ??
      statusType?.description ??
      state,
    cutApplied,
    fetchedAt: new Date().toISOString(),
  };

  return { meta, athletes };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
