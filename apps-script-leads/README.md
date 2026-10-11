# Google Sheets Lead Automation (Google Apps Script)

Validates, scores and routes new leads in a Google Sheet. Concept project with a live simulation page (`index.html`).

## What it does
- Reads new rows in the `Leads` sheet (typed by hand or filled by a Google Form)
- Validates each lead (name, email format, budget); invalid rows are flagged and never emailed
- Scores each lead 0-100 and labels it **Hot / Warm / Cold**, colouring the row
- Emails the lead a confirmation, and alerts the owner on **Hot** leads
- Sends a **daily summary** email
- Safe to run repeatedly: rows that already have a Status are skipped (no duplicate emails)
- Uses a script lock to avoid two runs at once; email errors are logged on the row and not retried in a loop

## Sheet layout (row 1 = headers)
`A Timestamp | B Name | C Email | D Company size | E Budget | F Timeline | G Message | H Score | I Status | J Notified`

Company size values: `1`, `2-10`, `11-50`, `50+`. Timeline values: `asap`, `this month`, `exploring`.

## Setup (about 5 minutes)
1. Create a Google Sheet and name the first tab **Leads**. Add the headers above
2. Open **Extensions > Apps Script**. Paste `Code.gs` and `Logic.gs` as two files
3. Save, then reload the sheet. A **Lead Automation** menu appears
4. Run **Lead Automation > Install triggers** (approve permissions once)
5. Optional: link a Google Form to the sheet so submissions arrive automatically

## Files
- `Code.gs` Google services: sheet, email, triggers, menu
- `Logic.gs` pure logic (scoring, validation, email text, summary). Tested outside Google
- `logic.js` copy of `Logic.gs` used by the simulation page
- `test_logic.js` unit tests: `node test_logic.js` (26 checks)
- `index.html` interactive simulation

## Customise
Change point values and thresholds in `Logic.gs`. Change colours and column positions at the top of `Code.gs`.

## Honest notes
- `Logic.gs` is unit-tested. `Code.gs` was not run against a real Google account in this concept project, so test it on a copy of your sheet first
- Gmail/MailApp has daily sending limits (see Google's current quotas)
