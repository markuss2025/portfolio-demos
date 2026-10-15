# Test results: expected vs actual (2026-10-15)

Setup: own demo page and own demo GTM container (GTM-NNRFBVQT) and GA4 property "Tracking Demo". Test data only. Chrome on Windows 11. Tools: GTM Preview (Tag Assistant) and GA4 DebugView. Tests were run by hand, one action at a time, between 12:35 and 13:05 (page clock).

## Case 1 and 2: events on the page

| # | Test | Action | Expected | Before fix (page broken.html, container with bugs) | After fix (page index.html, fixed container) | Evidence |
|---|---|---|---|---|---|---|
| 1 | Page load | open page once | 1 page_view | 2 page_view in the same second (extra GA4 page_view tag in GTM) | 1 page_view | before-fix/07, 08, 09; after-fix/05, 06 |
| 2 | Empty form | click Send, fields empty | 0 generate_lead | 1 generate_lead per click (3 empty clicks = 3 leads) | 0 generate_lead | before-fix/01-03; after-fix/05, 06 |
| 3 | Valid form | fill fields, click Send, success message | 1 generate_lead | 1 | 1 | same |
| 4 | Phone link | click phone link | 1 click_phone | 0 (tag did not fire) | 1 | before-fix/01, 02; after-fix/05, 06 |
| 5 | Email link | click mailto link | 1 click_email | 1 | 1 | same |
| 6 | CTA button | click "Book a free check" | 1 click_cta | 1 | 1 | same |
| 7 | PDF link | click PDF link | 1 file_download | 1 (GA4 enhanced measurement) | 1 | same |

Bug 1 root cause: the `generate_lead` trigger was a Click on the Send button, not the `form_success` custom event.
Bug 2 root cause: an extra GA4 event tag named `page_view` fired on All Pages, in addition to the page_view sent by the Google tag.
Bug 3 root cause: the `click_phone` trigger was a link click with Click Text contains "Call"; the phone link is an icon without that text.

Fixes: (1) trigger changed to Custom Event `form_success`; (2) extra page_view tag removed; (3) trigger changed to Click URL starts with `tel:`.

## Intermediate run (fixed container, page still broken.html)
Fixed container on the old page: empty Send = 0 leads, valid Send = 1, phone = 1, email = 1, CTA = 1 (before-fix and intermediate screenshots: container-fixed-page-still-broken/04). The old page still had the icon-only phone link, so the `tel:` trigger works for both link styles.

## Observation (not a bug we could reproduce)
A hard-coded gtag.js with the same Measurement ID next to the GTM Google tag did NOT create a second page_view in this test (1 page_view per load in DebugView). That is why bug 2 was rebuilt as an extra GA4 event tag. Other duplicate causes (two different IDs, a plugin plus GTM) were not tested.

## Not verified yet
- Standard GA4 reports (events from DebugView appear in the Events list after up to 24 hours).
- Key events: `generate_lead` and `click_phone` are to be marked after they appear in the Events list.
- Other browsers, mobile, consent banner.
