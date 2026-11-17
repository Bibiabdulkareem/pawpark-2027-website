# PawPark 2027 — QA and Notifications Plan (Draft)

Last reviewed: 2026-11-17

## Actual browser QA of existing HTML prototype
Test file: `PawPark2027_Canva_Accurate_Photos_Bilingual_Booking.html` (previously supplied; *not yet hosted in this repository*).

Tested in headless Chromium with viewport sizes:
- iPhone-style: 390 × 844
- Desktop: 1440 × 900 (plus custom/pet registration at 1366 × 768)

Passing in this browser environment:
- EN → AR changes html lang/dir to ar/rtl and visible heading/labels.
- User-entered form data remains present when toggling language.
- 3 visual zone cards displayed.
- Space size selection and custom-size conditional field.
- Choosing a zone and submitting a sample space request produces a visible summary.
- Pet Show registration produces a visible summary.
- No JavaScript page errors in the automated runs.
- No document horizontal overflow at tested mobile/desktop widths.

NOT tested/verified yet:
- iOS Safari running in a real iPhone.
- Pixel-for-pixel matching with the current Canva mobile and desktop screens.
- Image quality/crop accuracy: original licensed exports still required.
- Actual server-side save/automatic email notification: **NOT IMPLEMENTED in prototype**.
- Real authenticated admin dashboard: **NOT IMPLEMENTED**.

CRITICAL: Current prototype generates mailto/WhatsApp links. A visitor must complete a separate email/WhatsApp action to transmit, so it MUST NOT be called an actual online booking system yet.

## Proposed applicant flow (pending user approval)
Visitor fills bilingual space or pet-show form → server validates request → secure database saves → reference number created → email notification sent to organizer → visitor gets 'request received / pending review' screen only after confirmed save.

No payment or auto-confirmation.

## Proposed organizer-only flow
- Separate private route `/admin`, authenticated admin accounts and enforced server-side permissions (not hidden HTML only).
- Admin dashboard with New/Pending/Under Review/Approved/Rejected/Waitlisted statuses; search by name/mobile; filter by zone and space size; assigned final spot; approved prices and internal notes.
- Unread/new count visible *inside the dashboard* to signed-in staff.
- Automatic email notification for each valid new request, with request reference and summary; emails remain useful if admin is offline.
- No need to use the busy PawApp WhatsApp Business phone. Optional browser push notifications may be added later if explicitly enabled.
- Consider a separately provisioned Supabase project/backend so the PawPark application database is isolated from PawApp Concierge CRM. No client-side service-role credentials; strong RLS/permissions, privacy safeguards and server-side anti-spam.

## Confirmed organizer notification email (2026-11-17)
- **Official recipient: `info@pawapp.net`** — explicitly confirmed by the organizer.
- `info@bauapp.net` was a typo and must never be used.
- Configure this email as notification recipient once the secure backend and email service are ready, and verify successful delivery before launch.

## Design baseline
Use exact latest Canva source (not screenshot crops) and original high-resolution photographs supplied by user.
Original image exports remain pending. Do not substitute low-resolution screenshot crops as approved final assets.
