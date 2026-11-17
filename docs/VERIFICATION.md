# Handoff verification record

Date: **17 November 2026 (Asia/Kuwait)**. Scope: PawPark 2027 only.

## Repository inventory

The pre-handoff production commit was `fced907e51fb3d9bd5dd5395c41aed9d91b6902d`. Its 33 tracked files were compared with the prepared website checkout: **no source mismatches**. All nine files in `assets/` (eight JPEG/logo photo assets plus the SVG logo asset) were in GitHub. There are eight public photo elements; the booking collage is used twice. No photograph or stylesheet was changed for this handoff.

Source groups confirmed in GitHub:

- Website: `index.html`, `admin.html`, the public/admin CSS files and `assets/`.
- Firebase integration: `backend-config.js`, `firebase-backend.js`.
- Firebase deployment config: `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`.
- Notification source: `notifications/Code.gs`, `notifications/appsscript.json`. The live script and its private properties/timer are hosted separately at Google.
- Reproducible checks: `package.json`, `package-lock.json`, `emulators.json`, `tests/`, `.github/workflows/qa.yml`.
- Existing design/QA notes. The legacy SQL file is unused; no Supabase backend is connected by the active website.

The handoff adds HANDOFF.md, AGENTS.md and this docs folder, and strengthens CSV export with an attack-vector regression check. Exact final contents are visible in the GitHub commit/PR history.

## Credentials

A pattern scan of the tracked production source found no private-key blocks, Google OAuth access/refresh tokens or GitHub personal-access-token patterns. This is a limited scan, not proof that every possible secret format has been detected. Known credentials were also checked by architecture: the worker password is generated into private Google Apps Script properties; the local Firebase CLI login is outside the repository. Neither is in the handoff or published source. Public Firebase client API config and project/app/worker IDs are non-secret identifiers.

Do not commit personal customer records, screenshots containing real customer information, private exports, local Firebase config stores or debug logs.

## Firebase and email

Read-only checks against only the new project confirmed:

- Project ID `pawpark-2027-web`; authenticated administrative account `bibi@pawapp.net`.
- Billing disabled; Firestore Standard `(default)` in `europe-west3`, free-tier eligible.
- Database deletion protection enabled; no automatic record expiry configured.
- The deployed rules match the reviewed repository rules.
- Live setup request `PP27-XphG5U8bw4SyK54IKpEI` is saved in Firestore. It contains fictional contact details and is clearly labeled as a setup test.
- Its reference-only notification entry has `sent: true` and a Google server `sentAt` timestamp of **2026-11-17 22:59:01 Kuwait time**. A scheduled Apps Script execution completed successfully. This proves the sender accepted/acknowledged the send, not inbox placement or that the email was read.
- The Apps Script timer and data plane are Google-hosted. The production website does not call a Mac-local service. Physically powering off the Mac was not part of the test; cloud independence follows from the verified hosting/runtime configuration.

## Browser / phone verification

- Live public page and protected admin dashboard loaded successfully.
- Authorized Google sign-in and the saved setup record were verified. Its status and internal note survived reloading.
- Both public/admin layouts fit a **390px** viewport with no horizontal overflow. Public Arabic RTL switching, both forms and eight photo elements were present. The viewport was restored after testing.
- **The owner confirmed successful sign-in and record visibility on their actual iPhone in Safari.** Other phone actions are supported by the responsive interface and automated tests; not every iOS/mail/download configuration was physically tested.
- Original mobile/desktop automated flows passed in GitHub Actions: submission acknowledgement, separate visitor/admin sessions, denial to another account, saved statuses/notes/agreement progress, pet registration updates, sign-out privacy and no false receipt while offline.

Evidence: [initial integration checks](https://github.com/Bibiabdulkareem/pawpark-2027-website/actions/runs/44162703337), [production-merge checks](https://github.com/Bibiabdulkareem/pawpark-2027-website/actions/runs/44163202370), [production Pages deployment](https://github.com/Bibiabdulkareem/pawpark-2027-website/actions/runs/44163200819). See Actions/PR checks for the new CSV-hardening/handoff commit.

## Open launch work

Read [SECURITY_REVIEW.md](SECURITY_REVIEW.md). Passing access-control tests does not resolve spam/quota exhaustion, recovery, full audit history or every operational risk. No other project was used to perform these checks.
