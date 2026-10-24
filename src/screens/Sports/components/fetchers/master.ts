// --- INTERFACES FOR TYPE SAFETY (unchanged from the scraper version) ---

/** Defines the structure of the input parameters for the fetch request. */
export interface ScoresParams {
    leagueid?: string;
    dateSelect?: string;
    schoolSelect?: string;
    leagueSelect?: string;
}

/** Defines the structure of a single game object. */
export interface GameScore {
    time: string | null;
    league?: string;
    date?: string; // e.g., "Thursday, November 20, 2025"
    schools: string[];
    scores: {
        visitor: number | null;
        home: number | null;
    };
    sets?: { // Optional field for game sets
        home: number[];
        visitor: number[];
    };
    notes?: string;
    location?: string;
}

/** Defines the structure for the final grouped result before flattening. */
interface LeagueGroup {
    league: string;
    games: Omit<GameScore, 'league'>[];
}

// --- CONFIGURATION ---

const BASE_URL = 'https://metal-api.sportninja.net/v1/games/follow';

/** Halton Catholic Athletic Association — the association this fetcher covers. */
const ORGANIZATION_ID = 'QupnLFdX3cP5gtwB';

/** Fallback zone for date/time formatting when a venue has none. */
const DEFAULT_TZ = 'America/Toronto';

/** Runaway guard on pagination. */
const MAX_PAGES = 50;

const PER_PAGE = 45;

/** Sentinel value the old <select> elements used for "no filter". */
const ALL = 'ALL';

// --- GAME TYPES ---

/**
 * SportNinja game_type_id -> label.
 * 2, 8, 9 and 10 are confirmed. 7 and 11 are inferred from bracket shape
 * (three games before the semis; the GHAC game after the HCAA final) —
 * confirm them and delete the entries if they turn out wrong.
 */
const GAME_TYPE_LABELS: Record<number, string> = {
    2: 'Regular Season',
    7: 'Quarterfinal',       // inferred
    8: 'Semifinal',
    9: 'Final',
    10: 'Consolation Final',
    11: 'GHAC',              // inferred
};

/** Types that are not surfaced in notes (they would appear on every game). */
const SILENT_GAME_TYPES = new Set<number>([2]);

/** Human-readable game type, or undefined for unknown / silent types. */
function gameTypeLabel(id: unknown): string | undefined {
    if (typeof id !== 'number' || SILENT_GAME_TYPES.has(id)) return undefined;
    return GAME_TYPE_LABELS[id];
}

// --- AUTHENTICATION ---

/**
 * Bearer token for metal-api.sportninja.net.
 *
 * Resolution order:
 *   1. a token passed to setAuthToken() at runtime
 *   2. process.env.SPORTNINJA_TOKEN
 *
 * Do NOT paste the token into this file — it is a bearer credential and these
 * tokens expire, so a hardcoded one will silently start 401-ing.
 */
let runtimeToken: string | null = null;

/** Overrides the env var for the rest of the process. */
export function setAuthToken(token: string | null): void {
    runtimeToken = token && token.trim().length > 0 ? token.trim() : null;
}

/** TEMPORARY: hardcoded token. Remove before committing. */
const TEMP_TOKEN = 'v2.local.SeESbcd7pyzenBt-W-3Qg3ZQ0R0mtBnDY67dg3L2KrmyNHEVvnQ6sjTK7qKHwSrX94adLV0HhhQnuVgnfHNh4L4Y8zI_B1VYmCg9DyE0d-cGZmVuYAytl6G-G4qDZ5Qh5L3AaVUNA_SJ3I3zwjP1XHm5nckvfbgV1uh4ZlL7V7jymGaT_YJZhEefbnmIBf_gVz1C9xY2CnKWsEGnqA_LwRbISrEdkb_s-7dCEWiziyaP6132mU8FbpBxnSatxFWtaUkpYjrJl-FbMwU1DywE15FMCBs9s1okA7uW04PcqllV1EGvgGCIz_b_HOEOWwCHyUm6sinRkgwDlcBRSw';

function getAuthToken(): string | null {
    if (runtimeToken) return runtimeToken;
    const fromEnv = typeof process !== 'undefined'
        ? process.env?.SPORTNINJA_TOKEN
        : undefined;
    if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
    return TEMP_TOKEN;
}

/**
 * Builds the request headers, mirroring what the SportNinja web app sends.
 * The token already carries the "Bearer " prefix in some copies of it, so
 * that is normalized here rather than doubled up.
 */
function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers.Authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
        // Server-side only: browsers reject attempts to set these, and the
        // fetch spec silently drops them, so this is harmless either way.
        headers.Origin = 'https://app.sportninja.com';
        headers.Referer = 'https://app.sportninja.com/';
    }

    return headers;
}

// --- REQUEST LOGGING ---

let logRequests = true;

/** Turn per-request console logging on or off. On by default. */
export function setRequestLogging(enabled: boolean): void {
    logRequests = enabled;
}

/** Logs the outgoing request, with the bearer token reduced to a fingerprint. */
function logRequestStart(url: string, page: number): void {
    if (!logRequests) return;
    const token = getAuthToken();
    const auth = token
        ? `bearer …${token.slice(-6)}`
        : 'no token';
    console.log(`[scores] → GET page ${page} (${auth})\n         ${url}`);
}

/** Logs the outcome of a request once the body has been parsed. */
function logRequestEnd(
    page: number,
    status: number,
    rows: number,
    totalPages: number,
    ms: number,
): void {
    if (!logRequests) return;
    console.log(
        `[scores] ← ${status} page ${page}/${totalPages} · ${rows} game(s) · ${Math.round(ms)}ms`,
    );
}

// --- MINIMAL RAW TYPES (only the fields we read) ---

interface RawTeam {
    name?: string;
    name_full?: string;
    is_placeholder?: boolean;
}

interface RawGame {
    id: string;
    starts_at: string;
    game_status_id?: number;
    game_type_id?: number;
    league_game_number?: string | null;
    shootout?: boolean;
    homeTeam?: RawTeam | null;
    visitingTeam?: RawTeam | null;
    homeTeamSlot?: { name?: string } | null;
    visitingTeamSlot?: { name?: string } | null;
    venue?: {
        name?: string;
        name_full?: string;
        timezone?: string;
        address?: { city?: string } | null;
    } | null;
    facility?: { name?: string } | null;
    schedule?: { name?: string } | null;
    rootSchedule?: { name?: string } | null;
    // Score/period keys vary by sport and are absent on unplayed games.
    [key: string]: unknown;
}

interface RawResponse {
    data?: RawGame[];
    meta?: {
        pagination?: {
            current_page?: number;
            total_pages?: number;
        };
    };
}

// --- TIMEZONE / DATE HELPERS ---

/** UTC offset for `date` in `timeZone`, formatted as "-04:00". */
function tzOffset(date: Date, timeZone: string): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'longOffset',
        }).formatToParts(date);
        const name = parts.find(p => p.type === 'timeZoneName')?.value ?? '';
        const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        if (!m) return '+00:00';
        const [, sign, hh, mm = '00'] = m;
        return `${sign}${hh.padStart(2, '0')}:${mm}`;
    } catch {
        return '+00:00';
    }
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Turns the old dateSelect value ('YYYY-MM-DD') into the offset-aware
 * timestamps the API expects. Anything already in ISO form passes through.
 * 'ALL' / empty means no date window at all, so both bounds are omitted.
 */
function dayBounds(dateSelect: string): { after?: string; before?: string } {
    if (!dateSelect || dateSelect === ALL) return {};

    if (!DATE_ONLY.test(dateSelect)) {
        // Caller handed in a full timestamp; use it for both ends of the window.
        return { after: dateSelect, before: dateSelect };
    }
    // Probe at local noon so the DST offset for that calendar day is unambiguous.
    const offset = tzOffset(new Date(`${dateSelect}T12:00:00Z`), DEFAULT_TZ);
    return {
        after: `${dateSelect}T00:00:00${offset}`,
        before: `${dateSelect}T23:59:59${offset}`,
    };
}

/** "Thursday, November 20, 2025" */
function formatDate(iso: string, timeZone: string): string | undefined {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).formatToParts(d);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
    return `${get('weekday')}, ${get('month')} ${get('day')}, ${get('year')}`;
}

/** "7:00 PM" */
function formatTime(iso: string, timeZone: string): string | null {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(d).replace(/\u202f/g, ' ');
}

/** True when the start lands on local midnight, i.e. no real slot assigned. */
function isMidnight(iso: string, timeZone: string): boolean {
    return /^12:00 AM$/.test(formatTime(iso, timeZone) ?? '');
}

// --- SCHEDULE ID RESOLUTION ---

/** SportNinja ids are 16 chars of base62. Legacy HCAA leagueids were numeric. */
const SPORTNINJA_ID = /^[A-Za-z0-9]{16}$/;

/**
 * Maps the old HCAA numeric leagueid values onto SportNinja schedule ids.
 * Populate this (or call setScheduleIdMap) so existing callers can keep
 * passing '23' and friends. Use getSchedules() to discover the real ids.
 */
let scheduleIdMap: Record<string, string> = {
    // '23': 'Vw3Vrn1wUZ7FR9MA',
};

/** Replaces the legacy leagueid -> schedule_id mapping. */
export function setScheduleIdMap(map: Record<string, string>): void {
    scheduleIdMap = { ...map };
}

/**
 * Resolves a caller-supplied league value to a SportNinja schedule id.
 * Returns undefined for "no filter", or null when the value cannot be
 * resolved — getScores treats null as an error rather than silently widening
 * the query to every league.
 */
function resolveScheduleId(value: string | undefined): string | undefined | null {
    if (!value || value === ALL) return undefined;
    if (SPORTNINJA_ID.test(value)) return value;

    const mapped = scheduleIdMap[value];
    if (mapped) return mapped;

    console.error(
        `[scores] '${value}' is not a SportNinja schedule id and has no mapping. ` +
        'Real ids look like "Vw3Vrn1wUZ7FR9MA". Call getSchedules() to list them, ' +
        'then register them via setScheduleIdMap().',
    );
    return null;
}

// --- MAPPING HELPERS ---

function teamName(team?: RawTeam | null, slot?: { name?: string } | null): string {
    // The API occasionally double-spaces names, e.g. "HWCDSB  Champion".
    return (team?.name_full || team?.name || slot?.name || '').replace(/\s+/g, ' ').trim();
}

function firstNumber(...candidates: unknown[]): number | null {
    for (const c of candidates) {
        if (typeof c === 'number' && Number.isFinite(c)) return c;
        if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) {
            return Number(c);
        }
    }
    return null;
}

/**
 * Score keys differ by sport/tenant and are omitted entirely for unplayed
 * games, so this probes the known variants and yields nulls otherwise.
 */
function extractScores(g: RawGame): { visitor: number | null; home: number | null } {
    const score = (g.score ?? g.scores ?? {}) as Record<string, unknown>;
    const home = firstNumber(
        g.home_team_score,
        g.homeTeamScore,
        (g.homeTeam as Record<string, unknown> | undefined)?.score,
        score.home,
        score.home_team,
    );
    const visitor = firstNumber(
        g.visiting_team_score,
        g.visitingTeamScore,
        (g.visitingTeam as Record<string, unknown> | undefined)?.score,
        score.visitor,
        score.visiting,
        score.visiting_team,
        score.away,
    );
    return { home, visitor };
}

/** Per-period / per-set scores, mapped onto the old `sets` shape. */
function extractSets(g: RawGame): GameScore['sets'] {
    const periods = (g.periods ?? g.periodScores ?? g.period_scores) as
        | Array<Record<string, unknown>>
        | undefined;
    if (!Array.isArray(periods) || periods.length === 0) return undefined;

    const home: number[] = [];
    const visitor: number[] = [];
    for (const p of periods) {
        const h = firstNumber(p.home, p.home_team_score, p.homeTeamScore);
        const v = firstNumber(p.visitor, p.visiting_team_score, p.visitingTeamScore);
        if (h !== null) home.push(h);
        if (v !== null) visitor.push(v);
    }
    if (home.length === 0 && visitor.length === 0) return undefined;
    return { home, visitor };
}

/** Mirrors the scraper's "Location: ..." cell. */
function buildLocation(g: RawGame): string | undefined {
    const candidates = [
        g.facility?.name,
        g.venue?.name_full || g.venue?.name,
        g.venue?.address?.city,
    ].filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
    const unique = candidates.filter((p, i) => candidates.indexOf(p) === i);
    return unique.length > 0 ? unique.join(' — ') : undefined;
}

/**
 * Mirrors the scraper's "Notes: ..." cell.
 * Order: game type, bracket label (e.g. "Tier 1", "GHAC"), API notes,
 * shootout flag, division name.
 */
function buildNotes(g: RawGame): string | undefined {
    const bits: string[] = [];

    const type = gameTypeLabel(g.game_type_id);
    if (type) bits.push(type);

    // league_game_number is used as a free-text bracket label in HCAA data.
    const bracket = firstString(g.league_game_number);
    if (bracket && bracket.toLowerCase() !== type?.toLowerCase()) bits.push(bracket);

    const raw = firstString(g.notes, g.note, g.description, g.summary);
    if (raw) bits.push(raw);
    if (g.shootout) bits.push('Decided in shootout');
    const division = g.schedule?.name?.trim();
    const league = g.rootSchedule?.name?.trim();
    // Only surface the sub-schedule when it adds something beyond the league name.
    if (division && division !== league) bits.push(division);
    return bits.length > 0 ? bits.join(' — ') : undefined;
}

function firstString(...candidates: unknown[]): string | undefined {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0) return c.replace(/\s+/g, ' ').trim();
    }
    return undefined;
}

function mapGame(g: RawGame): Omit<GameScore, 'league'> {
    const tz = g.venue?.timezone || DEFAULT_TZ;
    const scores = extractScores(g);
    const played = scores.home !== null || scores.visitor !== null;

    // Match the scraper's semantics: a game carries EITHER a time (not yet
    // played) OR a pair of scores. Unassigned bracket slots read as "TBA".
    let time: string | null = null;
    if (!played) {
        const placeholder =
            Boolean(g.homeTeam?.is_placeholder) || Boolean(g.visitingTeam?.is_placeholder);
        time = (placeholder && isMidnight(g.starts_at, tz))
            ? 'TBA'
            : formatTime(g.starts_at, tz);
    }

    const sets = extractSets(g);
    const location = buildLocation(g);
    const notes = buildNotes(g);

    return {
        time,
        date: formatDate(g.starts_at, tz),
        schools: [
            teamName(g.visitingTeam, g.visitingTeamSlot),
            teamName(g.homeTeam, g.homeTeamSlot),
        ].filter(s => s.length > 0),
        scores,
        ...(sets ? { sets } : {}),
        ...(notes ? { notes } : {}),
        ...(location ? { location } : {}),
    };
}

// --- CORE ASYNC FUNCTION ---

/**
 * Fetches and parses daily scores from the SportNinja API.
 * - Filters by league (leagueid / leagueSelect -> schedule_id), date
 *   (dateSelect -> starts_after/starts_before) and school
 *   (schoolSelect -> team_id).
 * - 'ALL' on any filter means "no filter", as with the old form selects.
 * @param params - The search parameters for the request.
 * @returns A promise that resolves to a flat array of structured game scores.
 */
export async function getScores(params: ScoresParams = {}): Promise<GameScore[]> {

    const defaultParams: Required<ScoresParams> = {
        leagueid: 'ALL',
        dateSelect: '2025-11-26',
        schoolSelect: 'ALL',
        leagueSelect: 'ALL',
    };

    const {
        leagueid, dateSelect, schoolSelect, leagueSelect,
    } = { ...defaultParams, ...params };

    // leagueid took precedence in the old query string; keep that ordering.
    const leagueValue = [leagueid, leagueSelect].find(v => v && v !== ALL);
    const scheduleId = resolveScheduleId(leagueValue);
    if (scheduleId === null) return []; // unresolvable league; don't guess

    // The organization is the association itself and stays fixed; the school
    // filter is a team within it.
    const teamId = (schoolSelect && schoolSelect !== ALL) ? schoolSelect : undefined;
    const { after, before } = dayBounds(dateSelect);

    const groupedResults: LeagueGroup[] = [];
    const byLeague = new Map<string, Omit<GameScore, 'league'>[]>();
    const seen = new Set<string>();

    let page = 1;

    while (page <= MAX_PAGES) {
        const query = new URLSearchParams({
            ...(scheduleId ? { schedule_id: scheduleId } : {}),
            ...(teamId ? { team_id: teamId } : {}),
            organization_id: ORGANIZATION_ID,
            recursive: '1',
            per_page: String(PER_PAGE),
            ...(after ? { starts_after: after } : {}),
            ...(before ? { starts_before: before } : {}),
            order: 'asc',
            page: String(page),
        }).toString();

        const url = `${BASE_URL}?${query}`;
        logRequestStart(url, page);
        const startedAt = Date.now();

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: buildHeaders(),
            });
        } catch (e) {
            if (e instanceof Error) {
                console.error('Network error during fetch:', e.message);
            }
            break;
        }

        if (response.status === 401 || response.status === 403) {
            console.error(
                getAuthToken()
                    ? `Scores API rejected the bearer token (${response.status}) — it has likely expired.`
                    : 'Scores API requires authentication; set SPORTNINJA_TOKEN or call setAuthToken().',
            );
            break;
        }

        if (!response.ok) {
            console.error(`Scores API responded ${response.status} on page ${page}`);
            break;
        }

        let body: RawResponse;
        try {
            body = (await response.json()) as RawResponse;
        } catch (e) {
            if (e instanceof Error) {
                console.error('Failed to parse scores JSON:', e.message);
            }
            break;
        }

        const rows = Array.isArray(body.data) ? body.data : [];
        const current = body.meta?.pagination?.current_page ?? page;
        const total = body.meta?.pagination?.total_pages ?? 1;

        logRequestEnd(current, response.status, rows.length, total, Date.now() - startedAt);

        for (const row of rows) {
            if (!row?.id || seen.has(row.id)) continue;
            seen.add(row.id);

            const league = row.rootSchedule?.name?.trim() || 'Unknown League';
            const bucket = byLeague.get(league);
            if (bucket) bucket.push(mapGame(row));
            else byLeague.set(league, [mapGame(row)]);
        }

        if (rows.length === 0 || current >= total) break;
        page = current + 1;
    }

    for (const [league, games] of byLeague) {
        groupedResults.push({ league, games });
    }

    // Flatten the structure: one array, adding league — same as before.
    const flatResults: GameScore[] = [];
    for (const group of groupedResults) {
        group.games.forEach((game) => {
            flatResults.push({
                ...game,
                league: group.league,
            } as GameScore);
        });
    }

    return flatResults;
}

// --- DISCOVERY HELPERS ---

export interface ScheduleInfo {
    /** SportNinja schedule id, e.g. 'a0BRQWBVYDoPNf9T'. */
    id: string;
    name: string;
    /** Root schedule ("league") vs sub-schedule ("division"). */
    kind: 'league' | 'division';
    /** For divisions, the id of the parent league. */
    parentId?: string;
}

export interface TeamInfo {
    id: string;
    name: string;
    isPlaceholder: boolean;
}

/** Raw pass over the games endpoint, used only by the discovery helpers. */
async function crawlGames(extra: Record<string, string>): Promise<RawGame[]> {
    const out: RawGame[] = [];
    const seen = new Set<string>();
    let page = 1;

    while (page <= MAX_PAGES) {
        const query = new URLSearchParams({
            organization_id: ORGANIZATION_ID,
            recursive: '1',
            per_page: String(PER_PAGE),
            order: 'asc',
            page: String(page),
            ...extra,
        }).toString();

        const url = `${BASE_URL}?${query}`;
        logRequestStart(url, page);
        const startedAt = Date.now();

        let response: Response;
        try {
            response = await fetch(url, { method: 'GET', headers: buildHeaders() });
        } catch (e) {
            if (e instanceof Error) console.error('Network error during fetch:', e.message);
            break;
        }
        if (!response.ok) {
            console.error(`Scores API responded ${response.status} on page ${page}`);
            break;
        }

        let body: RawResponse;
        try {
            body = (await response.json()) as RawResponse;
        } catch (e) {
            if (e instanceof Error) console.error('Failed to parse scores JSON:', e.message);
            break;
        }

        const rows = Array.isArray(body.data) ? body.data : [];
        const current = body.meta?.pagination?.current_page ?? page;
        const total = body.meta?.pagination?.total_pages ?? 1;
        logRequestEnd(current, response.status, rows.length, total, Date.now() - startedAt);

        for (const row of rows) {
            if (!row?.id || seen.has(row.id)) continue;
            seen.add(row.id);
            out.push(row);
        }

        if (rows.length === 0 || current >= total) break;
        page = current + 1;
    }

    return out;
}

/**
 * Lists every schedule (league) and sub-schedule (division) that appears on a
 * game in the given window. Run this once to build your setScheduleIdMap.
 * @param startsAfter - 'YYYY-MM-DD'. Defaults to no lower bound.
 * @param startsBefore - 'YYYY-MM-DD'. Defaults to no upper bound.
 */
export async function getSchedules(
    startsAfter?: string,
    startsBefore?: string,
): Promise<ScheduleInfo[]> {
    const extra: Record<string, string> = {};
    const after = startsAfter ? dayBounds(startsAfter).after : undefined;
    const before = startsBefore ? dayBounds(startsBefore).before : undefined;
    if (after) extra.starts_after = after;
    if (before) extra.starts_before = before;

    const games = await crawlGames(extra);
    const byId = new Map<string, ScheduleInfo>();

    for (const g of games) {
        const root = g.rootSchedule as { id?: string; name?: string } | undefined;
        const sub = g.schedule as { id?: string; name?: string } | undefined;

        if (root?.id && !byId.has(root.id)) {
            byId.set(root.id, {
                id: root.id,
                name: (root.name ?? '').replace(/\s+/g, ' ').trim(),
                kind: 'league',
            });
        }
        if (sub?.id && sub.id !== root?.id && !byId.has(sub.id)) {
            byId.set(sub.id, {
                id: sub.id,
                name: (sub.name ?? '').replace(/\s+/g, ' ').trim(),
                kind: 'division',
                parentId: root?.id,
            });
        }
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Lists every team that appears on a game in the given window, for building a
 * schoolSelect -> team_id lookup.
 */
export async function getTeams(
    startsAfter?: string,
    startsBefore?: string,
): Promise<TeamInfo[]> {
    const extra: Record<string, string> = {};
    const after = startsAfter ? dayBounds(startsAfter).after : undefined;
    const before = startsBefore ? dayBounds(startsBefore).before : undefined;
    if (after) extra.starts_after = after;
    if (before) extra.starts_before = before;

    const games = await crawlGames(extra);
    const byId = new Map<string, TeamInfo>();

    for (const g of games) {
        for (const side of [g.homeTeam, g.visitingTeam]) {
            const team = side as (RawTeam & { id?: string }) | null | undefined;
            if (!team?.id || byId.has(team.id)) continue;
            byId.set(team.id, {
                id: team.id,
                name: teamName(team),
                isPlaceholder: Boolean(team.is_placeholder),
            });
        }
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}