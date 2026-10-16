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

## Case 3: Google Ads conversion tag through GTM (2026-10-15)
Setup: Google Ads account 219-390-1909 (no campaigns started, no payment details entered). Conversion action "Demo lead" (category: submit lead form, source: manual tag, default value 1 USD as a placeholder). In GTM: Conversion Linker (All Pages), Google tag for the Ads ID (Initialization), Google Ads conversion tag on Custom Event `form_success`.

| Test | Expected | First run | After fix |
|---|---|---|---|
| Empty form, click Send | Ads conversion tag does not fire | not fired | not fired |
| Valid form, click Send | Ads conversion tag fires once | fired 1 time, but Tag Assistant warned "hits deferred" (no Google tag for the AW-ID in the container) | fired 1 time, conversion hit sent, no warning |

Issue found and fixed: the conversion tag alone does not send its request until a Google tag with the same AW- ID exists in the container. Fix: added a Google tag with the AW- ID (Initialization - All Pages).
Side effect to note: the Google tag for Ads also sends page-view and remarketing hits to Google Ads.

Honest limit: Google Ads counts a conversion only for visitors who clicked an ad (they carry a gclid). No ad was run, so the Google Ads interface shows no conversions. This test verifies that the tag fires at the right moment and sends the request, not real ad conversions.
Evidence: evidence/google-ads/ (screenshots 10-13). Container with the Ads tags: gtm/container-final-with-ads.json (published as GTM version 3).


## Evidence note
Screenshots were re-captured in English (no account avatar or name) with the same tests on 2026-10-15 (about 13:38-14:10 page clock): folder `evidence-en/` (before-fix B1-B3, after-fix A1-A3, google-ads C1-C4, page 00). Counts match the first run: generate_lead 4 times for 3 empty and 1 valid submit, click_phone 0, 2 page views per load before the fix; 1 and 1 after. The first Russian-interface captures are archived and not used.


## Case 4: Meta Pixel through GTM, browser-side only (2026-10-15)
Setup: dataset (pixel) "Tracking Demo", ID 2131649120892137, created in Meta Events Manager (Business portfolio, no ad spend, no payment). In GTM: two Custom HTML tags: base code + PageView (All Pages) and Lead (Custom Event form_success). Published as GTM version 4 (10 tags).

| Test | Expected | Actual |
|---|---|---|
| Page load | 1 PageView | 1 (Tag Assistant; request facebook.com/tr ev=PageView, HTTP 200) |
| Empty form, click Send | 0 Lead | 0 (no ev=Lead request) |
| Valid form, click Send | 1 Lead | 1 (Tag Assistant; request ev=Lead, HTTP 200) |

Limits: browser-side only, no Conversions API, no purchase events, no deduplication. Events in the Events Manager overview were not confirmed yet at the time of writing (Meta says up to 30 minutes). Evidence: evidence-en/meta-pixel/. Container: gtm/container-final-with-meta.json.

Update 2026-10-16: Meta Events Manager overview for dataset "Tracking Demo" shows PageView (Active, 2 total) and Lead (Active, 2 total), integration Meta Pixel, website markuss2025.github.io. The totals include one Tag Assistant preview run and one live run (1 PageView and 1 Lead each). Screenshot: evidence-en/meta-pixel/2026-10-16_M2_events-manager-overview-pageview-lead-active-cropped.jpg

Update 2026-10-16 (GA4): events from the demo page now appear in the GA4 Events list (click_cta, click_email, click_phone, file_download, generate_lead, page_view, scroll, ...). `generate_lead` and `click_phone` were marked as key events. Screenshot: evidence-en/ga4/2026-10-16_G1_ga4-key-events-generate_lead-click_phone-cropped.jpg. Still no standard reports or conversion numbers are claimed: test data only.
