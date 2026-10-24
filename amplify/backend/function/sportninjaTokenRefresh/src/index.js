/**
 * sportninjaTokenRefresh
 *
 * Runs on a schedule (daily). Logs in to SportNinja with the credentials stored
 * as Amplify function secrets, and saves the resulting bearer token to SSM at
 * /sportninja/<env>/token as a SecureString:
 *   { "token": "...", "expiresAt": "2026-10-31T17:44:49Z", "fetchedAt": "..." }
 *
 * It only logs in when the stored token is missing or expires within
 * REFRESH_WITHIN_MS, so a daily schedule means ~1 login per 5 days with plenty
 * of margin if a run fails. Invoke with {"force": true} to refresh immediately.
 *
 * Never logs the token or password.
 */
const {
  SSMClient,
  GetParameterCommand,
  GetParametersCommand,
  PutParameterCommand,
} = require('@aws-sdk/client-ssm');

const ssm = new SSMClient({});
const API = 'https://metal-api.sportninja.net/v1';
const TOKEN_PARAM = `/sportninja/${process.env.ENV}/token`;
const REFRESH_WITHIN_MS = 2 * 24 * 60 * 60 * 1000; // refresh when < 2 days left

/** Amplify Gen 1 secrets: process.env[NAME] holds the SSM path, not the value. */
async function readCredentials() {
  const paths = ['SN_EMAIL', 'SN_PASSWORD'].map((n) => process.env[n]);
  if (paths.some((p) => !p)) {
    throw new Error('SN_EMAIL / SN_PASSWORD secrets are not configured on this function');
  }
  const { Parameters = [] } = await ssm.send(
    new GetParametersCommand({ Names: paths, WithDecryption: true }),
  );
  const byPath = Object.fromEntries(Parameters.map((p) => [p.Name, p.Value]));
  const email = byPath[process.env.SN_EMAIL];
  const password = byPath[process.env.SN_PASSWORD];
  if (!email || !password) throw new Error('Could not read SportNinja credentials from SSM');
  return { email, password };
}

async function readStoredToken() {
  try {
    const r = await ssm.send(new GetParameterCommand({ Name: TOKEN_PARAM, WithDecryption: true }));
    return JSON.parse(r.Parameter.Value);
  } catch (e) {
    if (e.name === 'ParameterNotFound') return null;
    throw e;
  }
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://app.sportninja.com',
      Referer: 'https://app.sportninja.com/',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    // Body may echo the email; keep it short and never include the password.
    const text = (await res.text()).slice(0, 300);
    throw new Error(`SportNinja login failed: ${res.status} ${text}`);
  }
  const body = await res.json();
  if (!body.access_token) throw new Error('SportNinja login returned no access_token');
  const expiresAt = body.expires_at
    || new Date(Date.now() + (body.expires_in || 0) * 1000).toISOString();
  return { token: body.access_token, expiresAt };
}

exports.handler = async (event = {}) => {
  const force = event && event.force === true;

  if (!force) {
    const stored = await readStoredToken();
    const msLeft = stored ? Date.parse(stored.expiresAt) - Date.now() : -1;
    if (msLeft > REFRESH_WITHIN_MS) {
      console.log(`[token] still valid until ${stored.expiresAt}; skipping login`);
      return { refreshed: false, expiresAt: stored.expiresAt };
    }
  }

  const { email, password } = await readCredentials();
  const { token, expiresAt } = await login(email, password);

  await ssm.send(new PutParameterCommand({
    Name: TOKEN_PARAM,
    Value: JSON.stringify({ token, expiresAt, fetchedAt: new Date().toISOString() }),
    Type: 'SecureString',
    Overwrite: true,
  }));

  console.log(`[token] refreshed (…${token.slice(-6)}), expires ${expiresAt}`);
  return { refreshed: true, expiresAt };
};