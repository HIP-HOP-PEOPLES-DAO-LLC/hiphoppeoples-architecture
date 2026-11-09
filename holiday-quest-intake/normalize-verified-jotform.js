// n8n Code node / Node.js normalization. For VERIFIED Jotform API submission ONLY.
// Webhook POST is an untrusted notification. Obtain submission through your
// authenticated Jotform credential and validate its formID before calling this.
const EXPECTED_FORM = '263122907625052';
const LEAD_TABLE = 'tblcKNPZrIJO8hx1a';
const SOURCE = 'MERCHANT_HOLIDAY_QUEST';

function plain(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(plain).filter(Boolean).join(' | ');
  if (typeof v === 'object') {
    if (v.first || v.last) return [v.first,v.last].filter(Boolean).join(' ');
    if (v.full) return String(v.full);
    if (v.city || v.state) return [v.addr_line1,v.addr_line2,v.city,v.state,v.postal].filter(Boolean).join(', ');
    return '';
  }
  return String(v).trim();
}
function unwrap(item) {
  if (!item || typeof item!=='object') throw new Error('Verified submission missing');
  return item.content && typeof item.content==='object' ? item.content : item;
}
function questions(data) {
  const x=data.answers || {};
  return Object.values(x).filter(z=>z && typeof z==='object' && ('answer' in z)).map(z=>({
    key:String(z.name||''), text:String(z.text||'').toLowerCase().replace(/\s+/g,' ').trim(), value:z.answer
  }));
}
function get(list,pattern, fallback='') {
  const f=list.find(x=>pattern.test(x.text) || pattern.test(x.key.toLowerCase()));
  return f? plain(f.value):fallback;
}
function normalizeVerifiedSubmission(data) {
  const s=unwrap(data);
  const formId=String(s.form_id||s.formID||s.formid||'');
  if(formId!==EXPECTED_FORM) throw new Error('Wrong form ID; no downstream write');
  const id=String(s.id||s.submissionID||s.submission_id||'');
  if(!/^\d{10,25}$/.test(id)) throw new Error('Missing canonical submission ID');
  const q=questions(s);
  if(!q.length) throw new Error('Verified Jotform answers missing');
  const contactPermission=get(q,/^(contact permission|contactpermission)$/i);
  const affirmative= /^(yes|true|1|on|checked|i agree|i consent)$/i.test(contactPermission)
    || /^i (authorize|agree|consent)\b/i.test(contactPermission);
  if(!affirmative) throw new Error('No affirmative specific contact consent');
  const business=get(q,/^business or organization name$/);
  const contact=get(q,/^your name$/);
  const email=get(q,/^email address$/).toLowerCase();
  if(!business || !contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Required merchant contact data missing');
  const isSynthetic=/\b(?:qa|synthetic|test only|do not contact)\b/i.test([business,contact,email].join(' '));
  // QA records are quarantined: never create a real CRM lead or send outreach.
  if(isSynthetic) return {kind:'synthetic_test',source_form_id:formId,source_submission_id:id,skip_crm_write:true};
  const interest=get(q,/^which opportunity areas interest you/);
  const inquiry=get(q,/^what are you inquiring about/);
  const timeline=get(q,/^when are you hoping/);
  const contactMethod=get(q,/^how would you prefer/);
  const marketing=get(q,/^optional marketing email opt-in$/i);
  const sourceAnswer=get(q,/^how did you hear about/);
  const notes=get(q,/^what would you like the team/);
  const location=get(q,/^business location/);
  const phone=get(q,/^phone number$/);
  const sourceId='JOTFORM_HQ_'+id;
  return {
    kind:'commercial_inquiry',skip_crm_write:false,
    routing_tag:SOURCE,
    canonical_event_id:sourceId,
    source_form_id:formId,source_submission_id:id,
    airtable_base_id:'appapW5T6q04dK6n4',
    airtable_table_id:LEAD_TABLE,
    airtable_fields:{
      Lead_ID:sourceId,
      Contact_Name:contact.slice(0,150),
      Organization:business.slice(0,150),
      Email:email.slice(0,220),
      Phone:phone.slice(0,60),
      Source_Method:'CRM Source', // existing Airtable single-select
      Source_Value:('Jotform Holiday Quest | '+sourceAnswer).slice(0,150),
      Lead_Status:'New',
      Consent_Status:'Documented',
      Notes:[
        'MERCHANT_HOLIDAY_QUEST; INQUIRY ONLY; NO PURCHASE OR RESERVATION',
        'Jotform submission='+id,
        'Location='+location,
        'Interest='+interest,
        'Inquiry='+inquiry,
        'Timeline='+timeline,
        'PreferredContact='+contactMethod,
        'MarketingOptIn='+(/^(yes|true|1|on|checked)$/i.test(marketing)?'yes':'no'),
        'ApplicantNote='+notes
      ].join(' | ').slice(0,1800)
    }
  };
}
if (typeof module!=='undefined' && module.exports) module.exports={normalizeVerifiedSubmission};
// n8n Code node adapter: copy the function above and then uncomment:
// return $input.all().map(item=>({json:normalizeVerifiedSubmission(item.json)}));
