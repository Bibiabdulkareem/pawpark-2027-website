# PawPark 2027 — Website implementation brief

Status: repository initialized; **public launch and accepting applications are not enabled yet**.

## Design reference and non-negotiables
- Canva source: https://canva.link/z3mgnhx1ocxpj92 (approved visual reference).
- Recreate Canva's responsive desktop and mobile compositions, image ratios, color placement, typography and section order. No redesign.
- Keep **PawApp logo only** in the website navigation (do not display a separate PawPark logo).
- Final palette from Canva: primary blue `#003E8E`, cream `#F6F6E9`, light beige `#EDDEAE`, with approved yellow accents. No pink background.
- Main visible Explore Our Zones cards: **Kids Zone, Pets Zone, Food & Beverage Zone** (three cards exactly).
- Keep selection of trucks as a business/zone form option only if retained by the Canva booking form; do not add a fourth visual zone card.
- Responsive mobile must keep full, legible hero dog image and proper side-by-side/stacked booking composition as in Canva. Never crop photos without matching Canva's framing.
- Venue: Al-Sadaqa Wal-Salam Park (Friendship & Peace Park), Shuwaikh, Kuwait.
- Event: January 21–23, 2027, 12 PM–11 PM. Canva's old 20–25 Jan copy is superseded by approved event dates.
- PawPark in collaboration with PawApp only; do not name an animal hospital as an organizer/partner.

## Visitor experience
- English and fully translated Arabic with RTL; changing language must translate all labels, validation, select options, result messages and navigation while preserving input values.
- Keep short copy, high contrast and clear primary CTA **BOOK YOUR SPACE / احجز مساحتك**.
- Space request: business name, contact person, phone, email, space (3×3, 3×4, custom), preferred zone, custom-size details where applicable. Submissions are *requests*, not confirmations.
- Pet-show registration flow from Canva; no immediate booking confirmation or payment.
- Upon successful submission, create a reference number and send/store the request in a secured backend with organizer notification.
- Admin-only review area for received requests; do not expose personal data on public GitHub Pages.

## Required original visual assets (awaiting user export from Canva)
1. Hero Pomeranian photo.
2. Kids Zone photo.
3. Pets Zone photo.
4. Food & Beverage Zone photo.
5. Two landscape booking-section photos.
6. Pet Show poodle photo with beige background.
7. Contact section brown dog photo.
8. PawApp logo source (available from previous project, verify resolution).

Previous screenshots are visual references only and must **not** be used as permanent photo assets.

## Deployment and security
- GitHub Pages can host the public static frontend; it cannot itself securely store applications or send notifications.
- Use a separate hosted backend/database with validated submissions, rate limiting, consent/privacy notice, and server-side email service for actual delivery.
- Do not publish a fake 'request received' screen unless persistence and notification have actually succeeded.
- Obtain and test secure backend configuration before making the site public.
