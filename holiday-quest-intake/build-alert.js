/** n8n Code node: Run Once for All Items. No emails sent here. */
const rows = $input.all();
const permitted = new Set(['GHL','GoHighLevel','HubSpot','Airtable','Gmail','n8n','Supabase']);
const outputs=[];const seen=new Set();
for (const item of rows) {
  const x=item.json??{};
  if(x.status!=='abandoned'||x.alert_sent_at||!x.alert_claim_token)continue;
  if(!Number.isInteger(Number(x.retry_count))||Number(x.retry_count)<Number(x.max_retries??5))continue;
  const id=String(x.dlq_id??'');
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))continue;
  const target=String(x.target_system??'Unknown');
  const safeTarget=permitted.has(target)?target:'Unknown system';
  const key=id+':'+safeTarget;
  if(seen.has(key))continue; seen.add(key);
  const code=/^[A-Z0-9_\-]{1,50}$/.test(String(x.error_code??''))?String(x.error_code):'SYNC_FAILED';
  const subject=`[HHP ACTION REQUIRED] Holiday Quest sync abandoned · ${safeTarget} · ${id.slice(0,8)}`;
  const body=[
    'A Holiday Quest system-to-system sync has reached its retry limit.','',
    `DLQ reference: ${id}`,`Target system: ${safeTarget}`,`Error code: ${code}`,
    `Retry count: ${Number(x.retry_count)}`,
    'Status: abandoned — manual operator review required',
    'No customer has been contacted and no new billing action is authorized by this alert.','',
    'Operator action: open the restricted DLQ record; inspect the destination response and source event;',
    'verify whether the upstream event has already synced; correct the underlying issue;',
    'then authorize an idempotent replay or mark resolved with human review.','',
    'This email intentionally excludes personal data and raw error messages.'
  ].join('\n');
  outputs.push({json:{dlq_id:id,alert_claim_token:String(x.alert_claim_token),idempotency_key:key,subject,body,staff_recipient:'affishaulworldwide@gmail.com'}});
}
return outputs;