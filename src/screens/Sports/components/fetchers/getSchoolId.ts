// --- LEAGUE + SCHOOL -> SPORTNINJA ID LOOKUPS ---
//
// SportNinja issues a separate team id for each school in each league, so a
// school's id is only meaningful together with the league (schedule) id.
//
// Any id starting with PLACEHOLDER_ is "not filled in yet" and is never
// returned. League placeholders keep their old HCAA number for reference.

const PLACEHOLDER_PREFIX = 'PLACEHOLDER_';
const TBD = PLACEHOLDER_PREFIX;

export const isPlaceholderId = (id: string | undefined | null): boolean =>
    !id || id.startsWith(PLACEHOLDER_PREFIX);

// --- SCHOOLS ---

export const SCHOOLS = [
    'Assumption',
    'Bishop Reding',
    'Christ the King',
    'Holy Trinity',
    'Corpus Christi',
    'St. Francis Xavier',
    'Notre Dame',
    'St. Ignatius of Loyola',
    'St. Thomas Aquinas',
    'St. Kateri Tekakwitha',
] as const;

export type SchoolName = typeof SCHOOLS[number];

// --- LEAGUES ---

/** League name -> SportNinja schedule id. */
export const LEAGUES = {
    'Varsity Boys Baseball': 'XIe07x0pjT4sCCBh',
    'Junior Girls Basketball': 'QBx6I6iG0MdZAx8R',
    'Senior Girls Basketball': 'X75JR6J83JNHEp2I',
    'Junior Girls Field Hockey': 'biwtTVoCIhx5q3jq',
    'Senior Girls Field Hockey': 't2je0DByW7UGk9XI',
    'Junior Boys Football': 'HPnoqpYahXjVj3em',
    'Senior Boys Football': 'Fmmth77bLBTSKFuF',
    'Varsity Co-Ed Ultimate': 'PLACEHOLDER_LEGACY_28',
    'Junior Boys Volleyball': '312LCksejUyaAUUo',
    'Senior Boys Volleyball': 'YSkMUWgt8C0LhUKk',
    'Novice Boys Basketball': 'PLACEHOLDER_LEGACY_9',
    'Junior Boys Basketball': 'PLACEHOLDER_LEGACY_10',
    'Senior Boys Basketball': 'PLACEHOLDER_LEGACY_11',
    'Novice Co-Ed Curling': 'PLACEHOLDER_LEGACY_29',
    'Varsity Boys Curling': 'PLACEHOLDER_LEGACY_15',
    'Varsity Girls Curling': 'PLACEHOLDER_LEGACY_16',
    'Varsity Boys Hockey': 'PLACEHOLDER_LEGACY_17',
    'Varsity Girls Hockey': 'PLACEHOLDER_LEGACY_18',
    'Novice Girls Volleyball': 'PLACEHOLDER_LEGACY_12',
    'Junior Girls Volleyball': 'PLACEHOLDER_LEGACY_13',
    'Senior Girls Volleyball': 'PLACEHOLDER_LEGACY_14',
    'Tier 1 Varsity Co-Ed eSports': 'PLACEHOLDER_LEGACY_30',
    'Tier 2 Varsity Co-Ed eSports': 'PLACEHOLDER_LEGACY_31',
    'Varsity Girls Fastpitch': 'PLACEHOLDER_LEGACY_25',
    'Varsity Boys Lacrosse': 'a0BRQWBVYDoPNf9T',
    'Varsity Girls Lacrosse': 'PLACEHOLDER_LEGACY_32',
    'Senior Girls Rugby': 'PLACEHOLDER_LEGACY_24',
    'Varsity Girls Slowpitch': 'PLACEHOLDER_LEGACY_27',
    'Junior Boys Soccer': 'PLACEHOLDER_LEGACY_19',
    'Senior Boys Soccer': 'PLACEHOLDER_LEGACY_20',
    'Junior Girls Soccer': 'PLACEHOLDER_LEGACY_21',
    'Senior Girls Soccer': 'PLACEHOLDER_LEGACY_22',
} as const;

export type LeagueName = keyof typeof LEAGUES;

/**
 * Returns the SportNinja schedule id for a league name, or null if the name
 * is unknown or the id is still a placeholder.
 */
export const getLeagueId = (leagueName: string): string | null => {
    const id = LEAGUES[leagueName as LeagueName];
    if (!id) {
        console.warn(`[getLeagueId] Unknown league '${leagueName}'.`);
        return null;
    }
    if (isPlaceholderId(id)) {
        console.warn(`[getLeagueId] '${leagueName}' is still a placeholder.`);
        return null;
    }
    return id;
};

/** Reverse lookup: schedule id -> league name. */
const LEAGUE_NAME_BY_ID: Record<string, LeagueName> = Object.fromEntries(
    Object.entries(LEAGUES).map(([name, id]) => [id, name as LeagueName]),
);

/** Accepts either a league name or a SportNinja schedule id. */
const resolveLeagueName = (league: string): LeagueName | undefined =>
    league in LEAGUES ? (league as LeagueName) : LEAGUE_NAME_BY_ID[league];

// --- TEAM IDS ---

/**
 * League name -> school -> SportNinja team id.
 * Delete a school's line if it doesn't field a team in that league.
 */
const TEAM_IDS: Record<LeagueName, Partial<Record<SchoolName, string>>> = {
    'Varsity Boys Baseball': {
        'Assumption': '6TJd6LXcmny01xj3',
        'Bishop Reding': 'j0x6WMgt2CiDyEYs',
        'Christ the King': 'E7nn2kaDwaxCDLTN',
        'Holy Trinity': 'rx8ae0NRTiUBsUXX',
        'Corpus Christi': 'haBrJCtO2DQLlv66',
        'St. Francis Xavier': 'ItkNPamEwitq8GGh',
        'Notre Dame': 'PdtMUB7Sa8eKLQBz',
        'St. Ignatius of Loyola': 'SuXUql0rThX3Bu85',
        'St. Thomas Aquinas': '3lrHkTBLobhKxF6V',
        'St. Kateri Tekakwitha': 'K4elbgUAupgBidJq',
    },
    'Junior Girls Basketball': {
        'Assumption': 'h9jjYY7nOVLUmqMB',
        'Bishop Reding': 'NUt3cbSkhbbdkgI6',
        'Christ the King': 'dsQrSUESTwSEaSFg',
        'Holy Trinity': 'sDpZFuvBY1TJDrm0',
        'Corpus Christi': 'EyW1aLAOBFv9NaM8',
        'St. Francis Xavier': TBD,
        'Notre Dame': '1q0JE4U09j6YBneE',
        'St. Ignatius of Loyola': 'a2K5mxWTuHUGDJxe',
        'St. Thomas Aquinas': 't78GGqYNsBdKjdO2',
        'St. Kateri Tekakwitha': 'SOgOazkJXpE1b8NJ',
    },
    'Senior Girls Basketball': {
        'Assumption': 'h9jjYY7nOVLUmqMB',
        'Bishop Reding': 'NUt3cbSkhbbdkgI6',
        'Christ the King': 'dsQrSUESTwSEaSFg',
        'Holy Trinity': 'sDpZFuvBY1TJDrm0',
        'Corpus Christi': 'EyW1aLAOBFv9NaM8',
        'St. Francis Xavier': TBD,
        'Notre Dame': '1q0JE4U09j6YBneE',
        'St. Ignatius of Loyola': 'a2K5mxWTuHUGDJxe',
        'St. Thomas Aquinas': 't78GGqYNsBdKjdO2',
        'St. Kateri Tekakwitha': 'SOgOazkJXpE1b8NJ',
    },
    'Junior Girls Field Hockey': {
        'Assumption': 'DvpJt7k7saGQDGd5',
        'Bishop Reding': 'f3DUul9TZMLyHluM',
        'Christ the King': TBD,
        'Holy Trinity': 'SV6av701XiOoA6iq',
        'Corpus Christi':'ddaM7pj1acJPmCbn',
        'St. Francis Xavier': 'ii8RRR8rPcs8ikBI',
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': '5MdSVB2jUCATBbRx',
        'St. Kateri Tekakwitha': 'At6sWDV6FbplzIiQ',
    },
    'Senior Girls Field Hockey': {
        'Assumption': 'DvpJt7k7saGQDGd5',
        'Bishop Reding': 'f3DUul9TZMLyHluM',
        'Christ the King': '08dYMWFwxDJpU5mL',
        'Holy Trinity': 'SV6av701XiOoA6iq',
        'Corpus Christi': 'ddaM7pj1acJPmCbn',
        'St. Francis Xavier': 'ii8RRR8rPcs8ikBI',
        'Notre Dame': 'qFamHO4GRu3kOOl5',
        'St. Ignatius of Loyola': 'eUu4SgBJeEbq6f2m',
        'St. Thomas Aquinas': '5MdSVB2jUCATBbRx',
        'St. Kateri Tekakwitha': 'At6sWDV6FbplzIiQ',
    },
    'Junior Boys Football': {
        'Assumption': 'd067GGrzMdZChslX',
        'Bishop Reding': 'zx6d5kmHfnn5BMmg',
        'Christ the King': 'Des6qsUvxSPiUotE',
        'Holy Trinity': '0LDzQDEQNpKBA6eZ',
        'Corpus Christi': 'C3Mj6YtO02MI8Vpu',
        'St. Francis Xavier': '5P3s40PefYUjdRCk',
        'Notre Dame': 'CETRYsgnibGKVRsf',
        'St. Ignatius of Loyola': 'ma6nyQDEaFSfI8Iy',
        'St. Thomas Aquinas': 'RpJdYyxbAGbcdxgs',
        'St. Kateri Tekakwitha': 'at3nHbt59onXyIXY',
    },
    'Senior Boys Football': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': '0LDzQDEQNpKBA6eZ',
        'Corpus Christi': 'C3Mj6YtO02MI8Vpu',
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Co-Ed Ultimate': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Junior Boys Volleyball': {
        'Assumption': 'JZuapQ3adYlHDeDb',
        'Bishop Reding': 'pZi8K6yVrRKYwqrf',
        'Christ the King': 'uwbrUGwQs7JEDdGa',
        'Holy Trinity': 'k5jiNvg1jCuEK9Se',
        'Corpus Christi': 'g8HxbOtumcER6JFi',
        'St. Francis Xavier': 'nrkiOw7ZZNFeX9HM',
        'Notre Dame': 'Fb0i6kWd2JiRomeq',
        'St. Ignatius of Loyola': 'N0SLyNSFQutL7WYQ',
        'St. Thomas Aquinas': 'vOc6Dvsd9wZlKpEK',
        'St. Kateri Tekakwitha': 'zWlZ4jBBJBqWTrnB',
    },
    'Senior Boys Volleyball': {
        'Assumption': 'JZuapQ3adYlHDeDb',
        'Bishop Reding': 'pZi8K6yVrRKYwqrf',
        'Christ the King': 'uwbrUGwQs7JEDdGa',
        'Holy Trinity': 'k5jiNvg1jCuEK9Se',
        'Corpus Christi': 'g8HxbOtumcER6JFi',
        'St. Francis Xavier': 'nrkiOw7ZZNFeX9HM',
        'Notre Dame': 'Fb0i6kWd2JiRomeq',
        'St. Ignatius of Loyola': 'N0SLyNSFQutL7WYQ',
        'St. Thomas Aquinas': 'vOc6Dvsd9wZlKpEK',
        'St. Kateri Tekakwitha': 'zWlZ4jBBJBqWTrnB',
    },
    'Novice Boys Basketball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Junior Boys Basketball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Senior Boys Basketball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Novice Co-Ed Curling': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Boys Curling': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Girls Curling': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Boys Hockey': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Girls Hockey': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Novice Girls Volleyball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Junior Girls Volleyball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Senior Girls Volleyball': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Tier 1 Varsity Co-Ed eSports': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Tier 2 Varsity Co-Ed eSports': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Girls Fastpitch': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Boys Lacrosse': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Girls Lacrosse': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Senior Girls Rugby': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Varsity Girls Slowpitch': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Junior Boys Soccer': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Senior Boys Soccer': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Junior Girls Soccer': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
    'Senior Girls Soccer': {
        'Assumption': TBD,
        'Bishop Reding': TBD,
        'Christ the King': TBD,
        'Holy Trinity': TBD,
        'Corpus Christi': TBD,
        'St. Francis Xavier': TBD,
        'Notre Dame': TBD,
        'St. Ignatius of Loyola': TBD,
        'St. Thomas Aquinas': TBD,
        'St. Kateri Tekakwitha': TBD,
    },
};

// --- LOOKUPS ---

/**
 * Returns the SportNinja team id for a school within a league, or null if the
 * league is unknown, the school isn't in that league, or the id is still a
 * placeholder.
 *
 * `league` may be either the league name ("Senior Boys Football") or its
 * SportNinja schedule id ("Fmmth77bLBTSKFuF").
 *
 * For the old "no filter" behaviour: getSchoolId(league, name) ?? 'ALL'
 */
export const getSchoolId = (league: string, schoolName: string): string | null => {
    const leagueName = resolveLeagueName(league);
    if (!leagueName) {
        console.warn(`[getSchoolId] Unknown league '${league}'.`);
        return null;
    }

    const id = TEAM_IDS[leagueName][schoolName as SchoolName];
    if (!id) {
        console.warn(`[getSchoolId] '${schoolName}' has no team in '${leagueName}'.`);
        return null;
    }
    if (isPlaceholderId(id)) {
        console.warn(`[getSchoolId] '${schoolName}' in '${leagueName}' is still a placeholder.`);
        return null;
    }
    return id;
};

/** Schools that have a real (non-placeholder) team id in the given league. */
export const getSchoolsInLeague = (league: string): SchoolName[] => {
    const leagueName = resolveLeagueName(league);
    if (!leagueName) return [];
    const teams = TEAM_IDS[leagueName];
    return SCHOOLS.filter((s) => !isPlaceholderId(teams[s]));
};