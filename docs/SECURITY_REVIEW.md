# Security review — PawPark 2027

Reviewed **17 November 2026**, exclusively for **pawpark-2027-web**. This is a focused rules/application review, not a penetration-test certification or a guarantee of launch readiness. [Machine-readable assessment](security-review.json).

## Access boundaries verified

The deployed Firestore rules match the repository version examined. Rules require a verified Google token for **bibi@pawapp.net** to read customer applications or update permitted workflow fields. Authority comes from the signed authentication token, not customer-written role/profile fields. No client may assign itself admin rights. Browser deletes are denied.

Both creates and updates use schema validators. Required fields, bounded strings, field types, allowed statuses and agreement stages are checked. Original customer details and creation timestamps cannot be changed through an admin workflow update. The initial workflow is fixed to New/empty notes/Not started; create timestamps must match server request time.

An application and its notification queue entry must be created atomically. `getAfter()` cross-checks the same reference, type and server timestamp. A queue entry cannot be created by itself to send unrelated references. Neither collection is publicly readable. The worker UID and password sign-in provider are checked explicitly. The worker can read/acknowledge the reference-only queue, **not** customer applications. It has no Google database OAuth authorization or service-account key.

Application fields are rendered with text nodes rather than inserted as customer-supplied HTML. Public Firebase web config identifies the app and is expected in client code; rules, not secrecy of this config, protect records.

The emulator suite passed valid submissions, anonymous/other-account/unverified/wrong-provider access denial, valid admin updates, oversized/invalid/missing fields, immutable fields, role escalation, deletion, atomic queue requirements and worker/customer-data separation. The live unauthenticated customer collection read returned HTTP 403. These tests do not prove every possible implementation or account-level attack impossible.

## Fixed during this handoff

**CSV export formula prefixes:** the earlier export guarded common ASCII prefixes but omitted line feed, full-width formula characters and whitespace-prefixed formula strings. The exporter now prefixes these values as text and keeps CSV quoting. An attack-vector test covers the actual export function, Arabic text, controls, full-width variants and delimiter/quote handling. Spreadsheet programs can alter protection when saving and reopening CSVs; import untrusted fields as text and do not enable formulas/external connections. [OWASP CSV guidance](https://community.owasp.org/attacks/CSV_Injection).

## Remaining launch issues

| Priority | Finding and evidence | Required next step |
| --- | --- | --- |
| Before broad public promotion | **Automated public submissions can exhaust free quotas.** Anyone can create a schema-valid request and matching queue entry. There is no enforced App Check, CAPTCHA, per-client rate limit or abuse budget in this implementation. Size/schema bounds prevent giant records but do not stop many small valid writes, mail digests or account sign-ups. | Add and test suitable bot/abuse controls before a campaign, monitor Firebase/Auth/mail usage and keep Spark. App Check is an additional layer, not a complete rate limiter. Do not describe open validated writes as spam-proof. A trusted rate-limiting backend may need architecture/cost approval; do not enable paid services automatically. |
| Before operational dependence | **No complete automatic recovery backup.** Database deletion protection and client delete denial help, but privileged project owners can still alter data. CSV is not a full database restore artifact. | Agree a private backup/recovery process and retention policy. Any paid export, storage or backup requires approval. Do not store customer exports in this public repository. |
| Before larger staff/team use | **Only last-editor metadata, no immutable change history.** `updatedBy` and `updatedAt` show the last update; notes, drafts and status history can be overwritten by the authorized admin. Concurrent edits to the same field can replace each other. | Add append-only workflow history and conflict handling if detailed auditability is needed. Restrict any history writes so customers and the worker cannot forge them. |
| Account protection | **Single administrator and a private long-lived worker login.** No evidence was collected about the owner's Google two-step verification or recovery settings. The worker password is in private Apps Script properties, not source; script/project collaborators must be trusted. | Protect the admin Google/GitHub accounts with two-step verification and recovery methods. Keep the script private; review collaborators and maintain a controlled worker rotation/revocation procedure. Do not broaden the worker's UID rule or copy credentials to ChatGPT. |
| Data quality | **Phone validation permits strings of punctuation/spaces** if they meet the character/length rule. This is not an access bypass, but a crafted request can contain an unusable number. | In a future reviewed rules/client change, require a sensible digit count/normalization and test Arabic/Persian numerals and international numbers. Do not assume the browser validator stops direct API calls. |
| At higher request volume | **The dashboard subscribes to the full application collection.** Reopening it on several devices reads many records; per-keystroke draft saves also consume writes. | Add server-side pagination/filters and debounce draft persistence as volume grows. Quota exhaustion can interrupt operations; billing remains disabled rather than auto-upgraded. |

## Operational boundaries

The admin URL itself is public, but customer reads are enforced at Firestore. Hiding HTML is not the privacy control. Customer details should stay in the protected dashboard; notification emails contain references/types/dates only. Google account owners with project-level privileges are outside the browser security-rule boundary.

The public can submit from any device without an account. They cannot retrieve or modify saved applications; the receipt shows the submitting page's details only after acknowledged storage. No automatic expiry is configured, but a page left offline is not a saved application until the server confirms it.

Rules allow the trusted admin to move between valid statuses/stages; a Signed selection is an internal record, not a legally executed agreement. Contract uploads, signature verification, automatic customer emails and payments are not implemented.

## Scope of this handoff

No existing Firebase/Supabase project was accessed or changed. No new Google database scope, billing account, paid function, Storage bucket upload or backup service was enabled. The rules were reviewed rather than loosened. The CSV correction does not change the visual design, photographs, database schema or permissions.

Reference documentation: [Firebase App Check](https://firebase.google.com/docs/app-check), [Firestore limits](https://firebase.google.com/docs/firestore/quotas), [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas). App Check reduces some abuse but does not guarantee its elimination. Existing Spark and mail limits still apply.
