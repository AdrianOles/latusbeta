// --- INTERFACES FOR TYPE SAFETY ---

/** A single standing record. team/GP/PTS/GD keep the old shape; the rest are extras. */
export interface StandingRecord {
    team: string;
    GP: number;
    PTS: number;
    GD: number;
    /** SportNinja team id — usable as schoolSelect / team_id in getScores. */
    teamId?: string;
    abbreviation?: string;
    /** Division (sub-schedule) name from groupBy=Division. */
    division?: string;
    /** Every stat the API returned, keyed by abbreviation (GP, W, GF, GA, PTS, ...). */
    stats?: Record<string, number>;
}

/** Defines the parameters for fetching standings. */
export interface StandingsParams {
    /** SportNinja schedule (league) id, e.g. 'Fmmth77bLBTSKFuF' for Senior Boys Football. */
    leagueid?: string;
}

// --- CONFIGURATION ---

const BASE_URL = 'https://metal-api.sportninja.net/v1/schedules';

/** Senior Boys Football. */
const DEFAULT_SCHEDULE_ID = 'Fmmth77bLBTSKFuF';

/** SportNinja stat id for PTS — what the web app sorts by. */
const SORT_BY_PTS = '104';

// --- AUTHENTICATION ---

/**
 * Bearer token resolution, same as the scores module:
 *   1. setStandingsAuthToken() at runtime
 *   2. process.env.SPORTNINJA_TOKEN
 */
let runtimeToken: string | null = null;

export function setStandingsAuthToken(token: string | null): void {
    runtimeToken = token && token.trim().length > 0 ? token.trim() : null;
}

function getAuthToken(): string | null {
    if (runtimeToken) return runtimeToken;
    const fromEnv = typeof process !== 'undefined'
        ? process.env?.SPORTNINJA_TOKEN
        : undefined;
    return fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim() : null;
}

function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    const token = 'v2.local.SeESbcd7pyzenBt-W-3Qg3ZQ0R0mtBnDY67dg3L2KrmyNHEVvnQ6sjTK7qKHwSrX94adLV0HhhQnuVgnfHNh4L4Y8zI_B1VYmCg9DyE0d-cGZmVuYAytl6G-G4qDZ5Qh5L3AaVUNA_SJ3I3zwjP1XHm5nckvfbgV1uh4ZlL7V7jymGaT_YJZhEefbnmIBf_gVz1C9xY2CnKWsEGnqA_LwRbISrEdkb_s-7dCEWiziyaP6132mU8FbpBxnSatxFWtaUkpYjrJl-FbMwU1DywE15FMCBs9s1okA7uW04PcqllV1EGvgGCIz_b_HOEOWwCHyUm6sinRkgwDlcBRSw';
    if (token) {
        headers.Authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
        // Server-side only; browsers drop these silently.
        headers.Origin = 'https://app.sportninja.com';
        headers.Referer = 'https://app.sportninja.com/';
    }
    return headers;
}

// --- MINIMAL RAW TYPES (only the fields we read) ---

interface RawStat {
    id?: string | number;
    abbr?: string;
    value?: number | string | null;
}

interface RawStandingRow {
    team?: {
        id?: string;
        name?: string;
        name_full?: string;
        abbreviation?: string;
    } | null;
    schedule?: {
        id?: string;
        name?: string;
        sort_order?: number;
    } | null;
    stats?: RawStat[];
}

interface RawStandingsResponse {
    data?: RawStandingRow[];
}

// --- STAT HELPERS ---

/** Fallback stat ids, in case an abbreviation is ever missing or renamed. */
const STAT_IDS = {
    GP: '84',
    W: '88',
    GF: '92',
    GA: '93',
    PTS: '104',
} as const;

/** Same aliases the HTML scraper used, so other sports keep working. */
const GP_ALIASES = ['GP', 'MP'];
const POINTS_FOR_ALIASES = ['GF', 'PF', 'RF', 'PW'];
const POINTS_AGAINST_ALIASES = ['GA', 'PA', 'RA', 'PL'];
const DIFF_ALIASES = ['GD', 'DIFF', 'PD', 'RD', '+/-'];

function toNumber(v: unknown): number | null {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    return null;
}

/** Builds abbr -> value and id -> value lookups for one row. */
function indexStats(stats: RawStat[] | undefined): {
    byAbbr: Record<string, number>;
    byId: Record<string, number>;
} {
    const byAbbr: Record<string, number> = {};
    const byId: Record<string, number> = {};
    for (const s of stats ?? []) {
        const value = toNumber(s.value);
        if (value === null) continue;
        const abbr = s.abbr?.trim().toUpperCase();
        if (abbr && !(abbr in byAbbr)) byAbbr[abbr] = value;
        if (s.id !== undefined && s.id !== null) byId[String(s.id)] = value;
    }
    return { byAbbr, byId };
}

function pick(
    idx: { byAbbr: Record<string, number>; byId: Record<string, number> },
    aliases: string[],
    fallbackId?: string,
): number | null {
    for (const a of aliases) {
        if (a in idx.byAbbr) return idx.byAbbr[a];
    }
    if (fallbackId && fallbackId in idx.byId) return idx.byId[fallbackId];
    return null;
}

// --- CORE ASYNC FUNCTION ---

/**
 * Fetches league standings from the SportNinja API.
 * @param params - leagueid is the SportNinja schedule id (defaults to Senior Boys Football).
 * @returns A promise that resolves to standings, sorted by PTS descending
 *          (grouped by division, in the order the API returns them).
 */
export async function getStandings(params: StandingsParams = {}): Promise<StandingRecord[]> {
    const scheduleId = params.leagueid?.trim() || DEFAULT_SCHEDULE_ID;

    const query = new URLSearchParams({
        groupBy: 'Division',
        sortBy: SORT_BY_PTS,
        sort: 'desc',
    }).toString();
    const url = `${BASE_URL}/${encodeURIComponent(scheduleId)}/standings?${query}`;

    let response: Response;
    try {
        response = await fetch(url, { method: 'GET', headers: buildHeaders() });
    } catch (error) {
        console.error(
            'Network error during fetch:',
            error instanceof Error ? error.message : 'Unknown network error',
        );
        return [];
    }

    if (response.status === 401 || response.status === 403) {
        console.error(
            getAuthToken()
                ? `Standings API rejected the bearer token (${response.status}) — it has likely expired.`
                : 'Standings API requires authentication; set SPORTNINJA_TOKEN or call setStandingsAuthToken().',
        );
        return [];
    }

    if (response.status === 404) {
        console.error(`No schedule found for id '${scheduleId}'.`);
        return [];
    }

    if (!response.ok) {
        console.error(`Standings API responded ${response.status}`);
        return [];
    }

    let body: RawStandingsResponse;
    try {
        body = (await response.json()) as RawStandingsResponse;
    } catch (error) {
        console.error(
            'Failed to parse standings JSON:',
            error instanceof Error ? error.message : 'Unknown parse error',
        );
        return [];
    }

    const rows = Array.isArray(body.data) ? body.data : [];
    const standings: StandingRecord[] = [];

    for (const row of rows) {
        const teamName = (row.team?.name_full || row.team?.name || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!teamName) continue;

        const idx = indexStats(row.stats);

        const gp = pick(idx, GP_ALIASES, STAT_IDS.GP) ?? 0;
        const pts = pick(idx, ['PTS'], STAT_IDS.PTS) ?? 0;

        // Prefer an explicit differential stat; otherwise compute for - against.
        let gd = pick(idx, DIFF_ALIASES);
        if (gd === null) {
            const pf = pick(idx, POINTS_FOR_ALIASES, STAT_IDS.GF);
            const pa = pick(idx, POINTS_AGAINST_ALIASES, STAT_IDS.GA);
            gd = pf !== null && pa !== null ? pf - pa : 0;
        }

        standings.push({
            team: teamName,
            GP: gp,
            PTS: pts,
            GD: gd,
            teamId: row.team?.id,
            abbreviation: row.team?.abbreviation,
            division: row.schedule?.name?.replace(/\s+/g, ' ').trim(),
            stats: idx.byAbbr,
        });
    }

    return standings;
}