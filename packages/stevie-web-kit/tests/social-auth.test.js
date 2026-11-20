import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOAuthRedirect,
  startSocialSignIn,
  getSignedInPlayer,
  createGuestSession,
} from '../src/auth/social-auth.js';

const calls=[];
const supabase={auth:{
  signInWithOAuth: async request => {calls.push(request);return {data:{url:'https://accounts.example/authorize'},error:null}},
  getUser: async()=>({data:{user:{id:'test-player-1',email:'relay@example.test',email_confirmed_at:'2026-11-20T00:00:00Z'}},error:null})
}};

test('redirect uses configured HTTPS site origin only',()=>{
  assert.equal(buildOAuthRedirect('https://example.org','/emerald-city/'), 'https://example.org/emerald-city/');
  assert.equal(buildOAuthRedirect('http://localhost:8765','/emerald-city/'), 'http://localhost:8765/emerald-city/');
  assert.throws(()=>buildOAuthRedirect('http://example.org'));
  assert.throws(()=>buildOAuthRedirect('https://example.org/path'));
  assert.throws(()=>buildOAuthRedirect('https://example.org','//evil.example'));
  assert.throws(()=>buildOAuthRedirect('https://example.org','/auth?redirect=https://evil.example'));
});
test('Google OAuth uses only configured callback',async()=>{
  const x=await startSocialSignIn({supabase,provider:'google',siteOrigin:'https://example.org'});
  assert.equal(x.ok,true);
  assert.deepEqual(calls.at(-1),{provider:'google',options:{redirectTo:'https://example.org/emerald-city/'}});
});
test('Apple OAuth uses only configured callback',async()=>{
  const x=await startSocialSignIn({supabase,provider:'apple',siteOrigin:'https://example.org'});
  assert.equal(x.ok,true);
  assert.equal(calls.at(-1).provider,'apple');
});
test('unknown provider is rejected without calling Supabase',async()=>{
  const before=calls.length;
  const x=await startSocialSignIn({supabase,provider:'facebook',siteOrigin:'https://example.org'});
  assert.equal(x.code,'PROVIDER_NOT_ALLOWED');
  assert.equal(calls.length,before);
});
test('malicious redirect is rejected before calling Supabase',async()=>{
  const before=calls.length;
  const x=await startSocialSignIn({supabase,provider:'google',siteOrigin:'https://evil.example/path'});
  assert.equal(x.code,'REDIRECT_NOT_ALLOWED');
  assert.equal(calls.length,before);
});
test('getUser returns server checked Supabase identity, not caller player-id',async()=>{
  const x=await getSignedInPlayer({supabase});
  assert.deepEqual(x,{ok:true,playerId:'test-player-1',email:'relay@example.test',emailVerified:true});
});
test('unauthenticated player stays unsigned',async()=>{
  const x=await getSignedInPlayer({supabase:{auth:{getUser:async()=>({data:{user:null},error:null})}}});
  assert.equal(x.code,'NOT_SIGNED_IN');
});
test('guest cannot receive permanent server XP',()=>{
  assert.equal(createGuestSession().permanentXpEnabled,false);
});
test('provider errors fail closed',async()=>{
  const x=await startSocialSignIn({supabase:{auth:{signInWithOAuth:async()=>({data:null,error:{message:'disabled'}})}},provider:'google',siteOrigin:'https://example.org'});
  assert.equal(x.code,'OAUTH_FAILED');
});
