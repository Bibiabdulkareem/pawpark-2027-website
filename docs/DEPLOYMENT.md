# Deployment and recovery — PawPark 2027

## Scope and permissions

Use only **pawpark-2027-web**. The project already exists. Do not run `projects:create`, migrate data, attach billing, initialize a different backend or change any other project. Stay on Spark. Stop before any paid action. Website code changes need GitHub permissions; deploying database rules/auth additionally needs separately authorized Firebase access. Neither requires handing credentials to another chat.

## Website changes (including design improvements)

1. Read the latest `main`, `HANDOFF.md`, `AGENTS.md` and security review. Create a branch from current `main`.
2. Edit `index.html` / `site-fixes.css` / `site-photos.css` for public pages or `admin.html` / `admin-communications.css` for dashboard behavior. Images are in `assets/`. Preserve photographs unless the owner explicitly requests a change.
3. Keep Arabic and English strings, RTL/LTR behavior and small-screen layouts working. Keep the existing Firebase config and collections. Never put a private credential or customer export in a website file.
4. Install test dependencies with `npm ci` and browser support with `npx playwright install chromium`. With Java 21+ available, run:

```sh
npx -y firebase-tools@latest emulators:exec --only firestore,auth --project demo-pawpark-2027 --config emulators.json 'npm run test:rules && npm run test:csv && npm test'
```

Tests use the demo project and emulators. Never point test clearing/deletion helpers at the live project.

5. Open a pull request and inspect the GitHub Actions result. Merge the reviewed changes to `main`. GitHub Pages publishes from `main` at the repository root; check **pages build and deployment** in Actions. The Mac need not remain on. [Publishing documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
6. Check the live public/admin pages. Verify language switching, photographs, forms and sign-in. Firebase configuration is already present: an HTML/CSS-only change needs no Firebase deployment or new Firebase login.

## Rules, indexes or authentication changes

First review the database schema and all callers. Edit the relevant config, run security tests in demo emulators, and inspect the proposed scope. If the execution environment is not signed in, use the official Firebase login flow with **bibi@pawapp.net**; do not copy an old token. This is authentication, not project recreation.

Deploy only the approved product(s), with an explicit project ID:

```sh
npx -y firebase-tools@latest deploy --only firestore --project pawpark-2027-web
# Only when an auth configuration change is intended:
npx -y firebase-tools@latest deploy --only auth --project pawpark-2027-web
```

Committing `firestore.rules` to GitHub does **not** deploy it to Firebase. The current GitHub workflow tests the code; it holds no Firebase production credentials and does not automatically deploy rules/auth. A cloud development environment with authorized Firebase access or the Firebase Console can manage these changes without the Mac. Do not turn on billing to bypass a permission or quota error.

## Notification source and live script are separate

The running script is linked in `HANDOFF.md`. Committing `notifications/Code.gs` does not update the live Apps Script editor. Review/apply an authorized code change there separately, preserve private Script Properties, and inspect Executions afterwards.

The current sender runs `pollPawParkApplications` every five minutes. It logs into **only PawPark's Firebase Authentication** with a generated worker account whose UID is pinned in the rules. It can read/acknowledge `notificationQueue` only. It cannot read `applications`. It sends reference-only digests to **info@pawapp.net**. Google permissions are external requests, send mail and background triggers: no Google database OAuth scope.

**Do not run initial worker setup again during routine development.** `preparePawParkWorker` is bootstrap/recovery code; `installPawParkNotifications` verifies access and installs a missing timer. Credential recovery/rotation needs a separate reviewed operation: create/rotate a PawPark-only worker, update its UID rule and tests as needed, preserve the timer, validate that the old worker has no queue access, and verify one notification. Never publish its email/password, ID tokens or script property values.

## Monitoring and recovery

- Missing submission: do not show success until the write is acknowledged. Check Firebase usage, connectivity and rules in the new project. A draft left on an offline phone is not a saved request.
- Missing mail: inspect the Apps Script execution history and `notificationQueue.sent`; check remaining mail quota and spam folders. A sent marker means MailApp accepted the send, not proof the recipient read it. Keep queued records; do not clear the queue to silence an error.
- Bad website release: revert the offending GitHub commit with a normal follow-up commit and allow Pages to republish. Avoid force-pushing history. This does not roll back Firebase rules or the Apps Script source.
- Data protection: there is no automatic paid backup/export configured. Download private CSV review copies periodically; they are not complete Firestore restore snapshots. Plan and approve a recovery strategy before heavy public use. Do not enable a paid backup/export service without approval.
- Never disable the notification worker/provider, delete its Script Properties, revoke the script authorization, remove its timer or delete the script during ordinary website edits.
