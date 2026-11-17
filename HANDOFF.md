# PawPark 2027 — iPhone handoff

Verified on **17 November 2026 (Kuwait time)**. Start here in a new conversation. This document contains no passwords, tokens or private keys.

## Exact project links

| Item | Link or value |
| --- | --- |
| Repository / source of truth | https://github.com/Bibiabdulkareem/pawpark-2027-website |
| Public website | https://bibiabdulkareem.github.io/pawpark-2027-website/ |
| Protected admin dashboard | https://bibiabdulkareem.github.io/pawpark-2027-website/admin.html |
| Firebase Project ID | **pawpark-2027-web** |
| Firebase display name | **PawPark 2027** |
| Firebase Console | https://console.firebase.google.com/project/pawpark-2027-web/overview |
| Firestore | https://console.firebase.google.com/project/pawpark-2027-web/firestore |
| Authorized administrator | **bibi@pawapp.net**, verified Google sign-in |
| Database | Standard edition, `(default)`, Frankfurt **europe-west3** |
| Plan | **Spark; billing disabled** |
| Notification recipient | **info@pawapp.net** |
| Private notification script | https://script.google.com/home/projects/1KV0EQ7H9PTRHXwNrSAjER_zQ-03G1JXi3Lgb9LzlB6JQY7oe93onlbq6/edit |
| Script execution history | https://script.google.com/home/projects/1KV0EQ7H9PTRHXwNrSAjER_zQ-03G1JXi3Lgb9LzlB6JQY7oe93onlbq6/executions |
| Deployment/checks | https://github.com/Bibiabdulkareem/pawpark-2027-website/actions |
| Deployment guide | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Security review / launch work | [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) |

## What works with the Mac switched off

The public files and photographs are served by **GitHub Pages**. Requests are saved by **Google Cloud Firestore**, and Google handles admin sign-in. Email is sent by a **Google Apps Script time-driven trigger**, approximately every five minutes. None of these production services runs on the Mac, requires this chat to stay open, or uses the Mac's Firebase CLI login. Keep the cloud accounts, script authorization, trigger and worker enabled.

Services remain subject to provider availability and free quotas. Requests are not automatically confirmed as bookings. Records have no configured expiry. Database deletion protection is enabled, and browser clients cannot delete records. Privileged project owners still have administrative powers; deletion protection is not a backup.

## Daily management from iPhone

1. Open the admin URL **directly in Safari**, rather than inside an embedded ChatGPT browser. Sign in with **bibi@pawapp.net**. Allow the Google sign-in popup if Safari asks. You can add the admin page to your Home Screen using Safari's Share menu.
2. Review space requests and pet-show registrations, search names/phones, and filter by application type, status or agreement stage.
3. Read customer contact details. Change status, add internal notes, and track agreements as **Not started → Preparing → Sent → Signed**. Wait for **All changes saved** before closing the page. With weak connectivity, leave the page open until saving finishes.
4. Use the phone/email/WhatsApp links for contact. Email and WhatsApp buttons create editable drafts; you must send them in the selected app. A status change does not automatically contact the customer. Record contact only after it occurred.
5. Export CSV if needed. On iPhone, use the browser download/share controls to save it to Files. It contains personal information: keep it private and avoid shared/public folders. A CSV is a review copy, not a complete database backup.
6. Switch between Arabic and English. Sign out when finished on a shared device. Sessions are limited to the browser session; another device must sign in separately.

Original customer submissions are intentionally immutable in this dashboard. Record corrections in internal notes; changing original fields requires a separately reviewed feature. Agreement tracking records progress only: contract file uploads, electronic signatures and payment collection are **not implemented**.

**Real-device check:** the owner confirmed successful Safari sign-in and visibility of the saved setup request on their actual iPhone on 17 November 2026. Browser checks also passed at 390px width without horizontal overflow. This is not a test of every iOS version, every mail app or every iPhone action.

A fictional record named **PAWPARK SETUP TEST — ignore** remains, marked Rejected with explanatory notes. It is not a real application.

## Continue with ChatGPT from iPhone

The conversation and the project's infrastructure are separate from tool credentials. The Firebase plugin used for setup launches a **local Firebase CLI/MCP process on the Mac**. Its local Google login is not automatically transferred to a different computer or to a normal ChatGPT iPhone conversation. Sharing a repository or continuing the chat does not grant database-administration access.

OpenAI documents that saving a plugin containing local apps does not make those tools available on web/mobile. Connected-app availability varies by interface and account. Check the actual tools available in the destination chat; do not assume a Firebase connection exists because the plugin name is visible. [OpenAI plugin documentation](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt), [connected-app availability](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt).

**Simplest workflow:** use Safari's admin dashboard for daily operations. Keep using ChatGPT for planning, wording, design feedback and change requests. For code execution while the Mac is off, use **Codex/Work Cloud with this GitHub repository**, if your account offers it. On mobile, open Codex and select a cloud environment with repository access. A cloud task has its own workspace and can run while a local computer sleeps. This may require GitHub authorization or selecting an environment once; it does **not** require recreating Firebase. Availability and plan limits depend on the account. [Official cloud guide](https://learn.chatgpt.com/docs/cloud).

If cloud coding is unavailable, ask ChatGPT for a precise patch and apply it with the [GitHub browser file editor](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files). Use a branch and pull request, then review checks before merging. A GitHub connection with write tools can also publish authorized changes when available. A normal chat without those tools can explain changes but cannot silently publish them.

Remote control of **this Mac** is different from cloud execution: if the host is asleep/offline, its local development/Firebase tools cannot do new work. This does not stop the live website. Future Firebase rules/auth changes need an authorized Firebase-capable environment or Firebase Console access; the current local token must never be pasted into a chat, GitHub or a handoff.

## Copy this into another conversation

> Continue PawPark 2027 from https://github.com/Bibiabdulkareem/pawpark-2027-website. Read HANDOFF.md, AGENTS.md, docs/DEPLOYMENT.md and docs/SECURITY_REVIEW.md from the latest main branch first. Reuse the existing Firebase project pawpark-2027-web on Spark; never create another project or attach billing. Do not access or modify PawApp Concierge, pawapp-pet-information or any other project. Keep Arabic/English support and the existing design/photos unless I explicitly request changes. Make the requested website improvement on a branch, run the relevant checks and report the reviewable result. Check your actual GitHub/Firebase tools before claiming you can deploy. Never request or publish passwords, tokens, service-account keys or Apps Script worker credentials. My requested improvement is: [describe the change].

## What is saved where

All website source, nine image/logo assets, public Firebase config, rules, indexes, auth config, tests and notification **source/manifest** are committed on `main`. [Repository inventory](docs/VERIFICATION.md).

Actual bookings live in Firestore, not GitHub. The running notification script, its timer and its generated worker credential live privately at Google, not GitHub. Firebase CLI credentials remain private to the authenticated development environment. Public Firebase web API configuration identifies the app; it is not an administrator secret and does not bypass rules.

Do not repeat Firebase setup for design changes. Edit the relevant HTML/CSS/images, preserve `backend-config.js` and database contracts, test and publish the website. Read the security review before a broad public campaign.
