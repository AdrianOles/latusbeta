const cheerio = require('cheerio');

exports.handler = async (event) => {
    // Default parameters for the example/testing. 
    // In a real scenario, you'd likely make these dynamic from `event.queryStringParameters`.
    const query = event.queryStringParameters || {};

    const schoolSelect = query.schoolSelect || "ALL";
    const leagueSelect = query.leagueSelect || "ALL"; // Using 3 for a specific league set
    const dateStr = query.dateStr || "Sunday September 21, 2025 to Saturday September 27, 2025";
    const yearWeek = query.yearWeek || "202538";
    const currentDate = query.currentDate || "2025-09-21";
    const divisionid = query.divisionid || "";
    const schoolid = query.schoolid || "ALL";

    // 1. Fetch weekly schedule page
    const response = await fetch('https://www.hcaa.ca/weeklySchedule.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            schoolSelect,
            leagueSelect,
            dateStr,
            yearWeek,
            currentDate,
            divisionid,
            schoolid
        }),
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Array to hold the final results grouped by day
    const weeklySchedule = [];

    // State variables for tracking the current context
    let currentDay = null;
    let currentLeague = null;
    let currentGame = null;

    // 2. Iterate through all table rows
    $('table tr').each((i, tr) => {
        const $tr = $(tr);

        // --- A. DAY HEADER: Contains <h3> (e.g., "Tuesday, September 23, 2025") ---
        const dayHeader = $tr.find('td h3');
        if (dayHeader.length > 0) {
            const dayText = dayHeader.text().trim();
            // Create a new day entry
            currentDay = {
                date: dayText,
                games: []
            };
            weeklySchedule.push(currentDay);
            currentLeague = null; // Reset league context
            return;
        }

        // Must have a current day to proceed
        if (!currentDay) return;

        // --- B. LEAGUE HEADER: Contains <th colspan="4"> with an <a> tag (e.g., "Junior Boys Volleyball") ---
        const leagueHeader = $tr.find('th[colspan="4"] a');
        if (leagueHeader.length > 0) {
            currentLeague = leagueHeader.text().trim();
            currentGame = null; // Reset game context
            return;
        }

        // --- C. GAME ROWS: Identify Visitor Row, Home Row, and Location/Notes Row ---

        // 1. Visitor Row: Contains 'Visitor' text and has an <a> link for the school
        const visitorCell = $tr.find('td:contains("Visitor")');
        if (visitorCell.length > 0) {
            const schoolName = visitorCell.next('td').text().trim();
            const scoreText = visitorCell.next('td').next('td').text().trim();
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

        // 2. Home Row: Contains 'Home' text and updates the current game
        const homeCell = $tr.find('td:contains("Home")');
        if (homeCell.length > 0 && currentGame) {
            const schoolName = homeCell.next('td').text().trim();
            const scoreText = homeCell.next('td').next('td').text().trim();
            const score = parseInt(scoreText, 10);

            currentGame.schools.home = schoolName;
            currentGame.scores.home = isNaN(score) ? null : score;
            return;
        }

        // 3. Location/Notes Row: Starts with 'Location:' or 'Notes:' in one of the cells
        const locationCell = $tr.find('td:contains("Location:")');
        if (locationCell.length > 0 && currentGame) {
            // Location is the text after "Location: " and before " Map"
            const locationText = locationCell.text().trim();
            currentGame.location = locationText
                .replace(/^Location:\s*/, '') // Remove "Location: "
                .replace(/\s*Map$/, '')      // Remove " Map"
                .trim();

            // Notes is the text in the cell next to the location cell
            const notesCell = locationCell.next('td');
            if (notesCell.length > 0) {
                currentGame.notes = notesCell.text().trim().replace(/^Notes:\s*/, '').trim() || null;
            }
            // The location/notes row completes the current game object
            currentGame = null;
            return;
        }

    });

    // 3. Return the grouped structure
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weeklySchedule),
    };
};