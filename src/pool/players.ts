// The 2026 US Open (Shinnecock Hills) field, organised into Mike's groups.
// Source: Michael Reardon's "US Open picks" email.
//
// `label` matches the pool sheet exactly. `first` is supplied only where the
// last name is ambiguous (multiple players share it) or where ESPN's display
// name needs the first name to disambiguate.

import type { Player } from './types';

type Seed = Omit<Player, 'id' | 'group'>;

function build(group: Player['group'], seeds: Seed[]): Player[] {
  return seeds.map((s, i) => ({
    ...s,
    group,
    id: `${group}-${i}-${s.last.toLowerCase().replace(/[^a-z]/g, '')}`,
  }));
}

const A: Seed[] = [
  { label: 'McIlroy', last: 'McIlroy' },
  { label: 'Rahm', last: 'Rahm' },
  { label: 'Schauffele', last: 'Schauffele' },
  { label: 'Scheffler', last: 'Scheffler' },
  { label: 'Young', last: 'Young' },
];

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

const C: Seed[] = [
  { label: 'Berger', last: 'Berger' },
  { label: 'Bhatia', last: 'Bhatia' },
  { label: 'Bridgeman', last: 'Bridgeman' },
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
  { label: 'Scott', last: 'Scott' },
  { label: 'Spaun', last: 'Spaun' },
  { label: 'Straka', last: 'Straka' },
  { label: 'Taylor', last: 'Taylor', first: 'Nick' },
  { label: 'Theegala', last: 'Theegala' },
  { label: 'Woodland', last: 'Woodland' },
];

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

const E: Seed[] = [
  { label: 'Canter', last: 'Canter' },
  { label: 'Celli', last: 'Celli' },
  { label: 'de Chassart', last: 'de Chassart' },
  { label: 'Fitzpatrick, A.', last: 'Fitzpatrick', first: 'Alex' },
  { label: 'Gerard', last: 'Gerard' },
  { label: 'Greyserman', last: 'Greyserman' },
  { label: 'Grillo', last: 'Grillo' },
  { label: 'Hall', last: 'Hall' },
  { label: 'Hidalgo', last: 'Hidalgo' },
  { label: 'Jordan', last: 'Jordan' },
  { label: 'Kim, TK', last: 'Kim', first: 'Tom Kim' },
  { label: 'Kirk', last: 'Kirk' },
  { label: 'Knapp', last: 'Knapp' },
  { label: 'McCarty', last: 'McCarty' },
  { label: 'McDowell', last: 'McDowell' },
  { label: 'Mitchell', last: 'Mitchell' },
  { label: 'Mouw', last: 'Mouw' },
  { label: 'Norgaard', last: 'Norgaard' },
  { label: 'Novak', last: 'Novak' },
  { label: 'Onishi', last: 'Onishi' },
  { label: 'Parry', last: 'Parry' },
  { label: 'Putnam', last: 'Putnam' },
  { label: 'Rodgers', last: 'Rodgers' },
  { label: 'Schaper', last: 'Schaper' },
  { label: 'Shipley', last: 'Shipley' },
  { label: 'Stanger', last: 'Stanger' },
  { label: 'Uihlein', last: 'Uihlein' },
  { label: 'Van Paris', last: 'Van Paris' },
  { label: 'Yellamaraju', last: 'Yellamaraju' },
];

// Group F = Amateurs. Tiebreaker only (round-1 score).
const F: Seed[] = [
  { label: 'Blair', last: 'Blair' },
  { label: 'Coody', last: 'Coody' },
  { label: 'Coussaud', last: 'Coussaud' },
  { label: 'Hammer', last: 'Hammer' },
  { label: 'Hardy', last: 'Hardy' },
  { label: 'Herbert', last: 'Herbert' },
  { label: 'Higgins', last: 'Higgins' },
  { label: 'James', last: 'James' },
  { label: 'Keefer', last: 'Keefer' },
  { label: 'Kimsey', last: 'Kimsey' },
  { label: 'Kohles', last: 'Kohles' },
  { label: 'Leach', last: 'Leach' },
  { label: 'McGreevy', last: 'McGreevy' },
  { label: 'Montgomery', last: 'Montgomery' },
  { label: 'Nicholas', last: 'Nicholas' },
  { label: 'Oiwa', last: 'Oiwa' },
  { label: 'Peacock', last: 'Peacock' },
  { label: 'Phillips', last: 'Phillips' },
  { label: 'Repetto-Taylor', last: 'Repetto-Taylor' },
  { label: 'Roy', last: 'Roy' },
  { label: 'Rozo', last: 'Rozo' },
  { label: 'Sato', last: 'Sato' },
  { label: 'Silverman', last: 'Silverman' },
  { label: 'Sollon', last: 'Sollon' },
  { label: 'Suber', last: 'Suber' },
  { label: 'Surratt', last: 'Surratt' },
  { label: 'Tosti', last: 'Tosti' },
  { label: 'Yuan', last: 'Yuan' },
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

/** Find a player id by its sheet label within a group (used when importing picks). */
export function findPlayerIdByLabel(group: Player['group'], label: string): string | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[.,()\s]/g, '');
  const target = norm(label);
  const match = GROUPS[group].find(
    (p) => norm(p.label) === target || norm(p.last) === target,
  );
  return match?.id;
}
