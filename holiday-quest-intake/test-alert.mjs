import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('./build-alert.js',import.meta.url),'utf8');
const id='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const row={dlq_id:id,target_system:'HubSpot',status:'abandoned',retry_count:5,max_retries:5,alert_claim_token:'12345678-1234-4123-8123-123456789abc',payload:{email:'private@example.com'},error_message:'service_role_secret_token'};
function run(rows){return new Function('$input',code)({all:()=>rows.map(json=>({json}))});}
const a=run([row]);assert.equal(a.length,1);
assert.match(a[0].json.subject,/ACTION REQUIRED/);
assert.match(a[0].json.body,/manual operator review/);
assert.ok(!JSON.stringify(a).includes('private@example.com'));
assert.ok(!JSON.stringify(a).includes('service_role_secret_token'));
assert.equal(run([{...row,status:'pending_retry'}]).length,0);
assert.equal(run([{...row,alert_sent_at:'2026-11-09T00:00:00Z'}]).length,0);
assert.equal(run([{...row,retry_count:4}]).length,0);
assert.equal(run([row,row]).length,1);
console.log('PASS: Holiday Quest DLQ abandoned-alert static safety tests');
