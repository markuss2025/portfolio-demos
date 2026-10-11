/**
 * Pure business logic for the Lead Intake Automation (no Google services used here),
 * so it can be tested outside Google Sheets. The same file is served as logic.js
 * for the live simulation on the demo page.
 */

var FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'mail.ru', 'yandex.ru'];

/** Basic email format check. Returns true / false. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

/** Budget points (max 40). Accepts a number or a numeric string. */
function budgetPoints(budget) {
  var b = Number(budget);
  if (isNaN(b) || b < 0) return 0;
  if (b >= 2000) return 40;
  if (b >= 500) return 30;
  if (b >= 100) return 15;
  return 0;
}

/** Company-size points (max 30). Expects one of: '1', '2-10', '11-50', '50+'. */
function sizePoints(size) {
  var map = { '1': 5, '2-10': 15, '11-50': 25, '50+': 30 };
  return map.hasOwnProperty(String(size)) ? map[String(size)] : 0;
}

/** Timeline points (max 30). Expects: 'asap', 'this month', 'exploring'. */
function timelinePoints(timeline) {
  var map = { 'asap': 30, 'this month': 20, 'exploring': 5 };
  var key = String(timeline || '').trim().toLowerCase();
  return map.hasOwnProperty(key) ? map[key] : 0;
}

/** True when the email looks like a business address (not a free provider). */
function isBusinessEmail(email) {
  if (!isValidEmail(email)) return false;
  var domain = String(email).trim().toLowerCase().split('@')[1];
  return FREE_EMAIL_DOMAINS.indexOf(domain) === -1;
}

/**
 * Score a lead from 0 to 100.
 * lead = { email, size, budget, timeline }
 */
function scoreLead(lead) {
  var score = budgetPoints(lead.budget) + sizePoints(lead.size) + timelinePoints(lead.timeline);
  if (isBusinessEmail(lead.email)) score += 10;
  return Math.min(score, 100);
}

/** Map a score to a status label. */
function tierFor(score) {
  if (score >= 70) return 'Hot';
  if (score >= 40) return 'Warm';
  return 'Cold';
}

/**
 * Validate a lead. Returns { ok: boolean, errors: string[] }.
 * Rows that fail validation are marked "Invalid" and never emailed.
 */
function validateLead(lead) {
  var errors = [];
  if (!String(lead.name || '').trim()) errors.push('Name is missing');
  if (!isValidEmail(lead.email)) errors.push('Email is invalid');
  var b = Number(lead.budget);
  if (isNaN(b) || b < 0) errors.push('Budget must be a positive number');
  return { ok: errors.length === 0, errors: errors };
}

/** Plain-text confirmation email for the lead. */
function buildConfirmationEmail(lead, tier) {
  var first = String(lead.name || '').trim().split(' ')[0] || 'there';
  var next = tier === 'Hot'
    ? 'A specialist will contact you within 24 hours.'
    : 'We will send you next steps shortly.';
  return {
    subject: 'We received your request',
    body: 'Hi ' + first + ',\n\nThanks for getting in touch. ' + next + '\n\nBest regards,\nThe Team'
  };
}

/** Summarise rows for the daily report. rows = [{status}] */
function summarize(rows) {
  var counts = { Hot: 0, Warm: 0, Cold: 0, Invalid: 0 };
  rows.forEach(function (r) {
    if (counts.hasOwnProperty(r.status)) counts[r.status]++;
  });
  counts.total = rows.length;
  return counts;
}
