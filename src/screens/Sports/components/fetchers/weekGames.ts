import { parseHTML } from 'linkedom';

// --- INTERFACES FOR TYPE SAFETY ---

/** Defines the structure of the input parameters for the fetch request. */
export interface ScheduleParams {
    schoolSelect?: string;
    leagueSelect?: string;
    dateStr?: string;
    yearWeek?: string;
    currentDate?: string;
    divisionid?: string;
    schoolid?: string;
}

/** Defines the structure of a single game object. */
export interface Game {
    league: string | null;
    schools: {
        visitor: string | null;
        home: string | null;
    };
    scores: {
        visitor: number | null;
        home: number | null;
    };
    location: string | null;
    notes: string | null;
}

/** Defines the structure for a single day in the weekly schedule. */
export interface DaySchedule {
    date: string;
    games: Game[];
}

// --- CORE ASYNC FUNCTION ---

/**
 * Fetches and parses the weekly sports schedule from HCAA, ignoring the HTTP status code.
 * This version is specifically tuned to the HTML structure provided.
 * @param params - The search parameters for the POST request.
 * @returns A promise that resolves to the structured weekly schedule.
 */
export async function weekGames(params: ScheduleParams = {}): Promise<DaySchedule[]> {

    const defaultParams: Required<ScheduleParams> = {
        schoolSelect: "ALL",
        leagueSelect: "ALL",
        dateStr: "Sunday September 21, 2025 to Saturday September 27, 2025",
        yearWeek: "202538",
        currentDate: "2025-09-21",
        divisionid: "",
        schoolid: "ALL",
    };

    const {
        schoolSelect, leagueSelect, dateStr, yearWeek,
        currentDate, divisionid, schoolid
    } = { ...defaultParams, ...params };

    const url = 'https://www.hcaa.ca/weeklySchedule.php';
    const postBody = new URLSearchParams({
        schoolSelect, leagueSelect, dateStr, yearWeek,
        currentDate, divisionid, schoolid
    }).toString();

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: postBody,
        });
    } catch (e) {
        // e is typed as 'any' or 'unknown' in a catch block
        if (e instanceof Error) {
            console.error("Network error during fetch:", e.message);
        } else {
            console.error("Unknown network error:", e);
        }
        return [];
    }

    // Ignore status code and attempt to parse
    const html = await response.text();
    const { document } = parseHTML(html);

    const weeklySchedule: DaySchedule[] = [];
    let currentDay: DaySchedule | null = null;
    let currentLeague: string | null = null;
    let currentGame: Game | null = null;

    // Use querySelectorAll to find table rows
    document.querySelectorAll('table tr').forEach((tr: Element) => {
        // --- A. DAY HEADER: Contains <h3> ---
        const dayHeader = tr.querySelector('td h3');
        if (dayHeader) {
            currentDay = { date: dayHeader.textContent.trim(), games: [] };
            weeklySchedule.push(currentDay);
            currentLeague = null;
            return;
        }

        if (!currentDay) return;

        // --- B. LEAGUE HEADER: Contains <th colspan="4"> with an <a> tag ---
        const leagueHeader = tr.querySelector('th[colspan="4"] a');
        if (leagueHeader) {
            currentLeague = leagueHeader.textContent.trim();
            currentGame = null;
            return;
        }

        // --- C. GAME ROWS: Use Array of cells for reliable indexing ---
        const cells: Element[] = Array.from(tr.querySelectorAll('td'));

        if (cells.length === 0) return;

        // Ensure the first cell exists before attempting to read content
        const firstCellText = cells[0].textContent?.trim() ?? '';

        // 1. Visitor Row: First cell is "Visitor:"
        if (firstCellText === 'Visitor:' && currentLeague) {
            // TypeScript uses optional chaining (?) and nullish coalescing (??)
            const schoolName = cells[1]?.textContent?.trim() ?? '';
            const scoreText = cells[2]?.textContent?.trim() ?? '';
            const score = parseInt(scoreText, 10);

            // Create a new game object
            currentGame = {
                league: currentLeague,
                schools: { visitor: schoolName, home: null },
                scores: { visitor: isNaN(score) ? null : score, home: null },
                location: null,
                notes: null
            };
            currentDay.games.push(currentGame);
            return;
        }

        // 2. Home Row: First cell is "Home:"
        if (firstCellText === 'Home:' && currentGame) {
            const schoolName = cells[1]?.textContent?.trim() ?? '';
            const scoreText = cells[2]?.textContent?.trim() ?? '';
            const score = parseInt(scoreText, 10);

            currentGame.schools.home = schoolName;
            currentGame.scores.home = isNaN(score) ? null : score;
            return;
        }

        // 3. Location/Notes Row: Single cell with colspan="4" and "Location:"
        const colspanAttr = cells[0].getAttribute('colspan');
        if (colspanAttr === '4' && firstCellText.includes('Location:') && currentGame) {

            // Location is the text content of the single cell
            // We use replace with a RegExp to handle removing the HTML input tag content
            let locationText = cells[0].innerHTML;

            // Clean up the location text using innerHTML and string manipulation
            currentGame.location = locationText
                .replace(/Location:\s*/, '') // Remove "Location: "
                .replace(/<input.*?\/?>/, '') // Remove the input tag (must use innerHTML)
                .replace(/\s*Map\s*$/, '') // Remove ' Map' text which might be left after button removal
                .trim();

            currentGame.notes = null; // No separate notes cell

            currentGame = null; // Complete the current game object
            return;
        }
    });

    return weeklySchedule;
}