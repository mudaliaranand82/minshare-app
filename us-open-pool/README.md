# US Open Pool

Automated leaderboard for the annual US Open golf pool. Pulls the live
leaderboard from ESPN's public golf API (in the browser), matches every
entrant's picks to their players, applies the pool rules, ranks the field,
and generates the results email.

## Rules implemented
- Pick one player from each group **A–E**, plus one **amateur (F)** for the tiebreaker.
- An entry must have **4 of 5 picks make the cut** to be eligible.
- **Default:** every made-cut pick is summed (matches the running sheet).
- **"Best 4 of 5" toggle:** drops each entry's worst score (the email's final rule).
- Ties broken by the amateur's **Round-1** score (lower wins).
- Payouts: 1st $400 · 2nd $175 · 3rd $120 · 4th $75 · 5th $25.

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Data
- `src/pool/players.ts` — the field, by group (mirrors the pool sheet's Options lists).
- `src/pool/entries.ts` — entrants' picks (edit here, or paste/import in the app).
- `src/pool/espn.ts` — live ESPN leaderboard fetch + normalisation.
- `src/pool/scoring.ts` — pool rules and ranking.
- `src/pool/email.ts` — results-email text.

Scores are always pulled live from ESPN; only picks are stored.
