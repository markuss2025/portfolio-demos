import json, os

base = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(base, 'container-after.json')))
A, C = '6382700898', '267196483'
tags = d['containerVersion']['tag']
tags.append({
    "accountId": A, "containerId": C, "tagId": "7", "name": "Conversion Linker", "type": "gclidw",
    "parameter": [
        {"type": "BOOLEAN", "key": "enableCrossDomain", "value": "false"},
        {"type": "BOOLEAN", "key": "enableUrlPassthrough", "value": "false"},
        {"type": "BOOLEAN", "key": "enableCookieOverrides", "value": "false"}],
    "firingTriggerId": ["2147479553"], "tagFiringOption": "ONCE_PER_EVENT"})
tags.append({
    "accountId": A, "containerId": C, "tagId": "8", "name": "Google Ads conversion - Demo lead", "type": "awct",
    "parameter": [
        {"type": "BOOLEAN", "key": "enableConversionLinker", "value": "true"},
        {"type": "TEMPLATE", "key": "conversionValue", "value": "1"},
        {"type": "TEMPLATE", "key": "currencyCode", "value": "USD"},
        {"type": "TEMPLATE", "key": "conversionId", "value": "874698618"},
        {"type": "TEMPLATE", "key": "conversionLabel", "value": "KUWqCP7S5J0dEPqui6ED"},
        {"type": "BOOLEAN", "key": "rdp", "value": "false"}],
    "firingTriggerId": ["10"], "tagFiringOption": "ONCE_PER_EVENT"})
json.dump(d, open(os.path.join(base, 'container-with-ads.json'), 'w'), indent=1)
print('ok', len(tags))
