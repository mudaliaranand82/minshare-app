// Live leaderboard fetch + normalisation from ESPN's public golf API.
//
// Endpoint (CORS-open, no key required):
//   https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard
//
// The US Open lives under the PGA tour feed. The JSON shape is only loosely
// documented, so every field access here is defensive and we keep the raw
// status text around so the UI can show exactly what ESPN returned.

import type { LeaderboardMeta } from './types';

// Tried in order; the first that responds and has an event with players wins.
// The /scoreboard path is ESPN's documented golf endpoint; the older
// /leaderboard path 404s, so it's only a last-resort fallback.
const ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard',
  'https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard',
];

export interface EspnAthlete {
  id: string;
  displayName: string;
  first: string;
  last: string;
  /** Total score to par; null if not available. */
  toPar: number | null;
  /** Round 1 score to par; null if not available. */
  round1: number | null;
  missedCut: boolean;
  position?: string;
  thru?: string;
  rawStatus?: string;
  /** Raw score value ESPN sent, for debugging (may be "CUT"/"WD"). */
  rawScore?: string;
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

// Substrings that always mean "didn't make it to the weekend".
const CUT_WORDS = /(cut|withdr|disqual|forfeit|did not finish)/i;
// Standalone abbreviations (handles "STATUS_WD", "T-MC", "MC", etc.).
const CUT_TOKENS = new Set(['mc', 'wd', 'wdr', 'dq', 'dsq', 'mdf', 'dnf', 'dns']);

function looksCut(...texts: (unknown | undefined)[]): boolean {
  for (const t of texts) {
    if (typeof t !== 'string' || t === '') continue;
    const s = t.toLowerCase();
    // Matches "STATUS_CUT", "Cut", "Missed Cut", "Withdrawn", etc.
    if (CUT_WORDS.test(s)) return true;
    for (const tok of s.split(/[^a-z]+/)) {
      if (tok && CUT_TOKENS.has(tok)) return true;
    }
  }
  return false;
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

  // Per-round figures live in linescores[]. The tiebreaker is the amateur's
  // score at the END OF ROUND 1 (strokes, e.g. 72) — matching the pool sheet.
  let round1: number | null = null;
  const lines = c?.linescores;
  if (Array.isArray(lines) && lines.length > 0) {
    const r1 =
      lines.find((l: any) => (l?.period ?? l?.round) === 1) ?? lines[0];
    // linescore.value is the round's stroke total; prefer it.
    round1 =
      parToNumber(r1?.value) ??
      parToNumber(r1?.displayValue) ??
      parToNumber(r1?.toPar);
  }

  const rawStatus =
    status?.type?.description ??
    status?.type?.name ??
    status?.type?.shortDetail ??
    position ??
    '';

  const missedCut =
    looksCut(
      position,
      rawStatus,
      status?.type?.name,
      status?.type?.id,
      status?.type?.detail,
      status?.type?.shortDetail,
      status?.type?.description,
      typeof scoreRaw === 'string' ? scoreRaw : undefined,
    ) ||
    positionId === '0' ||
    c?.didNotMakeCut === true ||
    c?.cut === true;

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
    round1,
    missedCut,
    position: typeof position === 'string' ? position : undefined,
    thru,
    rawStatus: typeof rawStatus === 'string' ? rawStatus : undefined,
    rawScore:
      scoreRaw == null
        ? undefined
        : typeof scoreRaw === 'object'
          ? JSON.stringify(scoreRaw)
          : String(scoreRaw),
    isAmateur: athlete?.amateur === true || /\(a\)/i.test(displayName),
  };
}

/** Count competitors in an event, to spot the one that actually has a field. */
function eventSize(ev: any): number {
  return (ev?.competitions?.[0]?.competitors ?? ev?.competitors ?? []).length;
}

/** Pick the most relevant event: prefer "US Open", then in-progress, then biggest. */
function pickEvent(events: any[]): any {
  if (!Array.isArray(events) || events.length === 0) return {};
  const named = events.find((e) =>
    /u\.?s\.?\s*open/i.test(`${e?.name ?? ''} ${e?.shortName ?? ''}`),
  );
  if (named && eventSize(named) > 0) return named;
  const live = events.find(
    (e) =>
      (e?.competitions?.[0]?.status?.type?.state ?? e?.status?.type?.state) ===
        'in' && eventSize(e) > 0,
  );
  if (live) return live;
  return [...events].sort((a, b) => eventSize(b) - eventSize(a))[0] ?? events[0];
}

async function fetchFirstWorking(signal?: AbortSignal): Promise<any> {
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        lastErr = new Error(`ESPN ${res.status} ${res.statusText} (${url})`);
        continue;
      }
      const data = await res.json();
      if (data?.events?.length) return data;
      lastErr = new Error(`ESPN returned no events (${url})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Could not reach ESPN golf API.');
}

export async function fetchLeaderboard(
  signal?: AbortSignal,
): Promise<EspnLeaderboard> {
  const data: any = await fetchFirstWorking(signal);

  const event = pickEvent(data?.events ?? []);
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
