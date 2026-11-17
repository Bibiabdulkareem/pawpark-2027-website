# PawPark 2027 — Website Preview

A bilingual English/Arabic responsive recreation of the approved PawPark Canva design direction.

**Design reference:** https://canva.link/z3mgnhx1ocxpj92

## Preview status

The following files have been committed:
- [index.html](index.html) — public visitor layout, responsive zones, demo space request and pet show registration, English/Arabic switching.
- [admin.html](admin.html) — **demo-only** request viewer with search and CSV download. **Not secured** and not suitable for personal data.
- [assets/pawapp-logo.svg](assets/pawapp-logo.svg) — PawApp logo.
- [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) — GitHub Pages deployment workflow.
- [DESIGN_SPEC.md](DESIGN_SPEC.md) — approved spec for full production implementation.
- [QA_AND_NOTIFICATION_PLAN.md](QA_AND_NOTIFICATION_PLAN.md) — testing and notifications plan.

## Preview the website

Configure **Settings → Pages → Build and deployment → Source = GitHub Actions** if not already enabled, then check the **Actions** tab for successful deployment. After deployment, public URL should be:

https://bibiabdulkareem.github.io/pawpark-2027-website/

Admin simulation (same browser only):

https://bibiabdulkareem.github.io/pawpark-2027-website/admin.html

The admin simulation is *not* the production admin dashboard; anyone can visit that static URL, but data is stored only on their own device and not shared across devices.

## Critical demo limits

- The site's photos are placeholders. The user's **original** high-resolution Canva photo assets are still required, and should replace these placeholders while preserving the exact compositions.
- Demo requests are saved in browser localStorage **on the same device only**; they are not sent to PawApp, email, or a database. Do not enter actual customer personal data during this preview.
- The protected, cross-device admin dashboard, real request storage and notifications to **info@pawapp.net** will require a separate secure backend with authenticated admin access.
- Space and pet-show requests are *requests for review*, not confirmed bookings. No payment is collected.
- The 3 visible zone cards are Kids, Pets and Food & Beverage, matching Canva. Trucks remains only as an option in the form as requested earlier.
- Date used: **21–23 January 2027** per latest approved event brief; older Canva design text has a different date.

This project will be updated with approved photos, finalized layout QA, secure form backend, and real email notifications before public launch.
