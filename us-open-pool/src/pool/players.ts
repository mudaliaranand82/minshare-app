// The 2026 US Open (Shinnecock Hills) field, organised exactly as Mike's
// Google Sheet ("US Open" → Picks tab → Options A..E + Amateur) defines it.
//
// IMPORTANT: this matches the SHEET, which differs from the original rules
// email. In the sheet, Group E is one large merged list and there is a
// separate Amateur list (Group F here) used only for the tiebreaker.
//
// `label` matches the sheet exactly. `first` is supplied only where a last
// name is shared by players across groups, so we can line the pick up with the
// right ESPN athlete (ESPN uses full "First Last" display names).

import type { Player } from './types';

type Seed = Omit<Player, 'id' | 'group'>;

function build(group: Player['group'], seeds: Seed[]): Player[] {
  return seeds.map((s, i) => ({
    ...s,
    group,
    id: `${group}-${i}-${s.last.toLowerCase().replace(/[^a-z]/g, '')}`,
  }));
}

// ---- Group A (Options A) ----
const A: Seed[] = [
  { label: 'McIlroy', last: 'McIlroy' },
  { label: 'Rahm', last: 'Rahm' },
  { label: 'Schauffele', last: 'Schauffele' },
  { label: 'Scheffler', last: 'Scheffler' },
  { label: 'Young', last: 'Young', first: 'Cameron' },
];

// ---- Group B (Options B) ----
const B: Seed[] = [
  { label: 'Aberg', last: 'Aberg' },
  { label: 'Burns', last: 'Burns' },
  { label: 'DeChambeau', last: 'DeChambeau' },
  { label: 'Fitzpatrick, M.', last: 'Fitzpatrick', first: 'Matt' },
  { label: 'Fleetwood', last: 'Fleetwood' },
  { label: 'Henley', last: 'Henley' },
  { label: 'Kim, Si Woo', last: 'Kim', first: 'Si Woo' },
  { label: 'Koepka', last: 'Koepka' },
  { label: 'Lee, Min Woo', last: 'Lee', first: 'Min Woo' },
  { label: 'Morikawa', last: 'Morikawa' },
  { label: 'Rose', last: 'Rose' },
  { label: 'Smith, Cam', last: 'Smith', first: 'Cameron' },
  { label: 'Spieth', last: 'Spieth' },
  { label: 'Thomas', last: 'Thomas', first: 'Justin' },
];

// ---- Group C (Options C) ----
const C: Seed[] = [
  { label: 'Berger', last: 'Berger' },
  { label: 'Bhatia', last: 'Bhatia' },
  { label: 'Brideman', last: 'Brideman' },
  { label: 'Cantlay', last: 'Cantlay' },
  { label: 'Day', last: 'Day' },
  { label: 'English', last: 'English' },
  { label: 'Fowler', last: 'Fowler' },
  { label: 'Gotterup', last: 'Gotterup' },
  { label: 'Hatton', last: 'Hatton' },
  { label: 'Hojgaard', last: 'Hojgaard' },
  { label: 'Holmes', last: 'Holmes' },
  { label: 'Hovland', last: 'Hovland' },
  { label: 'Im', last: 'Im' },
  { label: 'Kim, Michael', last: 'Kim', first: 'Michael' },
  { label: 'Lowry', last: 'Lowry' },
  { label: 'Matsuyama', last: 'Matsuyama' },
  { label: 'Niemann', last: 'Niemann' },
  { label: 'Rai', last: 'Rai' },
  { label: 'Reed', last: 'Reed' },
  { label: 'Scott', last: 'Scott', first: 'Adam' },
  { label: 'Spaun', last: 'Spaun' },
  { label: 'Straka', last: 'Straka' },
  { label: 'Taylor', last: 'Taylor', first: 'Nick' },
  { label: 'Theegala', last: 'Theegala' },
  { label: 'Woodland', last: 'Woodland' },
];

// ---- Group D (Options D) ----
const D: Seed[] = [
  { label: 'Bradley', last: 'Bradley' },
  { label: 'Brennan', last: 'Brennan' },
  { label: 'Clark', last: 'Clark', first: 'Wyndham' },
  { label: 'Conners', last: 'Conners' },
  { label: 'Echavarria', last: 'Echavarria' },
  { label: 'Fox', last: 'Fox' },
  { label: 'Griffin', last: 'Griffin' },
  { label: 'Harman', last: 'Harman' },
  { label: 'Harrington', last: 'Harrington' },
  { label: 'Hisatsune', last: 'Hisatsune' },
  { label: 'Horschel', last: 'Horschel' },
  { label: 'Johnson', last: 'Johnson' },
  { label: 'Kim, Tom', last: 'Kim', first: 'Tom' },
  { label: 'Kitayama', last: 'Kitayama' },
  { label: 'MacIntyre', last: 'MacIntyre' },
  { label: 'McNealy', last: 'McNealy' },
  { label: 'Noren', last: 'Noren' },
  { label: 'Ortiz', last: 'Ortiz' },
  { label: 'Puig', last: 'Puig' },
  { label: 'Reitan', last: 'Reitan' },
  { label: 'Saddier', last: 'Saddier' },
  { label: 'Schmid', last: 'Schmid' },
  { label: 'Shah', last: 'Shah' },
  { label: 'Smalley', last: 'Smalley' },
  { label: 'Stevens', last: 'Stevens' },
  { label: 'Thompson', last: 'Thompson', first: 'Davis' },
  { label: 'Wu, Brandon', last: 'Wu', first: 'Brandon' },
  { label: 'Wu, Dylan', last: 'Wu', first: 'Dylan' },
];

// ---- Group E (Options E) — the large merged list ----
const E: Seed[] = [
  { label: 'Blair', last: 'Blair' },
  { label: 'Canter', last: 'Canter' },
  { label: 'Celli', last: 'Celli' },
  { label: 'Coody', last: 'Coody' },
  { label: 'Coussaud', last: 'Coussaud' },
  { label: 'de Chassart', last: 'de Chassart' },
  { label: 'Dossey', last: 'Dossey' },
  { label: 'Fitzpatrick, A.', last: 'Fitzpatrick', first: 'Alex' },
  { label: 'Gerard', last: 'Gerard' },
  { label: 'Greyserman', last: 'Greyserman' },
  { label: 'Grillo', last: 'Grillo' },
  { label: 'Hall', last: 'Hall' },
  { label: 'Hammer', last: 'Hammer' },
  { label: 'Hardy', last: 'Hardy' },
  { label: 'Herbert', last: 'Herbert' },
  { label: 'Hidalgo', last: 'Hidalgo' },
  { label: 'Higgins', last: 'Higgins' },
  { label: 'James', last: 'James' },
  { label: 'Jordan', last: 'Jordan' },
  { label: 'Keefer', last: 'Keefer' },
  { label: 'Kim, TK', last: 'Kim', first: 'TK' },
  { label: 'Kimsey', last: 'Kimsey' },
  { label: 'Kirk', last: 'Kirk' },
  { label: 'Knapp', last: 'Knapp' },
  { label: 'Kohles', last: 'Kohles' },
  { label: 'Leach', last: 'Leach' },
  { label: 'McCarty', last: 'McCarty' },
  { label: 'McDowell', last: 'McDowell' },
  { label: 'McGreevy', last: 'McGreevy' },
  { label: 'Mitchell', last: 'Mitchell' },
  { label: 'Montgomery', last: 'Montgomery' },
  { label: 'Mouw', last: 'Mouw' },
  { label: 'Nicholas', last: 'Nicholas' },
  { label: 'Norgaard', last: 'Norgaard' },
  { label: 'Novak', last: 'Novak' },
  { label: 'Oiwa', last: 'Oiwa' },
  { label: 'Onishi', last: 'Onishi' },
  { label: 'Parry', last: 'Parry' },
  { label: 'Peacock', last: 'Peacock' },
  { label: 'Phillips', last: 'Phillips' },
  { label: 'Putnam', last: 'Putnam' },
  { label: 'Repetto-Taylor', last: 'Repetto-Taylor' },
  { label: 'Rodgers', last: 'Rodgers' },
  { label: 'Roy', last: 'Roy' },
  { label: 'Rozo', last: 'Rozo' },
  { label: 'Sato', last: 'Sato' },
  { label: 'Schaper', last: 'Schaper' },
  { label: 'Shipley', last: 'Shipley' },
  { label: 'Silverman', last: 'Silverman' },
  { label: 'Sollon', last: 'Sollon' },
  { label: 'Stanger', last: 'Stanger' },
  { label: 'Suber', last: 'Suber' },
  { label: 'Surratt', last: 'Surratt' },
  { label: 'Tosti', last: 'Tosti' },
  { label: 'Uihlein', last: 'Uihlein' },
  { label: 'Van Paris', last: 'Van Paris' },
  { label: 'Yellamaraju', last: 'Yellamaraju' },
  { label: 'Yuan', last: 'Yuan' },
];

// ---- Amateurs (Group F) — tiebreaker only (Round-1 score) ----
const F: Seed[] = [
  { label: 'Coleman', last: 'Coleman' },
  { label: 'Cowan', last: 'Cowan' },
  { label: 'Fang', last: 'Fang' },
  { label: 'Fleming', last: 'Fleming' },
  { label: 'Harber', last: 'Harber' },
  { label: 'Herrington', last: 'Herrington' },
  { label: 'Holtz', last: 'Holtz' },
  { label: 'Howell', last: 'Howell' },
  { label: 'Koivun', last: 'Koivun' },
  { label: 'Kyes', last: 'Kyes' },
  { label: 'Lee, Bryan', last: 'Lee', first: 'Bryan' },
  { label: 'Lee, Eric', last: 'Lee', first: 'Eric' },
  { label: 'Ormond', last: 'Ormond' },
  { label: 'Puebla', last: 'Puebla' },
  { label: 'Pulcini', last: 'Pulcini' },
  { label: 'Reilly', last: 'Reilly' },
  { label: 'Robles', last: 'Robles' },
  { label: 'Russell', last: 'Russell' },
  { label: 'Stout', last: 'Stout' },
  { label: 'Sveinsson', last: 'Sveinsson' },
];

export const GROUPS: Record<Player['group'], Player[]> = {
  A: build('A', A),
  B: build('B', B),
  C: build('C', C),
  D: build('D', D),
  E: build('E', E),
  F: build('F', F),
};

export const ALL_PLAYERS: Player[] = Object.values(GROUPS).flat();

const BY_ID = new Map(ALL_PLAYERS.map((p) => [p.id, p]));

export function getPlayer(id: string): Player | undefined {
  return BY_ID.get(id);
}

/** Normalised key for label matching (drops punctuation/spaces/case). */
function normLabel(s: string): string {
  return s.toLowerCase().replace(/[.,()\-\s]/g, '');
}

/** Find a player id by its sheet label within a group (used when importing picks). */
export function findPlayerIdByLabel(
  group: Player['group'],
  label: string,
): string | undefined {
  const target = normLabel(label);
  const match = GROUPS[group].find(
    (p) => normLabel(p.label) === target || normLabel(p.last) === target,
  );
  return match?.id;
}
