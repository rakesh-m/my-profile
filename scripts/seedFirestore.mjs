/**
 * One-off seed script: writes the résumé content into Firestore at
 * resume/content, using the Firebase CLI's stored credentials (project owner).
 *
 * Because the caller is a project-owner IAM principal (not a Firebase Auth
 * end-user), the Firestore REST write bypasses security rules. This lets us
 * seed the document while client writes remain disabled.
 *
 * Run with Node 20: node scripts/seedFirestore.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Load the résumé data from src/resumeData.js without needing an ESM/CJS
// package type. We read the file, rewrite `export const` -> `const`, evaluate
// it in a sandbox, and collect the named exports. This keeps a single source
// of truth for the content.
function loadSeed() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const src = fs.readFileSync(
    path.join(here, '..', 'src', 'resumeData.js'),
    'utf8'
  );
  const names = [
    'profile',
    'summaryLine',
    'strengths',
    'currentProfile',
    'relevantExperience',
    'pastWork',
    'education',
  ];
  const transformed =
    src.replace(/export\s+const/g, 'const') +
    `\n; module.exports = { ${names.join(', ')} };`;
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(transformed, sandbox);
  return sandbox.module.exports;
}

const seed = loadSeed();

const PROJECT_ID = 'rakesh-profile-85519';

// firebase-tools' public OAuth client (used to refresh CLI tokens).
const CLIENT_ID =
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

function readRefreshToken() {
  const p = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!cfg.tokens || !cfg.tokens.refresh_token) {
    throw new Error('No refresh token found. Run: firebase login');
  }
  return cfg.tokens.refresh_token;
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }).toString();
  const res = await httpsRequest(
    {
      method: 'POST',
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
  if (res.status !== 200) {
    throw new Error(`Token exchange failed (${res.status}): ${res.body}`);
  }
  return JSON.parse(res.body).access_token;
}

// ---- Firestore value encoders (REST API typed values) ----
function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toValue) } };
  }
  if (typeof v === 'object') {
    return { mapValue: { fields: toFields(v) } };
  }
  throw new Error('Unsupported value type: ' + typeof v);
}

function toFields(obj) {
  const fields = {};
  for (const [k, val] of Object.entries(obj)) {
    fields[k] = toValue(val);
  }
  return fields;
}

async function main() {
  const content = {
    profile: seed.profile,
    summaryLine: seed.summaryLine,
    strengths: seed.strengths,
    currentProfile: seed.currentProfile,
    relevantExperience: seed.relevantExperience,
    pastWork: seed.pastWork,
    education: seed.education,
  };

  const refreshToken = readRefreshToken();
  const accessToken = await getAccessToken(refreshToken);

  const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/resume/content`;
  const payload = JSON.stringify({ fields: toFields(content) });

  const res = await httpsRequest(
    {
      method: 'PATCH',
      hostname: 'firestore.googleapis.com',
      path: `/v1/${encodeURI(docPath)}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    payload
  );

  if (res.status !== 200) {
    throw new Error(`Firestore write failed (${res.status}): ${res.body}`);
  }
  console.log('Seeded resume/content successfully.');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
