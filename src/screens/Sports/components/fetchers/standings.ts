import { parseHTML } from 'linkedom';

// --- INTERFACES FOR TYPE SAFETY ---

/** Defines the structure of a single standing record, focused on Team, GP, PTS, and GD. */
export interface StandingRecord {
    team: string;
    GP: number;
    PTS: number;
    // ADDED: Goal Differential
    GD: number;
}

/** Defines the parameters for fetching standings. */
export interface StandingsParams {
    leagueid?: string;
}

// --- HELPER FUNCTION ---

/**
 * Helper function to safely parse an integer from an HTML element's text content.
 * @param cell - The HTML element to parse.
 * @param defaultValue - The value to return if parsing fails.
 * @returns The parsed integer or the default value.
 */
const safeParse = (cell: Element | undefined, defaultValue: number = 0): number => {
    const text = cell?.textContent?.trim() ?? '';
    const val = parseInt(text, 10);
    return isNaN(val) ? defaultValue : val;
};


// --- CORE ASYNC FUNCTION ---

/**
 * Fetches and parses league standings from HCAA by dynamically determining column indices from the header row.
 * Includes logic to calculate Goal Differential (GD) from various aliases.
 * @param params - Optional parameters containing the league ID.
 * @returns A promise that resolves to an array of StandingRecord objects.
 */
export async function getStandings(params: StandingsParams = {}): Promise<StandingRecord[]> {

    const leagueid = params.leagueid || '19';
    const url = `https://www.hcaa.ca/displayStandings.php?leagueid=${leagueid}`;

    let html: string;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'React-Native-App',
            },
        });

        // Ignore status code and read body
        html = await response.text();

    } catch (error) {
        console.error("Network error during fetch:", error instanceof Error ? error.message : "Unknown network error");
        return [];
    }

    const { document } = parseHTML(html);

    const standings: StandingRecord[] = [];

    // --- GD ALIASES ---
    // Define aliases for Points For and Points Against
    const POINTS_FOR_ALIASES = ['RF', 'PF', 'GF', 'PW'];
    const POINTS_AGAINST_ALIASES = ['RA', 'PA', 'GA', 'PL'];

    // --- 1. DYNAMIC INDEX MAPPING (First Pass) ---
    const columnIndices = {
        team: -1,
        GP: -1,
        PTS: -1,
        // ADDED: Indices for Points For and Points Against
        pointsFor: -1,
        pointsAgainst: -1,
    };

    // Find the header row (first <tr> with <th> elements)
    const headerRow = document.querySelector('table tr:has(th)');

    if (headerRow) {
        Array.from(headerRow.querySelectorAll('th')).forEach((th, index) => {
            const headerText = th.textContent?.trim().toUpperCase();

            if (headerText === 'SCHOOL' && columnIndices.team === -1) {
                columnIndices.team = index;
            } else if ((headerText === 'GP' || headerText === 'MP') && columnIndices.GP === -1) {
                columnIndices.GP = index;
            } else if (headerText === 'PTS' && columnIndices.PTS === -1) {
                columnIndices.PTS = index;
            }
            // ADDED: Dynamic mapping for Points For (e.g., GF, PF)
            else if (POINTS_FOR_ALIASES.includes(headerText) && columnIndices.pointsFor === -1) {
                columnIndices.pointsFor = index;
            }
            // ADDED: Dynamic mapping for Points Against (e.g., GA, PA)
            else if (POINTS_AGAINST_ALIASES.includes(headerText) && columnIndices.pointsAgainst === -1) {
                columnIndices.pointsAgainst = index;
            }
        });
    }

    // Validation: Ensure we found all REQUIRED columns (Team, GP, PTS).
    if (columnIndices.GP === -1 || columnIndices.PTS === -1 || columnIndices.team === -1) {
        console.warn("Could not find all required column headers (Team, GP, or PTS). Aborting parsing.");
        return [];
    }

    // --- 2. DATA EXTRACTION (Second Pass) ---
    document.querySelectorAll('tr').forEach((tr: Element) => {
        const cells = Array.from(tr.querySelectorAll('td'));

        // Skip rows that don't have enough cells for the required indices
        if (cells.length <= Math.max(columnIndices.GP, columnIndices.PTS)) return;

        // Extract Team Name from the dynamically found index
        const teamLink = cells[columnIndices.team].querySelector('a');

        // Skip rows without a team link (headers/spacers/footers)
        if (!teamLink) return;

        const teamName = teamLink.textContent?.trim() || '';

        // --- Extract and Parse Stats using Dynamic Indices ---
        const gp = safeParse(cells[columnIndices.GP]);
        const pts = safeParse(cells[columnIndices.PTS]);

        // ADDED: Calculate GD
        let gd = 0;

        // Check if points-for and points-against columns were found in the header
        if (columnIndices.pointsFor !== -1 && columnIndices.pointsAgainst !== -1) {
            const pointsFor = safeParse(cells[columnIndices.pointsFor]);
            const pointsAgainst = safeParse(cells[columnIndices.pointsAgainst]);

            // Calculate the difference: Points For - Points Against
            gd = pointsFor - pointsAgainst;
        }

        standings.push({
            team: teamName,
            GP: gp,
            PTS: pts,
            // ADDED: Include GD
            GD: gd,
        });
    });

    return standings;
}