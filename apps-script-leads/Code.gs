/**
 * Lead Intake Automation for Google Sheets (Google Apps Script)
 *
 * What it does
 *  - Reads new rows in the "Leads" sheet (filled manually or by a Google Form)
 *  - Validates each lead, scores it 0-100, labels it Hot / Warm / Cold
 *  - Colours the row, emails the lead a confirmation and alerts the owner on Hot leads
 *  - Sends a daily summary email
 *
 * Sheet layout (row 1 = headers):
 *  A Timestamp | B Name | C Email | D Company size | E Budget | F Timeline | G Message
 *  H Score | I Status | J Notified
 *
 * Setup: see README.md. Business logic lives in Logic.gs.
 */

var SHEET_NAME = 'Leads';
var COL = { TIMESTAMP: 1, NAME: 2, EMAIL: 3, SIZE: 4, BUDGET: 5, TIMELINE: 6, MESSAGE: 7, SCORE: 8, STATUS: 9, NOTIFIED: 10 };
var COLORS = { Hot: '#fde8e6', Warm: '#fff3da', Cold: '#e8eef7', Invalid: '#eeeeee' };

/** Adds a custom menu when the spreadsheet opens. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Lead Automation')
    .addItem('Process new leads', 'processNewRows')
    .addItem('Send daily summary now', 'sendDailySummary')
    .addSeparator()
    .addItem('Install triggers', 'installTriggers')
    .addToUi();
}

/** Owner email = the person who installed the script. Change here if needed. */
function getOwnerEmail_() {
  return Session.getEffectiveUser().getEmail();
}

/**
 * Processes every row that has no Status yet. Safe to run repeatedly:
 * rows with a Status are skipped, so nobody receives two emails.
 */
function processNewRows() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    console.warn('Another run is in progress, skipping.');
    return;
  }
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found.');
    var last = sheet.getLastRow();
    if (last < 2) return;

    var width = COL.NOTIFIED;
    var values = sheet.getRange(2, 1, last - 1, width).getValues();

    values.forEach(function (row, i) {
      var rowNumber = i + 2;
      if (row[COL.STATUS - 1]) return;                   // already processed
      if (!row[COL.NAME - 1] && !row[COL.EMAIL - 1]) return; // empty row

      var lead = {
        name: row[COL.NAME - 1],
        email: row[COL.EMAIL - 1],
        size: row[COL.SIZE - 1],
        budget: row[COL.BUDGET - 1],
        timeline: row[COL.TIMELINE - 1]
      };
      var rowRange = sheet.getRange(rowNumber, 1, 1, width);
      var check = validateLead(lead);

      if (!check.ok) {
        sheet.getRange(rowNumber, COL.SCORE).setValue('');
        sheet.getRange(rowNumber, COL.STATUS).setValue('Invalid');
        sheet.getRange(rowNumber, COL.NOTIFIED).setValue(check.errors.join('; '));
        rowRange.setBackground(COLORS.Invalid);
        return;
      }

      var score = scoreLead(lead);
      var tier = tierFor(score);
      sheet.getRange(rowNumber, COL.SCORE).setValue(score);
      sheet.getRange(rowNumber, COL.STATUS).setValue(tier);
      rowRange.setBackground(COLORS[tier]);

      try {
        var mail = buildConfirmationEmail(lead, tier);
        MailApp.sendEmail(String(lead.email).trim(), mail.subject, mail.body);
        if (tier === 'Hot') {
          MailApp.sendEmail(getOwnerEmail_(), 'Hot lead: ' + lead.name,
            'Score ' + score + '\nEmail: ' + lead.email + '\nBudget: ' + lead.budget +
            '\nTimeline: ' + lead.timeline + '\nSheet row: ' + rowNumber);
        }
        sheet.getRange(rowNumber, COL.NOTIFIED).setValue(new Date());
      } catch (err) {
        // Do not retry in a loop: note the error and move on.
        sheet.getRange(rowNumber, COL.NOTIFIED).setValue('Email failed: ' + err.message);
        console.error('Row ' + rowNumber + ': ' + err.message);
      }
    });
  } finally {
    lock.releaseLock();
  }
}

/** Emails the owner a summary of leads received in the last 24 hours. */
function sendDailySummary() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;
  var since = Date.now() - 24 * 60 * 60 * 1000;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, COL.NOTIFIED).getValues();
  var recent = values
    .filter(function (r) { return r[COL.TIMESTAMP - 1] && new Date(r[COL.TIMESTAMP - 1]).getTime() >= since; })
    .map(function (r) { return { status: r[COL.STATUS - 1] }; });
  var s = summarize(recent);
  MailApp.sendEmail(getOwnerEmail_(), 'Daily lead summary',
    'Last 24 hours: ' + s.total + ' leads\nHot: ' + s.Hot + '\nWarm: ' + s.Warm +
    '\nCold: ' + s.Cold + '\nInvalid: ' + s.Invalid);
}

/** Creates the triggers once (form submit + daily summary at 8:00). Run from the menu. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processNewRows').forSpreadsheet(SpreadsheetApp.getActive()).onFormSubmit().create();
  ScriptApp.newTrigger('sendDailySummary').timeBased().everyDays(1).atHour(8).create();
  SpreadsheetApp.getUi().alert('Triggers installed.');
}
