const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async (event) => {
    const query = event.queryStringParameters || {};

    const leagueid = query.leagueid || 'ALL';
    const dateSelect = query.dateSelect || '2025-05-20';
    const schoolSelect = query.schoolSelect || 'ALL';
    const leagueSelect = query.leagueSelect || 'ALL';

    const response = await fetch('https://www.hcaa.ca/viewScores.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            leagueid,
            dateSelect,
            schoolSelect,
            leagueSelect,
        }),
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    let currentLeague = null;
    let currentGames = [];
    let lastGame = null;

    $('table tr').each((_, tr) => {
        const $tr = $(tr);
        const th = $tr.find('th');

        if (th.length > 0) {
            if (currentLeague && currentGames.length > 0) {
                results.push({ league: currentLeague, games: currentGames });
            }
            currentLeague = th.text().trim();
            currentGames = [];
            lastGame = null;
            return;
        }

        const timeCell = $tr.find('td[colspan]').filter((_, td) =>
            !!$(td).text().match(/\d{1,2}:\d{2} (AM|PM)/)
        );
        const time = timeCell.text().trim();

        const schoolLinks = $tr
            .find('a[href*="viewScores.php?leagueid="]')
            .map((_, a) => $(a).text().trim())
            .get();

        const noteTd = $tr
            .find('td[colspan="2"]')
            .filter((_, td) => $(td).text().includes('Notes'));

        const notes = noteTd.text().replace(/\s+/g, ' ').trim();

        const scoreCells = $tr.find('td').filter((_, td) => {
            const $td = $(td);
            const style = $td.attr('style') || '';
            const className = $td.attr('class') || '';
            return (
                style.includes('text-align:center') &&
                (className.includes('lightTableCell') || className.includes('darkTableCell'))
            );
        });

        const scores = scoreCells.map((_, td) => {
            const val = parseInt($(td).text().trim(), 10);
            return isNaN(val) ? null : val;
        }).get();

        if (time || schoolLinks.length > 0) {
            const game = {
                time,
                schools: schoolLinks,
                scores: {
                    visitor: scores[0] ?? null,
                    home: scores[1] ?? null,
                },
            };
            currentGames.push(game);
            lastGame = game;
        } else if (notes && lastGame) {
            lastGame.notes = notes;
        }
    });

    if (currentLeague && currentGames.length > 0) {
        results.push({ league: currentLeague, games: currentGames });
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
    };
};
