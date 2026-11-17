# PawPark 2027 — Verification and notification status

## Scope

The Firebase integration exclusively uses the newly created **pawpark-2027-web** Spark project. Firestore Standard is in Frankfurt (europe-west3), with deletion protection enabled. Billing is disabled. No existing Firebase or Supabase project was inspected or changed. All existing photograph and CSS files are unchanged.

## Required verification

The automated rules suite verifies valid space/pet requests; denial of customer reads to visitors, other Google accounts, unverified accounts and wrong providers; permitted admin review and agreement changes; forbidden deletion; immutable original details/timestamps; bounds, field types, missing required fields and role-escalation attempts.

The browser suite uses separate visitor and admin sessions at mobile and desktop widths. It verifies Arabic/English direction, original image loading, no horizontal overflow, database-confirmed receipts, no customer localStorage, cross-device application visibility, unauthorized admin denial, status/notes/agreement persistence, pet registration updates, sign-out privacy and no false success while offline.

Tests use **demo-pawpark-2027** emulators. Production rules are compiled during deployment. Before broad public launch, the prototype rules and spam controls should be reviewed. Real Google login on the published GitHub Pages domain and a live test application should also be verified.

## Organizer email

Recipient: **info@pawapp.net**. Free Google Apps Script source and explicit permissions are in `notifications/`. The created script is named **PawPark 2027 — Free Application Notifications**, owned by **bibi@pawapp.net**.

The dedicated Firebase worker is prepared and its UID is restricted in the rules to the reference-only queue. The Google consent uses external-request, send-mail and background-trigger permissions only; no Google database scope. A successful installation run is required before automatic email is active. Once installed, a five-minute trigger sends grouped application references and the protected dashboard URL, while customer contact information stays in Firestore. Unsent notifications remain queued on quota exhaustion. No paid Firebase email extension or Cloud Functions deployment is configured.

Admin reply buttons remain manually sent email/WhatsApp drafts, with bilingual editable templates. Recording contact or agreement progress does not prove message delivery or execute a contract.

## Handoff review (17 November 2026)

See [HANDOFF.md](HANDOFF.md), [verification](docs/VERIFICATION.md) and [security review](docs/SECURITY_REVIEW.md). The owner confirmed real iPhone Safari sign-in/record visibility. The Apps Script timer is installed and scheduled sends have completed; its reference-only queue acknowledgement was verified. The handoff also strengthens CSV formula-prefix handling with an attack-vector regression test. Remaining launch risks are explicitly recorded; they are not waived by the passing tests.
