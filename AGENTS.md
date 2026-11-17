# PawPark 2027 development instructions

Read HANDOFF.md and docs/SECURITY_REVIEW.md before work. This repository is the source of truth. Check the latest remote main; do not assume a conversation's local checkout is current.

- Firebase project: **pawpark-2027-web** only; display name PawPark 2027; Spark, billing disabled; Firestore Standard `(default)` in europe-west3.
- Never create another project, attach billing, enable paid services, or access/modify PawApp Concierge, pawapp-pet-information, or any other Firebase/Supabase project. Ask before a paid operation.
- Preserve the current design and original photos unless the user explicitly authorizes design changes. Keep English/Arabic and RTL/LTR behavior.
- Public requests are an atomic batch creating `applications/{id}` and `notificationQueue/{id}`. Only a verified Google sign-in for bibi@pawapp.net can read customer records or update workflow fields. Preserve immutable original submissions and deny browser deletions.
- The dedicated notification worker can read/acknowledge only the reference-only queue. It must never get customer-record or other-project access. Do not log or export its private credentials.
- No passwords, CLI tokens, refresh tokens, service-account keys, customer exports or private Script Properties belong in commits, screenshots or handoffs. Public Firebase web config and IDs are intentionally public identifiers.
- Use a branch for implementation changes. Run relevant checks. Existing test suite: `npm ci`; `npx playwright install chromium`; then `npx -y firebase-tools@latest emulators:exec --only firestore,auth --project demo-pawpark-2027 --config emulators.json 'npm run test:rules && npm run test:csv && npm test'` (Java 21+).
- Test clearing/deletion must target demo emulators only. Do not create real customer records for QA. Preserve the clearly labeled existing setup record.
- Main is published by GitHub Pages. Rules/auth deployments and live Apps Script updates are separate: see docs/DEPLOYMENT.md. Use `--project pawpark-2027-web` explicitly for every production Firebase command. Do not reuse an arbitrary active project.
- Tool availability and authentication do not transfer automatically between chats/devices. Inspect the actual environment. Reauthenticate normally if needed; never ask for copied secrets. Never claim a deployment occurred merely because source was committed.
