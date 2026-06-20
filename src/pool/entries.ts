// Pool entries (each person's picks), transcribed from Mike's "US Open" sheet
// (Picks tab, rows 3-58). Only the picks are stored here — all scores, totals
// and tiebreakers are pulled live from ESPN.
//
// Columns per row: [name, A, B, C, D, E, Amateur(F)]
//
// Picks can also be replaced at runtime via the in-app paste box (stored in
// localStorage); the format there is: Name, A, B, C, D, E, F (comma/tab).

import type { Entry, GroupId } from './types';
import { findPlayerIdByLabel } from './players';

type Row = [string, string, string, string, string, string, string];

// Transcribed from the sheet. Labels match the Options lists exactly.
const SHEET_ROWS: Row[] = [
  ['Rob Ahern', 'McIlroy', 'DeChambeau', 'Scott', 'Bradley', 'Fitzpatrick, A.', 'Reilly'],
  ['Lee Allman', 'Schauffele', 'Smith, Cam', 'Cantlay', 'Bradley', 'Fitzpatrick, A.', 'Howell'],
  ['Marty Anthony', 'Rahm', 'Thomas', 'Matsuyama', 'MacIntyre', 'Greyserman', 'Koivun'],
  ['Marty Anthony 2', 'McIlroy', 'DeChambeau', 'Hovland', 'MacIntyre', 'Greyserman', 'Koivun'],
  ['Marty Anthony 3', 'Scheffler', 'Aberg', 'Hovland', 'MacIntyre', 'Greyserman', 'Koivun'],
  ['Ella Busby', 'McIlroy', 'Fleetwood', 'Cantlay', 'Griffin', 'Coody', 'Fang'],
  ['Shannon Busby', 'Scheffler', 'Thomas', 'Reed', 'Bradley', 'Knapp', 'Howell'],
  ['Tara Busby', 'McIlroy', 'Rose', 'Day', 'Fox', 'Tosti', 'Fang'],
  ['Bonnie Bush', 'Young', 'Henley', 'Berger', 'Smalley', 'Knapp', 'Fang'],
  ['Kevin Corbett', 'McIlroy', 'Burns', 'Gotterup', 'McNealy', 'Fitzpatrick, A.', 'Howell'],
  ['Tom Crotty', 'McIlroy', 'Spieth', 'Straka', 'Bradley', 'Hidalgo', 'Fleming'],
  ['Tom Crotty 2', 'Scheffler', 'DeChambeau', 'Day', 'Clark', 'Leach', 'Sveinsson'],
  ['Kevin Cwikla', 'McIlroy', 'Fleetwood', 'English', 'Clark', 'Gerard', 'Stout'],
  ['George Deeney', 'McIlroy', 'Fleetwood', 'Hatton', 'MacIntyre', 'Knapp', 'Fleming'],
  ['George Deeney 2', 'Scheffler', 'Fitzpatrick, M.', 'Hatton', 'Horschel', 'Shipley', 'Howell'],
  ['George Deeney 3', 'Rahm', 'Burns', 'Cantlay', 'Bradley', 'Kim, TK', 'Reilly'],
  ['Matt Evans', 'Scheffler', 'Fleetwood', 'Hatton', 'MacIntyre', 'Greyserman', 'Koivun'],
  ['Francesca Iacovangelo', 'Young', 'Fleetwood', 'Gotterup', 'MacIntyre', 'Fitzpatrick, A.', 'Koivun'],
  ['Alex Jamieson', 'Scheffler', 'Fitzpatrick, M.', 'Hatton', 'McNealy', 'Yellamaraju', 'Howell'],
  ['Chris Junkin', 'Scheffler', 'Henley', 'Gotterup', 'McNealy', 'Fitzpatrick, A.', 'Howell'],
  ['Mark Kaltenbach', 'Rahm', 'Spieth', 'Taylor', 'Thompson', 'Kirk', 'Ormond'],
  ['Jason Kaye', 'Scheffler', 'Thomas', 'Lowry', 'Reitan', 'Norgaard', 'Harber'],
  ['Tom Madden', 'McIlroy', 'DeChambeau', 'Hovland', 'Harman', 'Knapp', 'Coleman'],
  ['Marge Maloney', 'Young', 'Burns', 'Bhatia', 'McNealy', 'McGreevy', 'Harber'],
  ['Tricia Maloney', 'Rahm', 'Burns', 'Lowry', 'Clark', 'Gerard', 'Coleman'],
  ['Joe Maloney', 'Young', 'Aberg', 'Niemann', 'Griffin', 'Putnam', 'Lee, Bryan'],
  ['Rob Manfredo', 'Rahm', 'Fleetwood', 'Reed', 'Saddier', 'Knapp', 'Pulcini'],
  ['Anand Mudaliar', 'McIlroy', 'Burns', 'Matsuyama', 'Clark', 'Fitzpatrick, A.', 'Russell'],
  ['Liam Mullen', 'Scheffler', 'Fitzpatrick, M.', 'Cantlay', 'Kitayama', 'Kirk', 'Stout'],
  ['Martin Noci', 'Scheffler', 'Fleetwood', 'Cantlay', 'Conners', 'Knapp', 'Koivun'],
  ['Nate Nye', 'Scheffler', 'Burns', 'Gotterup', 'McNealy', 'Fitzpatrick, A.', 'Koivun'],
  ["Jeff O'Connor", 'Scheffler', 'Morikawa', 'Matsuyama', 'Conners', 'Shipley', 'Lee, Bryan'],
  ["Grif O'Donnell", 'McIlroy', 'Koepka', 'Hovland', 'Harman', 'McDowell', 'Pulcini'],
  ["Jake O'Donnell", 'Rahm', 'Fleetwood', 'Reed', 'Clark', 'Gerard', 'Koivun'],
  ['Ian Oakley', 'Scheffler', 'Rose', 'Gotterup', 'MacIntyre', 'Greyserman', 'Howell'],
  ['Brady Oleson', 'Scheffler', 'Fitzpatrick, M.', 'Hovland', 'Clark', 'Fitzpatrick, A.', 'Koivun'],
  ['Dennis Piccone', 'Scheffler', 'Koepka', 'Day', 'Horschel', 'Knapp', 'Pulcini'],
  ['Bob Reardon', 'Young', 'Fleetwood', 'Reed', 'Johnson', 'Greyserman', 'Reilly'],
  ['Charlotte Reardon', 'McIlroy', 'Henley', 'Hatton', 'MacIntyre', 'Knapp', 'Koivun'],
  ['Drew Reardon', 'Scheffler', 'Aberg', 'Spaun', 'McNealy', 'Fitzpatrick, A.', 'Koivun'],
  ['Hannah Reardon', 'Scheffler', 'Rose', 'Gotterup', 'Bradley', 'Knapp', 'Stout'],
  ['Mike Reardon', 'McIlroy', 'Fitzpatrick, M.', 'Matsuyama', 'Smalley', 'Kirk', 'Stout'],
  ['Cheo Scott', 'Scheffler', 'Fleetwood', 'Hatton', 'MacIntyre', 'Gerard', 'Stout'],
  ['Dave Shensky', 'Scheffler', 'Fleetwood', 'Hatton', 'Clark', 'Knapp', 'Cowan'],
  ['Dave Shensky 2', 'Scheffler', 'Fitzpatrick, M.', 'Hatton', 'Clark', 'Knapp', 'Koivun'],
  ['Dave Shensky 3', 'Scheffler', 'Aberg', 'Hatton', 'Clark', 'Knapp', 'Sveinsson'],
  ['Ed Stoloski', 'Scheffler', 'Fitzpatrick, M.', 'Reed', 'Clark', 'Grillo', 'Stout'],
  ['Steve Tear', 'Young', 'Fleetwood', 'Gotterup', 'Bradley', 'Fitzpatrick, A.', 'Koivun'],
  ['Steve Tear 2', 'Scheffler', 'Aberg', 'Hovland', 'MacIntyre', 'Mitchell', 'Koivun'],
  ['Bob Thomas', 'Schauffele', 'Fleetwood', 'Lowry', 'Puig', 'Fitzpatrick, A.', 'Coleman'],
  ['Bob Thomas 2', 'McIlroy', 'Kim, Si Woo', 'Matsuyama', 'Clark', 'Canter', 'Reilly'],
  ['Bob Thomas 3', 'Rahm', 'Spieth', 'Day', 'Harrington', 'Norgaard', 'Stout'],
  ['Phil Thorell', 'Scheffler', 'Koepka', 'Hovland', 'Conners', 'Fitzpatrick, A.', 'Sveinsson'],
  ['Rachel Thorell', 'Young', 'Aberg', 'Lowry', 'Harman', 'Yellamaraju', 'Coleman'],
  ['Jay Walker', 'Scheffler', 'Fitzpatrick, M.', 'Hatton', 'Clark', 'Greyserman', 'Koivun'],
  ['Jay Walker 2', 'McIlroy', 'Fleetwood', 'Hatton', 'Conners', 'Knapp', 'Russell'],
];

const GROUP_ORDER: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

function rowToEntry(row: Row): Entry {
  const [name, ...cells] = row;
  const picks: Partial<Record<GroupId, string>> = {};
  GROUP_ORDER.forEach((group, idx) => {
    const cell = cells[idx];
    if (!cell) return;
    const id = findPlayerIdByLabel(group, cell);
    if (id) picks[group] = id;
    // Unmatched cells are surfaced via the app's diagnostics, not thrown here.
  });
  return { name, picks };
}

/** The 56 entries from Mike's sheet. */
export const DEFAULT_ENTRIES: Entry[] = SHEET_ROWS.map(rowToEntry);

/** Payout structure from the sheet (top 5, pot of $795). */
export const PAYOUTS: { place: string; amount: number }[] = [
  { place: '1st', amount: 400 },
  { place: '2nd', amount: 175 },
  { place: '3rd', amount: 120 },
  { place: '4th', amount: 75 },
  { place: '5th', amount: 25 },
];

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

const HEADER_CELL_RE = /^(name|entry|entrant|player|participant|amateur)?$|^[a-f]$|^group/i;

/**
 * Parse pasted CSV/TSV picks. First column = entrant name, the next columns
 * map to groups A,B,C,D,E,F in order. Each cell is matched to a player label;
 * unmatched cells are reported as warnings (and tried against any group as a
 * fallback). Note: commas inside names (e.g. "Fitzpatrick, A.") require the
 * paste to be tab-separated or the name to be quoted.
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

    const isHeader =
      /^(name|entry|entrant|participant)$/i.test(cells[0]) &&
      cells.slice(1).every((c) => HEADER_CELL_RE.test(c));
    if (isHeader) continue;

    const name = cells[0];
    const picks: Partial<Record<GroupId, string>> = {};

    GROUP_ORDER.forEach((group, idx) => {
      const cell = cells[idx + 1];
      if (!cell) return;
      let id = findPlayerIdByLabel(group, cell);
      if (!id) {
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
