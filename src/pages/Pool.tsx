import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchLeaderboard } from '../pool/espn';
import type { EspnLeaderboard } from '../pool/espn';
import { buildIndex, scoreAllPlayers } from '../pool/matching';
import { scoreStandings, formatToPar, formatTiebreak } from '../pool/scoring';
import {
  DEFAULT_ENTRIES,
  PAYOUTS,
  loadStoredEntries,
  storeEntries,
  parsePicks,
} from '../pool/entries';
import { ALL_PLAYERS } from '../pool/players';
import type { Entry, PlayerScore, ScoredEntry, ScoredPick } from '../pool/types';
import './Pool.css';

const REFRESH_MS = 90_000;

export default function Pool() {
  const [entries, setEntries] = useState<Entry[]>(
    () => loadStoredEntries() ?? DEFAULT_ENTRIES,
  );
  const [board, setBoard] = useState<EspnLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(entries.length === 0);
  const [pasteText, setPasteText] = useState('');
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Pool rule: only your best 4 of 5 count (drop your worst). Default on.
  const [dropWorst, setDropWorst] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setBoard(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load the ESPN leaderboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  // Score map: pool player id -> live score.
  const scores: Map<string, PlayerScore> = useMemo(() => {
    if (!board) return new Map();
    const index = buildIndex(board.athletes);
    return scoreAllPlayers(index);
  }, [board]);

  const standings: ScoredEntry[] = useMemo(() => {
    if (!board) return [];
    return scoreStandings(entries, scores, { dropWorst });
  }, [entries, scores, board, dropWorst]);

  // Diagnostics: pool players that could not be matched to an ESPN athlete.
  const unmatched = useMemo(() => {
    if (!board) return [];
    return ALL_PLAYERS.filter((p) => scores.get(p.id)?.unmatched).map(
      (p) => `${p.group}: ${p.label}`,
    );
  }, [board, scores]);

  const handleImport = () => {
    const result = parsePicks(pasteText);
    setImportWarnings(result.warnings);
    if (result.entries.length > 0) {
      setEntries(result.entries);
      storeEntries(result.entries);
      setShowImport(false);
    }
  };

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const eligibleCount = standings.filter((e) => e.eligible).length;

  return (
    <div className="pool">
      <header className="pool-header">
        <div>
          <h1>US Open Pool</h1>
          <p className="pool-sub">
            {board ? board.meta.eventName : 'Loading tournament…'}
            {board && <span className="dot"> • </span>}
            {board && <span className="pool-state">{board.meta.detail}</span>}
          </p>
        </div>
        <div className="pool-actions">
          <label className="auto-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={refresh} disabled={loading} className="btn">
            {loading ? 'Refreshing…' : 'Refresh scores'}
          </button>
        </div>
      </header>

      {lastUpdated && (
        <p className="pool-meta">
          Scores updated {lastUpdated}
          {board?.meta.cutApplied
            ? ' • cut applied'
            : ' • cut not yet applied'}
          {' • '}
          {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} •{' '}
          {eligibleCount} eligible
        </p>
      )}

      {error && (
        <div className="pool-error">
          <strong>Couldn't load scores:</strong> {error}
          <div className="hint">
            ESPN's leaderboard is fetched live in your browser. If this keeps
            failing, ESPN may be between tournaments or temporarily blocking
            requests — try again shortly.
          </div>
        </div>
      )}

      {!showImport && (
        <div className="toolbar">
          <button className="btn ghost" onClick={() => setShowImport(true)}>
            Edit picks
          </button>
        </div>
      )}

      {showImport && (
        <section className="import">
          <h2>Paste picks</h2>
          <p className="import-help">
            One entry per line, columns separated by commas or tabs (paste
            straight from Google Sheets):
            <br />
            <code>Name, A, B, C, D, E, F</code>
            <br />
            <span className="muted">
              Example: <code>Anand, McIlroy, Burns, Matsuyama, Clark, Grillo, Coody</code>
            </span>
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={'Name, A, B, C, D, E, F\n…'}
            rows={8}
          />
          <div className="import-actions">
            <button className="btn" onClick={handleImport}>
              Load picks
            </button>
            {entries.length > 0 && (
              <button className="btn ghost" onClick={() => setShowImport(false)}>
                Cancel
              </button>
            )}
          </div>
          {importWarnings.length > 0 && (
            <div className="warnings">
              <strong>{importWarnings.length} warning(s):</strong>
              <ul>
                {importWarnings.slice(0, 30).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {board && entries.length > 0 && (
        <section className="standings">
          <h2>Leaderboard</h2>
          <div className="payouts">
            {PAYOUTS.map((p, i) => {
              const winner = standings.find((e) => e.rank === i + 1);
              return (
                <span key={p.place} className="payout">
                  <b>{p.place}</b> ${p.amount}
                  {winner ? ` · ${winner.name}` : ''}
                </span>
              );
            })}
          </div>
          <div className="scoring-bar">
            <label className="switch">
              <input
                type="checkbox"
                checked={dropWorst}
                onChange={(e) => setDropWorst(e.target.checked)}
              />
              <span className="track"><span className="thumb" /></span>
              <span className="switch-label">
                Best 4 of 5
                <small>
                  {dropWorst
                    ? 'Dropping each entry’s worst score'
                    : 'Summing every made-cut pick'}
                </small>
              </span>
            </label>
          </div>
          <table>
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Entry</th>
                <th className="num">Total</th>
                <th className="num">Status</th>
                <th className="num">Tiebreak</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {standings.map((e) => (
                <EntryRow
                  key={e.name}
                  entry={e}
                  open={expanded.has(e.name)}
                  cutApplied={board.meta.cutApplied}
                  onToggle={() => toggle(e.name)}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      {unmatched.length > 0 && (
        <details className="diag">
          <summary>{unmatched.length} player(s) not matched to ESPN</summary>
          <p className="muted">
            These pool players couldn't be found on the current ESPN
            leaderboard (wrong tournament, name spelling, or not in the field).
            Picks of these players won't score until matched.
          </p>
          <ul>
            {unmatched.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      )}

      {board && (
        <details className="diag">
          <summary>
            ESPN debug — {board.athletes.length} players,{' '}
            {board.athletes.filter((a) => a.missedCut).length} detected as cut
          </summary>
          <p className="muted">
            Raw fields straight from ESPN. Find a player you KNOW missed the cut
            and screenshot their row — the <code>position</code> /{' '}
            <code>rawStatus</code> / <code>score</code> values tell me how ESPN
            marks a cut so I can fix detection.
          </p>
          <div className="debug-scroll">
            <table className="debug-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="num">toPar</th>
                  <th>rawScore</th>
                  <th>thru</th>
                  <th>position</th>
                  <th>rawStatus</th>
                  <th>cut?</th>
                </tr>
              </thead>
              <tbody>
                {board.athletes.map((a) => (
                  <tr key={a.id} className={a.missedCut ? 'is-cut' : ''}>
                    <td>{a.displayName}</td>
                    <td className="num">
                      {a.toPar === null ? '—' : formatToPar(a.toPar)}
                    </td>
                    <td>{a.rawScore ?? '—'}</td>
                    <td>{a.thru ?? '—'}</td>
                    <td>{a.position ?? '—'}</td>
                    <td>{a.rawStatus ?? '—'}</td>
                    <td>{a.missedCut ? 'CUT' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  open,
  cutApplied,
  onToggle,
}: {
  entry: ScoredEntry;
  open: boolean;
  cutApplied: boolean;
  onToggle: () => void;
}) {
  // Once the cut is applied, 2+ missed-cut picks means permanent elimination.
  const eliminated = cutApplied && entry.missedCutCount >= 2;
  const rowClass = eliminated ? 'eliminated' : entry.eligible ? '' : 'ineligible';
  return (
    <>
      <tr className={rowClass} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <td className="rank">{eliminated ? '✕' : (entry.rank ?? '—')}</td>
        <td>{entry.name}</td>
        <td className="num strong">
          {entry.eligible ? formatToPar(entry.total) : '—'}
        </td>
        <td className="num">
          {eliminated ? (
            <span className="badge out">Eliminated</span>
          ) : entry.missedCutCount > 0 ? (
            <span className="cut-note">{entry.missedCutCount} cut</span>
          ) : (
            'In'
          )}
        </td>
        <td className="num">{formatTiebreak(entry.tiebreaker)}</td>
        <td className="num caret">{open ? '▾' : '▸'}</td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={6}>
            <table className="picks-table">
              <thead>
                <tr>
                  <th className="grp">Grp</th>
                  <th>Player</th>
                  <th className="num">Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entry.picks.map((p) => {
                  const rowClass = p.counted
                    ? 'r-counts'
                    : p.score.missedCut
                      ? 'r-cut'
                      : 'r-dropped';
                  return (
                    <tr key={p.group} className={rowClass}>
                      <td className="grp">{p.group}</td>
                      <td>{p.label}</td>
                      <td className="num score">
                        {p.score.unmatched
                          ? '—'
                          : p.score.missedCut
                            ? 'Cut'
                            : formatToPar(p.score.toPar)}
                      </td>
                      <td>{statusBadge(p)}</td>
                    </tr>
                  );
                })}
                {entry.amateurLabel && (
                  <tr className="r-amateur">
                    <td className="grp">F</td>
                    <td>{entry.amateurLabel}</td>
                    <td className="num score">
                      {formatTiebreak(entry.tiebreaker)}
                    </td>
                    <td>
                      <span className="status tiebreak">Tiebreaker · R1</span>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="grp"></td>
                  <td>Total (best 4 count)</td>
                  <td className="num score strong">
                    {entry.eligible ? formatToPar(entry.total) : '—'}
                  </td>
                  <td className="muted">
                    {entry.eligible
                      ? `${entry.picks.filter((p) => p.counted).length} counted, 1 dropped`
                      : `${entry.madeCutCount}/5 made cut — need 4`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function statusBadge(p: ScoredPick) {
  if (p.counted) return <span className="status counts">✓ Counts</span>;
  if (p.dropReason === 'missed-cut')
    return <span className="status cut">Cut — no score</span>;
  if (p.dropReason === 'unmatched')
    return <span className="status none">No ESPN match</span>;
  return <span className="status dropped">▼ Dropped (worst)</span>;
}
