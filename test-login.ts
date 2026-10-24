const API = 'https://metal-api.sportninja.net/v1';
const BROWSERISH = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Origin: 'https://app.sportninja.com',
    Referer: 'https://app.sportninja.com/',
};

async function main() {
    const email = process.env.SN_EMAIL;
    const password = process.env.SN_PASSWORD;
    if (!email || !password) throw new Error('Set SN_EMAIL and SN_PASSWORD');

    const login = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: BROWSERISH,
        body: JSON.stringify({ email, password }),
    });
    const body = await login.json();
    console.log('login', login.status, 'expires_at', body.expires_at);
    if (!login.ok) return console.log(body);

    const qs = new URLSearchParams({
        organization_id: 'QupnLFdX3cP5gtwB', recursive: '1', per_page: '5', page: '1', order: 'asc',
    });
    const games = await fetch(`${API}/games/follow?${qs}`, {
        headers: { ...BROWSERISH, Authorization: `Bearer ${body.access_token}` },
    });
    const g = await games.json();
    console.log('games', games.status, 'rows', g.data?.length, 'pages', g.meta?.pagination?.total_pages);
}
main();