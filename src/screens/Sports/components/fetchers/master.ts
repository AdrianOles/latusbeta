/**
 * Scores client for the Expo app.
 *
 * Drop-in replacement for the old SportNinja fetcher: same exports, same
 * types, same return shapes — but it calls the scoresApi REST endpoint on
 * AWS. The SportNinja token lives only in AWS (refreshed by the
 * sportninjaTokenRefresh Lambda) and never reaches the device.
 *
 * Requires Amplify to be configured before the first call:
 *   import { Amplify } from 'aws-amplify';
 *   import awsconfig from './aws-exports';
 *   Amplify.configure(awsconfig);
 */
import { get } from 'aws-amplify/api';

// --- INTERFACES (unchanged) ---

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
    sets?: {
        home: number[];
        visitor: number[];
    };
    notes?: string;
    location?: string;
}

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

// --- CONFIGURATION ---

/**
 * The REST API's friendly name from `amplify add api`.
 * Must match the key under aws-exports.js → aws_cloud_logic_custom → name.
 */
const API_NAME = 'scoresApi';

const ALL = 'ALL';

// --- LOGGING ---

let logRequests = true;

/** Turn per-request console logging on or off. On by default. */
export function setRequestLogging(enabled: boolean): void {
    logRequests = enabled;
}

// --- AUTH (kept for compatibility) ---

/**
 * @deprecated The SportNinja token is now handled server-side. This is a
 * no-op kept so existing imports don't break; remove calls to it.
 */
export function setAuthToken(_token: string | null): void {
    if (logRequests) {
        console.warn('[scores] setAuthToken() is a no-op now — the token lives in AWS.');
    }
}

// --- LEGACY LEAGUE ID MAPPING ---

/** SportNinja ids are 16 chars of base62. Legacy HCAA leagueids were numeric. */
const SPORTNINJA_ID = /^[A-Za-z0-9]{16}$/;

/**
 * Maps old HCAA numeric leagueid values onto SportNinja schedule ids.
 * Resolved here, before the request, so the server only ever sees real ids.
 */
let scheduleIdMap: Record<string, string> = {
    // '23': 'Vw3Vrn1wUZ7FR9MA',
};

/** Replaces the legacy leagueid -> schedule_id mapping. */
export function setScheduleIdMap(map: Record<string, string>): void {
    scheduleIdMap = { ...map };
}

/** Swaps a mapped legacy id for its SportNinja id; anything else passes through. */
function mapLeague(value: string | undefined): string | undefined {
    if (!value || value === ALL || SPORTNINJA_ID.test(value)) return value;
    return scheduleIdMap[value] ?? value; // unmapped: server logs it and returns []
}

// --- REQUEST HELPER ---

async function callApi<T>(
    path: string,
    params: Record<string, string | undefined>,
    fallback: T,
): Promise<T> {
    const queryParams = Object.fromEntries(
        Object.entries(params).filter(
            (e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0,
        ),
    );

    const startedAt = Date.now();
    if (logRequests) console.log(`[scores] → GET ${path}`, queryParams);

    try {
        const { statusCode, body } = await get({
            apiName: API_NAME,
            path,
            options: { queryParams },
        }).response;
        const data = (await body.json()) as unknown as T;
        if (logRequests) {
            const n = Array.isArray(data) ? `${data.length} item(s)` : 'ok';
            console.log(`[scores] ← ${statusCode} ${path} · ${n} · ${Date.now() - startedAt}ms`);
        }
        return data;
    } catch (e) {
        // Amplify throws on non-2xx; the server never sends the token back,
        // so this is safe to log as-is.
        console.error(`[scores] ${path} failed:`, e instanceof Error ? e.message : e);
        return fallback;
    }
}

// --- PUBLIC API (same signatures as before) ---

/**
 * Fetches daily scores.
 * - Filters by league (leagueid / leagueSelect), date (dateSelect,
 *   'YYYY-MM-DD') and school (schoolSelect = SportNinja team id).
 * - 'ALL' on any filter means "no filter".
 * @returns A flat array of games; [] on any error.
 */
export async function getScores(params: ScoresParams = {}): Promise<GameScore[]> {
    return callApi<GameScore[]>('/scores', {
        leagueid: mapLeague(params.leagueid),
        leagueSelect: mapLeague(params.leagueSelect),
        dateSelect: params.dateSelect,
        schoolSelect: params.schoolSelect,
    }, []);
}

/**
 * Lists every league and division with a game in the window.
 * @param startsAfter - 'YYYY-MM-DD'. Defaults to no lower bound.
 * @param startsBefore - 'YYYY-MM-DD'. Defaults to no upper bound.
 */
export async function getSchedules(
    startsAfter?: string,
    startsBefore?: string,
): Promise<ScheduleInfo[]> {
    return callApi<ScheduleInfo[]>('/schedules', { startsAfter, startsBefore }, []);
}

/** Lists every team with a game in the window (for a schoolSelect lookup). */
export async function getTeams(
    startsAfter?: string,
    startsBefore?: string,
): Promise<TeamInfo[]> {
    return callApi<TeamInfo[]>('/teams', { startsAfter, startsBefore }, []);
}