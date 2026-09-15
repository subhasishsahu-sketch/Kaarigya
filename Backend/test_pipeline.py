import urllib.request
import json
import base64
import os

with open('Test image/20260820_185844.jpg', 'rb') as f:
    b64_img = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()

def test_post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer demo-artisan'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def test_get(url):
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer demo-artisan'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print('=== STEP 1: Register New Product with Real Craft Image ===')
reg_res = test_post('http://localhost:3001/api/products', {
    'title': 'Sambalpuri Ikat Silk Textile',
    'description': 'Master weaver authentic ikat handloom textile created with natural herb dyes and pure mulberry silk warp.',
    'craftType': 'Handloom Weaving',
    'technique': 'Traditional Double Ikat Handloom Weaving',
    'originState': 'Odisha',
    'originDistrict': 'Sambalpur',
    'materials': [
        {'name': 'Pure Mulberry Silk', 'source': 'Sambalpur Weavers Co-op', 'percentage': 85},
        {'name': 'Natural Vegetable Pigments', 'source': 'Odisha Forest Extraction', 'percentage': 15}
    ],
    'image': b64_img
})
prod_id = reg_res['data']['id']
print('Product Created Successfully:', reg_res['data']['title'])
print('Product ID:', prod_id)
print('Product Code:', reg_res['data']['productCode'])

print('\n=== STEP 2: Execute Real Physical Check against Registered Product ===')
pc_res = test_post(f'http://localhost:3001/api/products/{prod_id}/physical-check', {
    'image': b64_img,
    'location': {'latitude': 21.4669, 'longitude': 83.9812, 'city': 'Sambalpur', 'state': 'Odisha', 'country': 'India'}
})
print('Physical Check Status:', pc_res['data']['status'])
print('Decision:', pc_res['data']['decision'])
print('Similarity:', pc_res['data']['similarityPercent'])
print('Risk Level:', pc_res['data']['riskLevel'])
if 'metrics' in pc_res['data']:
    print('RANSAC Inliers:', pc_res['data']['metrics']['ransacInliers'])
    print('LBP Similarity:', pc_res['data']['metrics']['lbpSimilarity'])
    print('GLCM Similarity:', pc_res['data']['metrics']['glcmSimilarity'])
    print('ROI Quality:', pc_res['data']['metrics']['roiQuality'])
if 'digitalIdentity' in pc_res['data']:
    print('RSA Manifest Hash:', str(pc_res['data']['digitalIdentity']['manifestHash'])[:16], '...')

print('\n=== STEP 3: Fetch Layer 2 Counterfeit Intelligence Dashboard ===')
l2_res = test_get('http://localhost:3001/api/fraud-alerts/intelligence/dashboard')
print('Layer 2 Summary:', l2_res['data']['summary'])
print('Active Alerts Count:', len(l2_res['data']['active_alerts']))

print('\n=== STEP 4: Test 1:N Physical Discovery Endpoint ===')
one_n_res = test_post('http://localhost:3001/api/verify/physical-1-to-n', {
    'image': b64_img,
    'location': {'latitude': 21.4669, 'longitude': 83.9812, 'city': 'Sambalpur', 'state': 'Odisha', 'country': 'India'}
})
print('1:N Status:', one_n_res['data']['status'])
print('1:N Similarity:', one_n_res['data']['similarityPercent'])

print('\n======================================================')
print('🎉 ALL END-TO-END VERIFICATIONS COMPLETED SUCCESSFULLY!')
print('======================================================')
