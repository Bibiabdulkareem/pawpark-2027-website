# PawPark 2027

**Start here:** [iPhone and new-conversation handoff](HANDOFF.md) · [Deployment](docs/DEPLOYMENT.md) · [Security review](docs/SECURITY_REVIEW.md) · [Verification](docs/VERIFICATION.md)

Arabic/English website connected exclusively to the independent Firebase project **pawpark-2027-web**, display name **PawPark 2027**. Billing is disabled (Spark). No existing Firebase or Supabase project is used.

- Website: https://bibiabdulkareem.github.io/pawpark-2027-website/
- Protected admin dashboard: https://bibiabdulkareem.github.io/pawpark-2027-website/admin.html
- Firebase: https://console.firebase.google.com/project/pawpark-2027-web/overview

## Applications and access

Space bookings and pet-show registrations write to Cloud Firestore Standard `(default)` in **Frankfurt, europe-west3**. Confirmation and reference appear after Firestore acknowledges the write. Customer records are not stored in browser localStorage. A request is not a confirmed booking and no payment is collected.

Only the verified Google account **bibi@pawapp.net**, signed in through Google, can read records and change statuses, internal notes, agreement progress and reply drafts. This is enforced in deployed Firestore rules as well as the interface. Other users cannot read, update or delete applications. The public may create schema-validated requests. No client, including the admin dashboard, may delete applications. Database deletion protection is enabled.

Admin sessions last for the browser session. Sign out on shared devices. Email/WhatsApp reply buttons open drafts; they do not automatically send messages. Agreement stages track progress; they do not sign legal agreements or upload contracts.

## Free organizer email notifications

Script: https://script.google.com/home/projects/1KV0EQ7H9PTRHXwNrSAjER_zQ-03G1JXi3Lgb9LzlB6JQY7oe93onlbq6/edit

`notifications/Code.gs` and `notifications/appsscript.json` provide a Google Apps Script worker owned by bibi@pawapp.net. The installed and authorized timer polls every five minutes and sends grouped new-application references to **info@pawapp.net**. Customer contact details stay in the protected dashboard. The sender uses a dedicated Firebase Authentication worker with access only to a reference-only notification queue in this project. Its generated password stays in private Apps Script properties. It cannot read customer applications or access any other Firebase project. No Google database OAuth scope, service-account key, Firebase Functions or paid extension is used.

The installation and a scheduled reference-notification send were verified on 17 November 2026. The worker checks daily mail quota and keeps unsent applications queued when exhausted. Apps Script has free per-user quotas; delivery may be delayed. See https://developers.google.com/apps-script/guides/services/quotas. A rare crash between sending an email and saving its acknowledgement may cause a duplicate notification.

Initial bootstrap only — do not repeat for routine development: create a standalone Apps Script project under **bibi@pawapp.net**, paste `Code.gs`, enable the manifest in Project Settings and paste `appsscript.json`, then run `preparePawParkWorker`. Pin the returned worker UID in the notification-only rule (never grant customer record access), deploy and test the rules, then run `installPawParkNotifications`. Approve only external-request, send-mail and trigger permissions. It queries only the reference-only queue in `pawpark-2027-web`, installs the timer and sends a connection email. Do not add billing.

## Spark limits and operations

Spark has hard usage limits. Exhausting a quota may temporarily block new submissions or admin reads; it does not authorize a billing upgrade. Existing records are not automatically deleted. Monitor the new project's usage. Public create access is validated and size-limited but does not provide full bot prevention; App Check/anti-abuse protections should be reviewed before a broad campaign. No paid backups, TTL deletion, Storage uploads, Cloud Functions or paid services are configured.

The initial rules are a tested prototype and should be reviewed before broad launch. To add an administrator, update the allowlist in **both** `firestore.rules` and `firebase-backend.js`, test, then explicitly deploy the rules to this project. Never use credentials or IDs from another PawApp project.

The original CSS and all photographs are preserved. Historical SQL in `backend/` is unused; the active backend is Firebase only. Existing browser demo records are not imported.

## Development and verification

Install dependencies with `npm ci`, then install the browser with `npx playwright install chromium`. The emulator suite needs Java 21 or later.

Run `npx -y firebase-tools@latest emulators:exec --only firestore,auth --project demo-pawpark-2027 --config emulators.json 'npm run test:rules && npm run test:csv && npm test'`.

Tests use a demo project and emulators, not real customer data. They cover public creation, unauthorized access denial, admin workflow, invalid payloads, immutable fields, bilingual mobile/desktop layouts, cross-device synchronization, sign-out privacy, and offline confirmation behavior.

Deploy only with an explicit target: `npx -y firebase-tools@latest deploy --only firestore,auth --project pawpark-2027-web`. The existing GitHub Pages website hosts the static files. Never attach a Cloud Billing account or upgrade to Blaze without approval.
