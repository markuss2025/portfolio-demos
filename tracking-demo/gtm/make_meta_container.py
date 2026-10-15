import json
import os

base = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(base, 'container-final-with-ads.json')))
A, C = '6382700898', '267196483'
PIXEL = '2131649120892137'

base_code = (
    "<script>\n"
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?"
    "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;"
    "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;"
    "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}"
    "(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');\n"
    "fbq('init','" + PIXEL + "');\n"
    "fbq('track','PageView');\n"
    "</script>"
)
lead_code = "<script>fbq('track','Lead');</script>"


def html_tag(tag_id, name, code, trigger):
    return {
        "accountId": A, "containerId": C, "tagId": str(tag_id), "name": name, "type": "html",
        "parameter": [
            {"type": "TEMPLATE", "key": "html", "value": code},
            {"type": "BOOLEAN", "key": "supportDocumentWrite", "value": "false"}],
        "firingTriggerId": [trigger], "tagFiringOption": "ONCE_PER_EVENT"}


tags = d['containerVersion']['tag']
tags.append(html_tag(10, "Meta Pixel - base code + PageView", base_code, "2147479553"))
tags.append(html_tag(11, "Meta Pixel - Lead (form_success)", lead_code, "10"))
json.dump(d, open(os.path.join(base, 'container-final-with-meta.json'), 'w'), indent=1)
print('ok', len(tags))
