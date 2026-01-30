import { parseHTML } from 'linkedom';

// --- INTERFACES FOR TYPE SAFETY ---

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
    location?: string; // <<< NEW FIELD ADDED
}

/** Defines the structure for the final grouped result before flattening. */
interface LeagueGroup {
    league: string;
    // The games array now contains the full game object structure (minus 'league')
    games: Omit<GameScore, 'league'>[];
}

// --- HELPER FUNCTION FOR PARSING SCORES AND SETS ---

/**
 * Parses a score cell's content to extract the main score and structured sets.
 * @param textContent - The raw text content of the score cell (e.g., "2 (19, 25, 23, 25, 11)").
 * @returns An object containing the main score and structured sets (home/visitor arrays).
 */
function parseScoreAndSets(textContent: string): { score: number | null, setScores: number[] } {
    const trimmedContent = textContent.trim();
    // Regex: (\d+) captures the main score, (.*?) captures the comma-separated sets inside parentheses
    const match = trimmedContent.match(/(\d+)\s*\((.*?)\)/);

    let score: number | null = null;
    let setScores: number[] = [];

    if (match) {
        // 1. Extract the main score
        const scoreStr = match[1];
        const val = parseInt(scoreStr, 10);
        score = isNaN(val) ? null : val;

        // 2. Extract and parse all set scores as a flat array for THIS team's cell
        const setsStr = match[2];
        setScores = setsStr
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));
    } else {
        // Handle cases where only a simple score number might exist without sets
        const val = parseInt(trimmedContent, 10);
        score = isNaN(val) ? null : val;
        setScores = [];
    }

    return { score, setScores };
}

// --- CORE ASYNC FUNCTION ---

/**
 * Fetches and parses the daily scores page from HCAA, including the date of the games.
 * @param params - The search parameters for the POST request.
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

    const url = 'https://www.hcaa.ca/viewScores.php';
    const postBody = new URLSearchParams({
        leagueid, dateSelect, schoolSelect, leagueSelect,
    }).toString();

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: postBody,
        });
    } catch (e) {
        if (e instanceof Error) {
            console.error("Network error during fetch:", e.message);
        }
        return [];
    }

    // Ignore status code and attempt to parse
    const html = await response.text();
    const { document } = parseHTML(html);

    const groupedResults: LeagueGroup[] = [];
    let currentLeague: string | null = null;
    let currentGames: Omit<GameScore, 'league'>[] = [];
    let lastGame: Omit<GameScore, 'league'> | null = null;
    let currentDate: string | undefined = undefined; // Tracks the most recently seen date heading

    // 2. Iterate through all table rows
    document.querySelectorAll('table tr').forEach((tr: Element) => {
        const th = tr.querySelector('th');
        const td = tr.querySelector('td');
        const cells = Array.from(tr.querySelectorAll('td'));

        // --- A. LEAGUE HEADER: Row contains a <th> tag ---
        if (th) {
            // Push the previous group (if any)
            if (currentLeague && currentGames.length > 0) {
                groupedResults.push({ league: currentLeague, games: currentGames });
            }
            currentLeague = th.textContent?.trim() ?? null;
            currentGames = [];
            lastGame = null;
            currentDate = undefined; // Reset date when a NEW league starts
            return;
        }

        // Must have a current league to proceed
        if (!currentLeague) return;

        // --- B. DATE ROW: Row contains a <td> with colspan="4" and a bold date ---
        if (td && td.getAttribute('colspan') === '4') {
            const dateSpan = td.querySelector('span[style*="font-weight:bold"]');
            if (dateSpan) {
                const rawDate = dateSpan.textContent?.trim();
                // Check for a date format like "Day, Month DD, YYYY"
                if (rawDate && /[A-Za-z]{3,},\s[A-Za-z]{3,}\s\d{1,2},\s\d{4}/.test(rawDate)) {
                    // UPDATE currentDate: This date applies to all subsequent games until the next date/league heading
                    currentDate = rawDate;
                    return; // Skip date row
                }
            }
        }

        // Skip the table header row (Visitor, Score, Score) that may appear after the date
        if (cells.length >= 3 &&
            cells[0].textContent?.trim().toLowerCase() === 'visitor' &&
            cells[1].textContent?.trim().toLowerCase() === 'score') {
            return;
        }

        // --- C. GAME/NOTE/LOCATION ROWS ---

        // Check if this is a game row (must have at least one school link)
        const schoolLinks = Array.from(tr.querySelectorAll('a[href*="viewScores.php?leagueid="]'));

        // Handle Note/Location Row if no school links are found
        if (schoolLinks.length === 0) {
            // Check for a row that has the specific two-cell structure for Location/Notes
            if (cells.length === 2 && cells.every(td => td.getAttribute('colspan') === '2') && lastGame) {

                // Cell 1: Location (e.g., "Location: Milton Curling Club")
                const locationTd = cells[0];
                // Cell 2: Notes (e.g., "Notes: Regular Season...")
                const noteTd = cells[1];

                // 1. Extract Location
                if (locationTd) {
                    // Get all text content, clean up whitespace.
                    let rawLocation = locationTd.textContent?.replace(/\s+/g, ' ').trim() ?? '';

                    // The <a> tag inside the cell might have content, try to isolate the location text.
                    // A robust way is to strip the anchor's text (if any) and clean the rest.
                    const anchor = locationTd.querySelector('a');
                    if (anchor) {
                        const anchorText = anchor.textContent?.trim() ?? '';
                        rawLocation = rawLocation.replace(anchorText, '').replace(/\s+/g, ' ').trim();
                    }

                    // Strip the leading "Location: " and clean again
                    const finalLocation = rawLocation.replace(/^Location:\s*/i, '').trim();

                    if (finalLocation.length > 0) {
                        // Attach location to the last parsed game
                        (lastGame as GameScore).location = finalLocation;
                    }
                }

                // 2. Extract Notes (Refined)
                const notes = noteTd?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
                if (notes) {
                    // Strip the leading "Notes: "
                    lastGame.notes = notes.replace(/^Notes:\s*/i, '').trim();
                }

                return;
            }

            // Fallback for single cell Notes (if the location cell isn't present for some reason)
            const noteTd = cells.find(td =>
                (td.textContent?.includes('Notes') ?? false)
            );
            const notes = noteTd?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

            if (notes && lastGame) {
                lastGame.notes = notes.replace(/^Notes:\s*/i, '').trim();
            }

            return; // Skip non-game rows
        }

        let time: string | null = null;
        let visitorScore: number | null = null;
        let homeScore: number | null = null;
        let homeSetScores: number[] = [];
        let visitorSetScores: number[] = [];
        let visitorSchool: string = '';
        let homeSchool: string = '';

        // 1. Identify and Extract Schools
        visitorSchool = schoolLinks[1]?.textContent?.trim() ?? '';
        homeSchool = schoolLinks[0]?.textContent?.trim() ?? '';

        // 2. Check for Scheduled Game (Time) or Scored Game
        const timeCell = cells.find(td => {
            const colspan = td.getAttribute('colspan');
            const text = td.textContent?.trim() ?? '';
            return colspan === '2' && (/\d{1,2}:\d{2} (AM|PM)/.test(text) || /TBA/i.test(text));
        });

        if (timeCell) {
            // **Scheduled Game Found**
            time = timeCell.textContent?.trim() ?? null;
        } else if (cells.length >= 3) {
            // **Scored Game**
            const visitorScoreCell = cells[1];
            const homeScoreCell = cells[2];

            if (visitorScoreCell && homeScoreCell) {
                const visitorData = parseScoreAndSets(visitorScoreCell.textContent ?? '');
                const homeData = parseScoreAndSets(homeScoreCell.textContent ?? '');

                visitorScore = visitorData.score;
                homeScore = homeData.score;
                visitorSetScores = visitorData.setScores;
                homeSetScores = homeData.setScores;
            }
        } else {
            return; // Skip rows that aren't recognizable as a time/score row
        }

        // 3. Construct Game Object, now correctly including the date
        const game: Omit<GameScore, 'league'> = {
            time,
            date: currentDate, // <<< Use the most recent date here
            schools: [visitorSchool, homeSchool].filter(s => s.length > 0),
            scores: {
                visitor: visitorScore,
                home: homeScore,
            },
            sets: (homeSetScores.length > 0 || visitorSetScores.length > 0) ? {
                home: homeSetScores,
                visitor: visitorSetScores,
            } : undefined,
            // Notes and Location will be added later if available in the subsequent note/location row
        };

        // Clean up: remove the 'sets' object entirely if no set data was found
        if (game.sets && game.sets.home.length === 0 && game.sets.visitor.length === 0) {
            delete game.sets;
        }

        currentGames.push(game);
        lastGame = game;
    });

    // 4. Push the last group
    if (currentLeague && currentGames.length > 0) {
        groupedResults.push({ league: currentLeague, games: currentGames });
    }

    // 5. Flatten the structure: one array, adding league
    const flatResults: GameScore[] = [];
    for (const group of groupedResults) {
        group.games.forEach((game) => {
            // Reconstruct the full GameScore object
            flatResults.push({
                ...game,
                league: group.league, // Add league name from the group
            } as GameScore);
        });
    }

    return flatResults;
}