# Tracking plan: Quiz Funnel (GA4 + Consent Mode)

Demo project. GA4 measurement ID: `G-8S4NKPHJN6` (property "Portfolio Demos", stream "GitHub Pages Demos").

## Principles
- **Consent first.** Consent Mode v2 starts with `analytics_storage = denied` (and all ad storage denied). The visitor can accept or decline in a small banner. The choice is saved in `localStorage`.
- **No personal data.** Name, email and phone are never sent to Google. Events contain only step numbers, question keys and answer categories.
- **Test-safe.** Add `?demo` to the URL (used for screenshots) and tracking is switched off completely.
- **GTM-ready.** Every event is also pushed to `dataLayer` as `{event: "...", ...}` so Google Tag Manager can use the same data.

## Events
| Internal event | GA4 event | When | Parameters |
|---|---|---|---|
| QuizStart | `quiz_start` | Visitor clicks "Start the quiz" | none |
| StepView | `quiz_step` | A question or the contact form is shown | `step` (1-6) |
| QuizAnswer | `quiz_answer` | An answer is selected | `question`, `answer` |
| Lead | `generate_lead` | Form submitted and valid (GA4 recommended event) | `value` 25, `currency` USD, `qualified` true/false |
| LeadFormError | `form_error` | Form submitted with errors | none |
| QuizRestart | `quiz_restart` | "Restart demo" clicked | none |

## Suggested GA4 setup (done in the Admin area)
1. Mark `generate_lead` as a **key event** (conversion).
2. Create a funnel exploration: `quiz_start` -> `quiz_step` (step 1..6) -> `generate_lead`.
3. Register `step`, `question`, `qualified` as custom dimensions if you want them in reports.
4. Link Google Ads only when real campaigns exist.

## How to verify
1. Open the live demo, accept analytics, click through the quiz.
2. GA4 > Reports > Realtime: events appear within a minute.
3. GA4 > Admin > DebugView (needs debug mode or the GA debugger extension) for parameter-level checks.
4. Browser DevTools > Network: requests to `google-analytics.com/g/collect` only after Accept.
