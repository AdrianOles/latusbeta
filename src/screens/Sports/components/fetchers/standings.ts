/**
 * Standings client for the Expo app.
 *
 * Drop-in replacement for the old SportNinja standings fetcher: same exports
 * and types, but it calls GET /standings on the scoresApi REST endpoint. The
 * SportNinja token never reaches the device.
 *
 * Requires Amplify.configure(awsconfig) before the first call.
 */
import { get } from 'aws-amplify/api';

// --- INTERFACES (unchanged) ---

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

/** Must match aws-exports.js → aws_cloud_logic_custom → name. */
const API_NAME = 'scoresApi';

/**
 * @deprecated The SportNinja token is handled server-side now. No-op kept so
 * existing imports don't break; remove calls to it.
 */
export function setStandingsAuthToken(_token: string | null): void {
    console.warn('[standings] setStandingsAuthToken() is a no-op now — the token lives in AWS.');
}

/**
 * Fetches league standings.
 * @param params - leagueid is the SportNinja schedule id (server defaults to
 *                 Senior Boys Football when omitted).
 * @returns Standings sorted by PTS descending, grouped by division; [] on error.
 */
export async function getStandings(params: StandingsParams = {}): Promise<StandingRecord[]> {
    const leagueid = params.leagueid?.trim();
    try {
        const { body } = await get({
            apiName: API_NAME,
            path: '/standings',
            options: { queryParams: leagueid ? { leagueid } : {} },
        }).response;
        return (await body.json()) as unknown as StandingRecord[];
    } catch (e) {
        console.error('[standings] request failed:', e instanceof Error ? e.message : e);
        return [];
    }
}