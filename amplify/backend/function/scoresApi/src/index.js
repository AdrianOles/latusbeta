/* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_SPORTNINJATOKENREFRESH_NAME
    REGION
Amplify Params - DO NOT EDIT */
// Built from ts/index.ts + ts/scores.ts + ts/standings.ts + ts/auth.ts with esbuild. Edit the .ts files and rebuild rather than editing this file.
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
    for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ts/index.ts
var index_exports = {};
__export(index_exports, {
    handler: () => handler
});
module.exports = __toCommonJS(index_exports);

// ts/auth.ts
var import_client_ssm = require("@aws-sdk/client-ssm");
var import_client_lambda = require("@aws-sdk/client-lambda");
var ssm = new import_client_ssm.SSMClient({});
var lambda = new import_client_lambda.LambdaClient({});
var AMPLIFY_ENV = process.env.ENV ?? "dev";
var TOKEN_PARAM = `/sportninja/${AMPLIFY_ENV}/token`;
var REFRESH_FUNCTION = process.env.FUNCTION_SPORTNINJATOKENREFRESH_NAME ?? `sportninjaTokenRefresh-${AMPLIFY_ENV}`;
var TOKEN_CACHE_MS = 5 * 60 * 1e3;
var MIN_FORCED_REFRESH_GAP_MS = 60 * 1e3;
var runtimeToken = null;
var cached = null;
var inflight = null;
var lastForcedRefresh = 0;
async function readTokenFromSsm() {
    try {
        const r = await ssm.send(new import_client_ssm.GetParameterCommand({ Name: TOKEN_PARAM, WithDecryption: true }));
        const parsed = JSON.parse(r.Parameter?.Value ?? "null");
        if (!parsed?.token) return null;
        cached = {
            token: parsed.token,
            expiresAt: parsed.expiresAt ? Date.parse(parsed.expiresAt) : Infinity,
            at: Date.now()
        };
        return parsed.token;
    } catch (e) {
        const err = e;
        if (err.name !== "ParameterNotFound") {
            console.error(`[auth] reading ${TOKEN_PARAM} failed:`, err.name, err.message);
        }
        return null;
    }
}
async function forceRefresh() {
    if (Date.now() - lastForcedRefresh < MIN_FORCED_REFRESH_GAP_MS) return null;
    lastForcedRefresh = Date.now();
    try {
        const r = await lambda.send(new import_client_lambda.InvokeCommand({
            FunctionName: REFRESH_FUNCTION,
            Payload: new TextEncoder().encode(JSON.stringify({ force: true }))
        }));
        if (r.FunctionError) {
            console.error(`[auth] ${REFRESH_FUNCTION} failed:`, new TextDecoder().decode(r.Payload));
            return null;
        }
    } catch (e) {
        console.error(`[auth] invoking ${REFRESH_FUNCTION} failed:`, e.message);
        return null;
    }
    cached = null;
    return readTokenFromSsm();
}
async function getAuthToken(force = false) {
    if (runtimeToken && !force) return runtimeToken;
    const usable = cached && Date.now() - cached.at < TOKEN_CACHE_MS && cached.expiresAt > Date.now();
    if (!force && usable) return cached.token;
    if (inflight) return inflight;
    inflight = (async () => {
        try {
            if (force) return await forceRefresh();
            const token = await readTokenFromSsm();
            if (token && cached && cached.expiresAt > Date.now()) return token;
            return await forceRefresh();
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}
function buildHeaders(token) {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json"
    };
    if (token) {
        headers.Authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
        headers.Origin = "https://app.sportninja.com";
        headers.Referer = "https://app.sportninja.com/";
    }
    return headers;
}
async function authedGet(url, page) {
    let token = await getAuthToken();
    if (!token) {
        console.error("[scores] no SportNinja token available \u2014 check the sportninjaTokenRefresh function");
        return null;
    }
    for (let attempt = 0; attempt < 2; attempt++) {
        logRequestStart(url, page, token);
        let response;
        try {
            response = await fetch(url, { method: "GET", headers: buildHeaders(token) });
        } catch (e) {
            if (e instanceof Error) console.error("Network error during fetch:", e.message);
            return null;
        }
        if ((response.status === 401 || response.status === 403) && attempt === 0) {
            console.warn(`[scores] token rejected (${response.status}); refreshing and retrying`);
            const fresh = await getAuthToken(true);
            if (!fresh) return response;
            token = fresh;
            continue;
        }
        return response;
    }
    return null;
}
var logRequests = true;
function logRequestStart(url, page, token) {
    if (!logRequests) return;
    const auth = token ? `bearer \u2026${token.slice(-6)}` : "no token";
    console.log(`[sportninja] \u2192 GET page ${page} (${auth})
         ${url}`);
}
function logRequestEnd(page, status, rows, totalPages, ms) {
    if (!logRequests) return;
    console.log(
        `[sportninja] \u2190 ${status} page ${page}/${totalPages} \xB7 ${rows} game(s) \xB7 ${Math.round(ms)}ms`
    );
}

// ts/scores.ts
var BASE_URL = "https://metal-api.sportninja.net/v1/games/follow";
var ORGANIZATION_ID = "QupnLFdX3cP5gtwB";
var DEFAULT_TZ = "America/Toronto";
var MAX_PAGES = 50;
var PER_PAGE = 45;
var ALL = "ALL";
var GAME_TYPE_LABELS = {
    2: "Regular Season",
    7: "Quarterfinal",
    // inferred
    8: "Semifinal",
    9: "Final",
    10: "Consolation Final",
    11: "GHAC"
    // inferred
};
var SILENT_GAME_TYPES = /* @__PURE__ */ new Set([2]);
function gameTypeLabel(id) {
    if (typeof id !== "number" || SILENT_GAME_TYPES.has(id)) return void 0;
    return GAME_TYPE_LABELS[id];
}
function tzOffset(date, timeZone) {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            timeZoneName: "longOffset"
        }).formatToParts(date);
        const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
        const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        if (!m) return "+00:00";
        const [, sign, hh, mm = "00"] = m;
        return `${sign}${hh.padStart(2, "0")}:${mm}`;
    } catch {
        return "+00:00";
    }
}
var DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
function dayBounds(dateSelect) {
    if (!dateSelect || dateSelect === ALL) return {};
    if (!DATE_ONLY.test(dateSelect)) {
        return { after: dateSelect, before: dateSelect };
    }
    const offset = tzOffset(/* @__PURE__ */ new Date(`${dateSelect}T12:00:00Z`), DEFAULT_TZ);
    return {
        after: `${dateSelect}T00:00:00${offset}`,
        before: `${dateSelect}T23:59:59${offset}`
    };
}
function formatDate(iso, timeZone) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return void 0;
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }).formatToParts(d);
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("weekday")}, ${get("month")} ${get("day")}, ${get("year")}`;
}
function formatTime(iso, timeZone) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(d).replace(/\u202f/g, " ");
}
function isMidnight(iso, timeZone) {
    return /^12:00 AM$/.test(formatTime(iso, timeZone) ?? "");
}
var SPORTNINJA_ID = /^[A-Za-z0-9]{16}$/;
var scheduleIdMap = {
    // '23': 'Vw3Vrn1wUZ7FR9MA',
};
function resolveScheduleId(value) {
    if (!value || value === ALL) return void 0;
    if (SPORTNINJA_ID.test(value)) return value;
    const mapped = scheduleIdMap[value];
    if (mapped) return mapped;
    console.error(
        `[scores] '${value}' is not a SportNinja schedule id and has no mapping. Real ids look like "Vw3Vrn1wUZ7FR9MA". Call getSchedules() to list them, then register them via setScheduleIdMap().`
    );
    return null;
}
function teamName(team, slot) {
    return (team?.name_full || team?.name || slot?.name || "").replace(/\s+/g, " ").trim();
}
function firstNumber(...candidates) {
    for (const c of candidates) {
        if (typeof c === "number" && Number.isFinite(c)) return c;
        if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c))) {
            return Number(c);
        }
    }
    return null;
}
function extractScores(g) {
    const score = g.score ?? g.scores ?? {};
    const home = firstNumber(
        g.home_team_score,
        g.homeTeamScore,
        g.homeTeam?.score,
        score.home,
        score.home_team
    );
    const visitor = firstNumber(
        g.visiting_team_score,
        g.visitingTeamScore,
        g.visitingTeam?.score,
        score.visitor,
        score.visiting,
        score.visiting_team,
        score.away
    );
    return { home, visitor };
}
function extractSets(g) {
    const periods = g.periods ?? g.periodScores ?? g.period_scores;
    if (!Array.isArray(periods) || periods.length === 0) return void 0;
    const home = [];
    const visitor = [];
    for (const p of periods) {
        const h = firstNumber(p.home, p.home_team_score, p.homeTeamScore);
        const v = firstNumber(p.visitor, p.visiting_team_score, p.visitingTeamScore);
        if (h !== null) home.push(h);
        if (v !== null) visitor.push(v);
    }
    if (home.length === 0 && visitor.length === 0) return void 0;
    return { home, visitor };
}
function buildLocation(g) {
    const candidates = [
        g.facility?.name,
        g.venue?.name_full || g.venue?.name,
        g.venue?.address?.city
    ].filter((p) => typeof p === "string" && p.trim().length > 0);
    const unique = candidates.filter((p, i) => candidates.indexOf(p) === i);
    return unique.length > 0 ? unique.join(" \u2014 ") : void 0;
}
function buildNotes(g) {
    const bits = [];
    const type = gameTypeLabel(g.game_type_id);
    if (type) bits.push(type);
    const bracket = firstString(g.league_game_number);
    if (bracket && bracket.toLowerCase() !== type?.toLowerCase()) bits.push(bracket);
    const raw = firstString(g.notes, g.note, g.description, g.summary);
    if (raw) bits.push(raw);
    if (g.shootout) bits.push("Decided in shootout");
    const division = g.schedule?.name?.trim();
    const league = g.rootSchedule?.name?.trim();
    if (division && division !== league) bits.push(division);
    return bits.length > 0 ? bits.join(" \u2014 ") : void 0;
}
function firstString(...candidates) {
    for (const c of candidates) {
        if (typeof c === "string" && c.trim().length > 0) return c.replace(/\s+/g, " ").trim();
    }
    return void 0;
}
function mapGame(g) {
    const tz = g.venue?.timezone || DEFAULT_TZ;
    const scores = extractScores(g);
    const played = scores.home !== null || scores.visitor !== null;
    let time = null;
    if (!played) {
        const placeholder = Boolean(g.homeTeam?.is_placeholder) || Boolean(g.visitingTeam?.is_placeholder);
        time = placeholder && isMidnight(g.starts_at, tz) ? "TBA" : formatTime(g.starts_at, tz);
    }
    const sets = extractSets(g);
    const location = buildLocation(g);
    const notes = buildNotes(g);
    return {
        time,
        date: formatDate(g.starts_at, tz),
        schools: [
            teamName(g.visitingTeam, g.visitingTeamSlot),
            teamName(g.homeTeam, g.homeTeamSlot)
        ].filter((s) => s.length > 0),
        scores,
        ...sets ? { sets } : {},
        ...notes ? { notes } : {},
        ...location ? { location } : {}
    };
}
async function getScores(params = {}) {
    const defaultParams = {
        leagueid: "ALL",
        dateSelect: "2025-11-26",
        schoolSelect: "ALL",
        leagueSelect: "ALL"
    };
    const {
        leagueid,
        dateSelect,
        schoolSelect,
        leagueSelect
    } = { ...defaultParams, ...params };
    const leagueValue = [leagueid, leagueSelect].find((v) => v && v !== ALL);
    const scheduleId = resolveScheduleId(leagueValue);
    if (scheduleId === null) return [];
    const teamId = schoolSelect && schoolSelect !== ALL ? schoolSelect : void 0;
    const { after, before } = dayBounds(dateSelect);
    const groupedResults = [];
    const byLeague = /* @__PURE__ */ new Map();
    const seen = /* @__PURE__ */ new Set();
    let page = 1;
    while (page <= MAX_PAGES) {
        const query = new URLSearchParams({
            ...scheduleId ? { schedule_id: scheduleId } : {},
            ...teamId ? { team_id: teamId } : {},
            organization_id: ORGANIZATION_ID,
            recursive: "1",
            per_page: String(PER_PAGE),
            ...after ? { starts_after: after } : {},
            ...before ? { starts_before: before } : {},
            order: "asc",
            page: String(page)
        }).toString();
        const url = `${BASE_URL}?${query}`;
        const startedAt = Date.now();
        const response = await authedGet(url, page);
        if (!response) break;
        if (response.status === 401 || response.status === 403) {
            console.error(`Scores API rejected a freshly refreshed token (${response.status}).`);
            break;
        }
        if (!response.ok) {
            console.error(`Scores API responded ${response.status} on page ${page}`);
            break;
        }
        let body;
        try {
            body = await response.json();
        } catch (e) {
            if (e instanceof Error) {
                console.error("Failed to parse scores JSON:", e.message);
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
            const league = row.rootSchedule?.name?.trim() || "Unknown League";
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
    const flatResults = [];
    for (const group of groupedResults) {
        group.games.forEach((game) => {
            flatResults.push({
                ...game,
                league: group.league
            });
        });
    }
    return flatResults;
}
async function crawlGames(extra) {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    let page = 1;
    while (page <= MAX_PAGES) {
        const query = new URLSearchParams({
            organization_id: ORGANIZATION_ID,
            recursive: "1",
            per_page: String(PER_PAGE),
            order: "asc",
            page: String(page),
            ...extra
        }).toString();
        const url = `${BASE_URL}?${query}`;
        const startedAt = Date.now();
        const response = await authedGet(url, page);
        if (!response) break;
        if (!response.ok) {
            console.error(`Scores API responded ${response.status} on page ${page}`);
            break;
        }
        let body;
        try {
            body = await response.json();
        } catch (e) {
            if (e instanceof Error) console.error("Failed to parse scores JSON:", e.message);
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
async function getSchedules(startsAfter, startsBefore) {
    const extra = {};
    const after = startsAfter ? dayBounds(startsAfter).after : void 0;
    const before = startsBefore ? dayBounds(startsBefore).before : void 0;
    if (after) extra.starts_after = after;
    if (before) extra.starts_before = before;
    const games = await crawlGames(extra);
    const byId = /* @__PURE__ */ new Map();
    for (const g of games) {
        const root = g.rootSchedule;
        const sub = g.schedule;
        if (root?.id && !byId.has(root.id)) {
            byId.set(root.id, {
                id: root.id,
                name: (root.name ?? "").replace(/\s+/g, " ").trim(),
                kind: "league"
            });
        }
        if (sub?.id && sub.id !== root?.id && !byId.has(sub.id)) {
            byId.set(sub.id, {
                id: sub.id,
                name: (sub.name ?? "").replace(/\s+/g, " ").trim(),
                kind: "division",
                parentId: root?.id
            });
        }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
async function getTeams(startsAfter, startsBefore) {
    const extra = {};
    const after = startsAfter ? dayBounds(startsAfter).after : void 0;
    const before = startsBefore ? dayBounds(startsBefore).before : void 0;
    if (after) extra.starts_after = after;
    if (before) extra.starts_before = before;
    const games = await crawlGames(extra);
    const byId = /* @__PURE__ */ new Map();
    for (const g of games) {
        for (const side of [g.homeTeam, g.visitingTeam]) {
            const team = side;
            if (!team?.id || byId.has(team.id)) continue;
            byId.set(team.id, {
                id: team.id,
                name: teamName(team),
                isPlaceholder: Boolean(team.is_placeholder)
            });
        }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ts/standings.ts
var BASE_URL2 = "https://metal-api.sportninja.net/v1/schedules";
var DEFAULT_SCHEDULE_ID = "Fmmth77bLBTSKFuF";
var SORT_BY_PTS = "104";
var STAT_IDS = {
    GP: "84",
    W: "88",
    GF: "92",
    GA: "93",
    PTS: "104"
};
var GP_ALIASES = ["GP", "MP"];
var POINTS_FOR_ALIASES = ["GF", "PF", "RF", "PW"];
var POINTS_AGAINST_ALIASES = ["GA", "PA", "RA", "PL"];
var DIFF_ALIASES = ["GD", "DIFF", "PD", "RD", "+/-"];
function toNumber(v) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
    return null;
}
function indexStats(stats) {
    const byAbbr = {};
    const byId = {};
    for (const s of stats ?? []) {
        const value = toNumber(s.value);
        if (value === null) continue;
        const abbr = s.abbr?.trim().toUpperCase();
        if (abbr && !(abbr in byAbbr)) byAbbr[abbr] = value;
        if (s.id !== void 0 && s.id !== null) byId[String(s.id)] = value;
    }
    return { byAbbr, byId };
}
function pick(idx, aliases, fallbackId) {
    for (const a of aliases) {
        if (a in idx.byAbbr) return idx.byAbbr[a];
    }
    if (fallbackId && fallbackId in idx.byId) return idx.byId[fallbackId];
    return null;
}
async function getStandings(params = {}) {
    const scheduleId = params.leagueid?.trim() || DEFAULT_SCHEDULE_ID;
    const query = new URLSearchParams({
        groupBy: "Division",
        sortBy: SORT_BY_PTS,
        sort: "desc"
    }).toString();
    const url = `${BASE_URL2}/${encodeURIComponent(scheduleId)}/standings?${query}`;
    const response = await authedGet(url, 1);
    if (!response) return [];
    if (response.status === 401 || response.status === 403) {
        console.error(`Standings API rejected a freshly refreshed token (${response.status}).`);
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
    let body;
    try {
        body = await response.json();
    } catch (error) {
        console.error(
            "Failed to parse standings JSON:",
            error instanceof Error ? error.message : "Unknown parse error"
        );
        return [];
    }
    const rows = Array.isArray(body.data) ? body.data : [];
    const standings = [];
    for (const row of rows) {
        const teamName2 = (row.team?.name_full || row.team?.name || "").replace(/\s+/g, " ").trim();
        if (!teamName2) continue;
        const idx = indexStats(row.stats);
        const gp = pick(idx, GP_ALIASES, STAT_IDS.GP) ?? 0;
        const pts = pick(idx, ["PTS"], STAT_IDS.PTS) ?? 0;
        let gd = pick(idx, DIFF_ALIASES);
        if (gd === null) {
            const pf = pick(idx, POINTS_FOR_ALIASES, STAT_IDS.GF);
            const pa = pick(idx, POINTS_AGAINST_ALIASES, STAT_IDS.GA);
            gd = pf !== null && pa !== null ? pf - pa : 0;
        }
        standings.push({
            team: teamName2,
            GP: gp,
            PTS: pts,
            GD: gd,
            teamId: row.team?.id,
            abbreviation: row.team?.abbreviation,
            division: row.schedule?.name?.replace(/\s+/g, " ").trim(),
            stats: idx.byAbbr
        });
    }
    return standings;
}

// ts/index.ts
var CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
};
var reply = (statusCode, body) => ({
    statusCode,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify(body)
});
var handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return reply(204, {});
    const q = event.queryStringParameters ?? {};
    const path = (event.path ?? event.resource ?? "").replace(/\/+$/, "");
    try {
        if (path.endsWith("/scores")) {
            const params = {
                leagueid: q.leagueid,
                dateSelect: q.dateSelect,
                schoolSelect: q.schoolSelect,
                leagueSelect: q.leagueSelect
            };
            Object.keys(params).forEach((k) => params[k] === void 0 && delete params[k]);
            return reply(200, await getScores(params));
        }
        if (path.endsWith("/schedules")) {
            return reply(200, await getSchedules(q.startsAfter, q.startsBefore));
        }
        if (path.endsWith("/standings")) {
            return reply(200, await getStandings({ leagueid: q.leagueid }));
        }
        if (path.endsWith("/teams")) {
            return reply(200, await getTeams(q.startsAfter, q.startsBefore));
        }
        return reply(404, { error: `No route for ${path}` });
    } catch (e) {
        console.error("[scoresApi]", e);
        return reply(500, { error: "Failed to load scores" });
    }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    handler
});