# Tracking demo (GTM + GA4)

Test pages for tracking cases. Demo only: fake data, nothing is sent anywhere, not a client project.

- `index.html`: the correct build. Events: `page_view`, `generate_lead` (valid form submit), `click_phone`, `click_email`, `click_cta`, `file_download`.
- `broken.html`: the same page with 3 known bugs for the troubleshooting case (lead counted on button click, duplicate page_view from an extra GA4 event tag in GTM, phone click not tracked).
- `tracking-sheet-sample.pdf`: sample tracking sheet used as the download link.

Container: GTM-NNRFBVQT. GA4 property: Tracking Demo.
