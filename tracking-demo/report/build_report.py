from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from PIL import Image as PI
import os

base = os.path.dirname(os.path.abspath(__file__))
ev = os.path.join(base, '..', 'evidence-en')
ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Heading1'], fontSize=17, spaceAfter=4, textColor=colors.HexColor('#14213d'))
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontSize=12, spaceBefore=8, spaceAfter=3, textColor=colors.HexColor('#14213d'))
B = ParagraphStyle('B', parent=ss['BodyText'], fontSize=9, leading=12)
S = ParagraphStyle('S', parent=B, fontSize=8, leading=10)
C = ParagraphStyle('C', parent=B, fontSize=7.5, leading=9.5, textColor=colors.HexColor('#5b6478'))


def banner(t):
    tb = Table([[Paragraph(t, ParagraphStyle('bn', parent=B, textColor=colors.white))]], colWidths=[174 * mm])
    tb.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#14213d')),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return tb


def tbl(data, widths):
    rows = [[Paragraph(str(c), S) for c in r] for r in data]
    t = Table(rows, colWidths=[w * mm for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#d7deea')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2fa'))]))
    return t


def img(rel, width_mm=170):
    p = os.path.join(ev, rel)
    w, h = PI.open(p).size
    return Image(p, width=width_mm * mm, height=width_mm * mm * h / w)


def footer(c, d):
    c.saveState()
    c.setFont('Helvetica', 7)
    c.setFillColor(colors.HexColor('#5b6478'))
    c.drawString(18 * mm, 10 * mm, 'DEMO sample audit report - own demo page and own demo accounts, test data only. Not a client report.')
    c.drawRightString(192 * mm, 10 * mm, 'Page %d' % d.page)
    c.restoreState()


doc = SimpleDocTemplate(os.path.join(base, 'tracking-audit-sample-report.pdf'), pagesize=A4,
                        leftMargin=18 * mm, rightMargin=18 * mm, topMargin=14 * mm, bottomMargin=16 * mm,
                        title='Sample tracking audit report (Demo)', author='Marin Pascan')
f = []
f += [banner('DEMO: this is a sample report made on my own test page and my own GTM and GA4 demo accounts. It is not client data.'), Spacer(1, 6)]
f += [Paragraph('Sample tracking audit: 3 issues found and fixed', H1)]
f += [Paragraph('Test date: 2026-10-15. Tools: Google Tag Manager Preview (Tag Assistant), GA4 DebugView. Browser: Chrome on Windows 11. Page: GitHub Pages test page with a contact form, phone link, email link, CTA button and a PDF link.', B)]
f += [Paragraph('1. Summary', H2)]
f += [Paragraph('I built a test page with three typical tracking mistakes, found each one with GTM Preview and GA4 DebugView, fixed it in Tag Manager and tested again. Only event counts that I saw during the tests are reported. No business results were measured.', B)]
f += [Paragraph('2. Findings', H2)]
f += [tbl([
    ['#', 'Issue', 'Impact', 'Evidence (before)', 'Fix', 'Status after retest'],
    ['1', 'Lead event fires on a click on the Send button, not on a successful form', 'Empty or invalid submits are counted as leads (3 empty clicks gave 3 generate_lead)', 'Tag Assistant: generate_lead fired 4 times for 3 empty and 1 valid submit', 'Trigger changed to Custom Event form_success', 'Fixed: empty submit = 0, valid submit = 1'],
    ['2', 'Extra GA4 event tag named page_view fires on All Pages', 'Every page load is counted twice (inflated page views, wrong engagement data)', 'Tag Assistant and DebugView: 2 page_view in the same second on one load', 'Extra tag removed, only the Google tag sends page_view', 'Fixed: 1 page_view per load'],
    ['3', 'Phone click is not tracked', 'Phone clicks are missing from reports', 'Tag Assistant: click_phone tag not fired after a click on the phone icon', 'Trigger changed from Click Text contains "Call" to Click URL starts with tel:', 'Fixed: 1 click_phone per click'],
], [6, 38, 34, 36, 32, 28])]
f += [Spacer(1, 6), Paragraph('Other checks (passed in both runs): email link = 1 click_email, CTA button = 1 click_cta, PDF link = 1 file_download (GA4 enhanced measurement).', B)]
f += [PageBreak()]
f += [Paragraph('3. Evidence screenshots (raw, not edited)', H2)]
for rel, cap, w in [
    ('before-fix/2026-10-15_B1_tag-assistant-lead-fired-4-times-phone-not-fired.jpg', 'Before (Tag Assistant): generate_lead fired 4 times (3 empty submits + 1 valid), click_phone did not fire, an extra page_view tag fired.', 80),
    ('before-fix/2026-10-15_B2_tag-assistant-ga4-hits-4-leads-2-page-views.jpg', 'Before (Tag Assistant): hits sent to GA4 after one page load and the test clicks: 2 Page View and 4 generate_lead.', 80),
    ('before-fix/2026-10-15_B3_ga4-debugview-timeline-3-empty-submits-3-leads-cropped.jpg', 'Before (GA4 DebugView, cropped): 3 generate_lead within 2 seconds for 3 empty submits (1:43:32-1:43:33 PM), then 1 for the valid submit.', 46),
    ('after-fix/2026-10-15_A1_tag-assistant-all-tags-fired-once.jpg', 'After (Tag Assistant, fixed container): each tag fired once; click_phone fired.', 80),
    ('after-fix/2026-10-15_A2_tag-assistant-ga4-hits-sent.jpg', 'After (Tag Assistant): hits sent to GA4: one Page View, one generate_lead, click_phone, click_email, click_cta, file_download.', 80)]:
    f += [KeepTogether([img(rel, w), Paragraph(cap, C), Spacer(1, 4)])]
f += [PageBreak()]
f += [Paragraph('4. Test log', H2)]
f += [tbl([
    ['Test', 'Action', 'Expected', 'Before fix', 'After fix'],
    ['Page load', 'open page once', '1 page_view', '2', '1'],
    ['Empty form', 'click Send, fields empty', '0 generate_lead', '1 per click', '0'],
    ['Valid form', 'fill fields, click Send', '1 generate_lead', '1', '1'],
    ['Phone link', 'click phone', '1 click_phone', '0', '1'],
    ['Email link', 'click mailto', '1 click_email', '1', '1'],
    ['CTA button', 'click Book a free check', '1 click_cta', '1', '1'],
    ['PDF link', 'click PDF link', '1 file_download', '1', '1'],
], [30, 44, 34, 34, 32])]
f += [Paragraph('5. Notes and limits', H2)]
for t in [
    'A hard-coded gtag.js with the same Measurement ID next to the GTM Google tag did not create a second page_view in this test, so I used an extra GA4 event tag to build the duplicate. Other duplicate causes were not tested.',
    'Events sent in debug mode appear in standard GA4 reports and in the Events list only after processing (up to 24 hours). Standard reports and key events are not part of this test.',
    'Tested on one browser (Chrome, Windows 11). Mobile, other browsers and consent banners were not tested.',
    'The GTM container before and after the fix is attached as JSON files (container-before-3-bugs.json, container-after.json).']:
    f += [Paragraph('- ' + t, B)]
doc.build(f, onFirstPage=footer, onLaterPages=footer)
print('ok')
