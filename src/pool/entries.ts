// Pool entries (each person's picks). These are populated by pasting the
// picks sheet into the app's import box (stored in localStorage), or by
// editing DEFAULT_ENTRIES below.
//
// Import/paste format (CSV or TSV, one entry per row):
//   Name, A, B, C, D, E, F
// e.g.
//   Anand, McIlroy, Burns, Matsuyama, Clark, Grillo, Coody
// The F (amateur) column is optional but needed for tiebreakers.

import type { Entry, GroupId } from './types';
import { findPlayerIdByLabel } from './players';

/** Seed entries. Leave empty and use the import box, or hardcode here. */
export const DEFAULT_ENTRIES: Entry[] = [];

const GROUP_ORDER: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface ImportResult {
  entries: Entry[];
  warnings: string[];
}

/** Split a pasted line on tab or comma, respecting simple quoted cells. */
function splitCells(line: string): string[] {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const HEADER_RE = /^(name|entry|entrant|player|participant)?$|^[a-f]$|^group/i;

/**
 * Parse pasted CSV/TSV picks. First column = entrant name, the next columns
 * map to groups A,B,C,D,E,F in order. Each cell is matched to a player label;
 * unmatched cells are reported as warnings (and, where possible, matched
 * against any group as a fallback).
 */
export function parsePicks(text: string): ImportResult {
  const warnings: string[] = [];
  const entries: Entry[] = [];
  const rows = text
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  for (const row of rows) {
    const cells = splitCells(row);
    if (cells.length < 2) continue;

    // Skip an obvious header row (e.g. "Name, A, B, C, D, E, F").
    const isHeader =
      /^(name|entry|entrant|participant)$/i.test(cells[0]) &&
      cells.slice(1).every((c) => HEADER_RE.test(c));
    if (isHeader) continue;

    const name = cells[0];
    const picks: Partial<Record<GroupId, string>> = {};

    GROUP_ORDER.forEach((group, idx) => {
      const cell = cells[idx + 1];
      if (!cell) return;
      let id = findPlayerIdByLabel(group, cell);
      if (!id) {
        // Fallback: try every group in case columns are out of order.
        for (const g of GROUP_ORDER) {
          id = findPlayerIdByLabel(g, cell);
          if (id) break;
        }
      }
      if (id) picks[group] = id;
      else warnings.push(`"${name}": couldn't match "${cell}" in Group ${group}`);
    });

    if (Object.keys(picks).length > 0) entries.push({ name, picks });
    else warnings.push(`"${name}": no picks matched, row skipped`);
  }

  if (entries.length === 0 && rows.length > 0) {
    warnings.push('No entries parsed — check the paste format (Name, A, B, C, D, E, F).');
  }

  return { entries, warnings };
}

const STORAGE_KEY = 'usopen-pool-entries';

export function loadStoredEntries(): Entry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Entry[]) : null;
  } catch {
    return null;
  }
}

export function storeEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearStoredEntries(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
