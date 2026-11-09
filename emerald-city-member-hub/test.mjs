import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('emerald-city-member-hub/index.html','utf8');
assert.match(html,/<title>Emerald City/i);
assert.match(html,/signInWithOtp/);
assert.match(html,/verifyOtp/);
assert.match(html,/passport_apply/);
assert.match(html,/passport_queue/);
assert.match(html,/passport_review/);
assert.match(html,/HHP-000001/);
assert.match(html,/No paid checkout/i);
assert.doesNotMatch(html, /SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i);
const match=html.match(/<script type="module">([\s\S]*?)<\/script>/);
assert.ok(match, 'module script exists');
const body=match[1].replace(/^import\s+.+?;\s*$/m,'');
new Function(body); // compile only; do not execute network/browser actions
console.log('PASS: Emerald City member hub source syntax and basic control checks');
