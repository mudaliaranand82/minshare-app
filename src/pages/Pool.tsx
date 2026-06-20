import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchLeaderboard } from '../pool/espn';
import type { EspnLeaderboard } from '../pool/espn';
import { buildIndex, scoreAllPlayers } from '../pool/matching';
import { scoreStandings, formatToPar } from '../pool/scoring';
import { buildEmail } from '../pool/email';
import {
  DEFAULT_ENTRIES,
  loadStoredEntries,
  storeEntries,
  clearStoredEntries,
  parsePicks,
} from '../pool/entries';
import { ALL_PLAYERS } from '../pool/players';
import type { Entry, PlayerScore, ScoredEntry } from '../pool/types';
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
  const [copied, setCopied] = useState(false);

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
    return scoreStandings(entries, scores);
  }, [entries, scores, board]);

  const emailText = useMemo(() => {
    if (!board || standings.length === 0) return '';
    return buildEmail(standings, board.meta);
  }, [standings, board]);

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

  const handleClear = () => {
    clearStoredEntries();
    setEntries([]);
    setShowImport(true);
  };

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked; the textarea is selectable as a fallback */
    }
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
          <button className="btn ghost" onClick={handleClear}>
            Clear picks
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
          <table>
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Entry</th>
                <th className="num">Total</th>
                <th className="num">Cut</th>
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
                  onToggle={() => toggle(e.name)}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      {emailText && (
        <section className="email">
          <div className="email-head">
            <h2>Results email</h2>
            <button className="btn" onClick={copyEmail}>
              {copied ? 'Copied!' : 'Copy email'}
            </button>
          </div>
          <textarea readOnly value={emailText} rows={16} className="email-body" />
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
    </div>
  );
}

function EntryRow({
  entry,
  open,
  onToggle,
}: {
  entry: ScoredEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={entry.eligible ? '' : 'ineligible'}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <td className="rank">{entry.rank ?? '—'}</td>
        <td>{entry.name}</td>
        <td className="num strong">
          {entry.eligible ? formatToPar(entry.total) : '—'}
        </td>
        <td className="num">
          {entry.madeCutCount}/5
          {!entry.eligible && <span className="badge">need 4</span>}
        </td>
        <td className="num">{formatToPar(entry.tiebreaker)}</td>
        <td className="num caret">{open ? '▾' : '▸'}</td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={6}>
            <div className="picks">
              {entry.picks.map((p) => (
                <div
                  key={p.group}
                  className={`pick ${p.counted ? 'counted' : 'dropped'}`}
                >
                  <span className="grp">{p.group}</span>
                  <span className="plabel">{p.label}</span>
                  <span className="pscore">
                    {p.score.unmatched
                      ? 'no match'
                      : p.score.missedCut
                        ? 'MC'
                        : formatToPar(p.score.toPar)}
                  </span>
                  {p.counted ? (
                    <span className="tag ok">counts</span>
                  ) : (
                    <span className="tag">{dropLabel(p.dropReason)}</span>
                  )}
                </div>
              ))}
              {entry.amateurLabel && (
                <div className="pick amateur">
                  <span className="grp">F</span>
                  <span className="plabel">{entry.amateurLabel}</span>
                  <span className="pscore">
                    R1 {formatToPar(entry.tiebreaker)}
                  </span>
                  <span className="tag">tiebreak</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function dropLabel(reason?: string): string {
  switch (reason) {
    case 'missed-cut':
      return 'missed cut';
    case 'worst-performer':
      return 'dropped (worst)';
    case 'unmatched':
      return 'no match';
    default:
      return 'not counted';
  }
}
