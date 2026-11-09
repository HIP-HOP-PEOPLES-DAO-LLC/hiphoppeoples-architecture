# Emerald City Member Hub — controlled deployment candidate (2026-11-09)

## What is actually built
- Responsive 26.8 KB browser interface at `index.html`.
- Supabase email OTP/magic-link sign-in using the **public publishable key**, never a service-role credential.
- Authenticated back office, personal human-reviewed People's Pass application, database-owned status.
- Staff/Fundador role detection **from RLS-protected** `public.profiles` (role bootstrap for founding email already exists).
- Admin-only applicant queue and manual approve/decline/revoke actions against pre-existing `passport_queue` and `passport_review` RPCs. The database separately blocks self-review.
- Invites point to the already-working free community `/join` endpoint. No claimed identity-linked referral tree or revenue.
- Three playable education-only District 00 scenario checkpoints (no persisted XP, bank balance, wallet or credential).
- Reserved **HHP-000001** is explicitly marked NOT YET BOUND to the live passport database.

## Source of truth and environment
- Supabase project: `hhp-peoples-feed` / `jvbwmffnopwcypjrokex`. No SQL migration or Auth user was created by this branch.
- Existing production tables: `public.profiles`, `public.member_passports`. The founder email already has an `admin` role-bootstrap mapping, to be applied when the founder creates their own legitimate Supabase Auth session.
- Existing RPCs: `passport_apply`, `passport_queue`, `passport_review`, `passport_check`.
- No proprietary ID generator, payment processor, referral reward or gaming wallet is introduced.
- The public Supabase project URL and publishable browser key in `index.html` are intended to be public.

## Hard blockers and launch requirements
1. **Hosting:** Vercel connector returned HTTP 403 for both a new project and a preview deployment to the existing `hhp-identity-frontdoor` project. The live Supabase Edge Function `emerald-city-member-hub` was deployed, but the Supabase gateway forces HTML responses to `text/plain` with a sandbox CSP. **Do not direct applicants to the Edge Function as an HTML page.** Instead deploy this static `index.html` on an approved HTML host.
2. **Auth redirect:** Add the final HTTPS portal URL to Supabase Authentication → URL Configuration → Redirect URLs before testing an email magic link. The email template must support the manual six-digit code route if you want code entry instead.
3. **Founder's first sign-in:** User enters their own email/code. Existing auth.users count was zero at inspection, so no real account can be bound for HHP-000001 before their first legitimate sign-in.
4. **Founder record:** An independent authorized issuance process must bind HHP-000001 to the founder's real auth UUID and recorded chain-of-title; **do not** use the ordinary admin self-approval function or insert a fabricated UUID.
5. **Member application:** `passport_apply` is real and authenticated, but needs an actual signed-in browser QA. Approval is a separate manual action and must check identity/permission evidence.
6. **Enrollment tree:** Invitations currently have source tags in HHP `/join`, **not** an identity-linked genealogy table. A durable network tree requires a separate reviewed migration with RLS and abuse protections.
7. **Commerce:** No paid Pass checkout or credits enabled. Seller-of-record, price, refunds, processor, permits and consent controls must be verified first.
8. **Game:** District 00 is a local education prototype, not a persistent Emerald City role-playing multiplayer engine.

## End-to-end human test
- Open the authorized HTTPS `index.html`, enter founder email, receive email sign-in, sign in. Confirm `public.profiles.role='admin'`.
- Submit the personal Passport application to confirm a PENDING row. Confirm HHP-000001 is still unissued without independent signoff.
- Sign in through a *separate* consenting test member and submit a PENDING application.
- Confirm founder dashboard queue shows only authorized applicants and a clearly manual approval click.
- After human review evidence, approve the consenting test member via RPC; verify their status and unique issued ID. Do not purport to validate G0 founder binding by doing so.
- Test signout, repeated login, expired OTP, duplicate applications, and denial of non-admin queue.
- Confirm live `/join` source routing (already verified server-side in a separate task).
- Retain QA audit records, revoke only expressly authorized test IDs, and preserve production application history.

## Publication
This branch is **staged for human-reviewed deployment**, not an announcement that enrollment/IDs/game have launched. Public magazine homepage is unchanged.
