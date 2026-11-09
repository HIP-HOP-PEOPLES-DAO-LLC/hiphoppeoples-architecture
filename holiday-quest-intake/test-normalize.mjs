import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {normalizeVerifiedSubmission:normalize}=require('./normalize-verified-jotform.js');
const base={id:'987654321012345',form_id:'263122907625052',answers:{
  3:{name:'fullname1',text:'Your name',answer:{first:'Morgan',last:'Merchant'}},
  4:{name:'businessName',text:'Business or organization name',answer:'Greenville Books'},
  6:{name:'email',text:'Email address',answer:'morgan@example.org'},
  7:{name:'phone',text:'Phone number',answer:{full:'2525550117'}},
  9:{name:'address',text:'Business location in Eastern North Carolina',answer:{city:'Greenville',state:'NC'}},
  11:{name:'radio9',text:'What are you inquiring about?',answer:'Business participation'},
  12:{name:'checkbox10',text:'Which opportunity areas interest you? Select all that apply.',answer:['Community storytelling or media']},
  15:{name:'timeline',text:'When are you hoping to explore this opportunity?',answer:'Exploring'},
  16:{name:'heard',text:'How did you hear about Holiday Quest or Hip Hop Peoples?',answer:'Instagram'},
  17:{name:'preferred',text:'How would you prefer the team to follow up?',answer:'Email'},
  21:{name:'contactPermission',text:'Contact permission',answer:'I authorize contact about this specific inquiry'},
  22:{name:'marketing',text:'Optional marketing email opt-in',answer:''}
}};
let out=normalize(base);
assert.equal(out.routing_tag,'MERCHANT_HOLIDAY_QUEST');
assert.equal(out.airtable_table_id,'tblcKNPZrIJO8hx1a');
assert.equal(out.airtable_fields.Lead_ID,'JOTFORM_HQ_987654321012345');
assert.equal(out.airtable_fields.Source_Method,'CRM Source');
assert.equal(out.airtable_fields.Consent_Status,'Documented');
assert.match(out.airtable_fields.Notes,/MarketingOptIn=no/);
assert.doesNotMatch(out.airtable_fields.Notes,/WORKFORCE/);
assert.equal(out.skip_crm_write,false);
const reject=(change)=>{assert.throws(()=>normalize({...base,...change}));};
reject({form_id:'000000000000000'});
reject({id:'notnumeric'});
reject({answers:{...base.answers,21:{name:'contactPermission',text:'Contact permission',answer:'No'}}});
reject({answers:{...base.answers,6:{name:'email',text:'Email address',answer:'not an email'}}});
const qa=normalize({...base,answers:{...base.answers,4:{name:'businessName',text:'Business or organization name',answer:'QA SYNTHETIC merchant'}}});
assert.equal(qa.skip_crm_write,true);
assert.equal(qa.airtable_fields,undefined);
console.log('PASS: Holiday Quest verified Jotform mapping, consent, dedupe key, QA quarantine and source controls');
