import urllib.request
import json
import base64
import os

with open('Test image/20260820_185844.jpg', 'rb') as f:
    b64_img = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()

def api_post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer demo-artisan'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def api_get(url):
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer demo-artisan'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print("=================================================================")
print("KALAKRITI 7-CHARACTER PRODUCT ID & QR AUTHENTICATION LABEL TESTS")
print("=================================================================\n")

# TEST 1: Register Product & verify 7-character ID and QR generation
print("[TEST 1] Registering authentic handicraft product...")
prod1_res = api_post('http://localhost:3001/api/products', {
    'title': 'Puri Palm Leaf Pattachitra Painting',
    'description': 'Intricately etched palm leaf manuscript illustration depicting ancient mythological folklore using natural charcoal and plant pigments.',
    'craftType': 'Palm Leaf Engraving',
    'technique': 'Traditional Iron Nib (Lekhani) Incision & Natural Pigment Rubbing',
    'originState': 'Odisha',
    'originDistrict': 'Puri',
    'materials': [
        {'name': 'Seasoned Tala Palm Leaves', 'source': 'Odisha Coastal Forests', 'percentage': 90},
        {'name': 'Lampblack Carbon & Vegetable Extracts', 'source': 'Artisan Workshop Pigments', 'percentage': 10}
    ],
    'image': b64_img
})
prod1 = prod1_res['data']
pid1 = prod1['productId']
print(f"  -> Product Title:       {prod1['title']}")
print(f"  -> 7-Character ID:      {pid1}")
print(f"  -> Length of ID:        {len(pid1)} chars (Expected: 7)")
print(f"  -> Verification URL:    {prod1.get('verificationUrl')}")
print(f"  -> QR Code Data URL:    {prod1.get('qrCodeDataUrl', '')[:40]}... (Generated)")
print(f"  -> Fingerprint Texture: {prod1.get('fingerprintImageDataUrl', '')[:40]}... (Extracted)")
assert len(pid1) == 7, f"Product ID '{pid1}' must be exactly 7 characters"
assert prod1.get('qrCodeDataUrl', '').startswith('data:image/png;base64,'), "QR code must be a valid base64 PNG data URL"
print("  [SUCCESS] TEST 1 PASSED: 7-character ID & QR generated on registration.\n")

# TEST 2: Customer scans QR / opens verification URL
print("[TEST 2] Verifying QR verification URL formatting & lookup...")
lookup_res = api_get(f'http://localhost:3001/api/products/lookup/{pid1}')
lookup_data = lookup_res['data']
print(f"  -> Lookup Code:         {lookup_data['productId']}")
print(f"  -> Registered Craft:    {lookup_data['title']}")
print(f"  -> Origin:              {lookup_data['originDistrict']}, {lookup_data['originState']}")
assert lookup_data['productId'] == pid1
assert lookup_data['title'] == prod1['title']
print("  [SUCCESS] TEST 2 PASSED: Verification URL resolves to registered product.\n")

# TEST 3: Physical authentication via real Layer 1 Python ML pipeline
print("[TEST 3] Running physical microstructure verification against registered product...")
pc_res = api_post(f'http://localhost:3001/api/products/{pid1}/physical-check', {
    'image': b64_img,
    'location': {'latitude': 19.8135, 'longitude': 85.8312, 'city': 'Puri', 'state': 'Odisha', 'country': 'India'}
})
pc_data = pc_res['data']
print(f"  -> Status:              {pc_data['status']}")
print(f"  -> Decision:            {pc_data['decision']}")
print(f"  -> Similarity:          {pc_data['similarityPercent']}")
print(f"  -> RANSAC Inliers:      {pc_data['metrics']['ransacInliers']}")
print(f"  -> LBP Similarity:      {pc_data['metrics']['lbpSimilarity']:.4f}")
print(f"  -> GLCM Similarity:     {pc_data['metrics']['glcmSimilarity']:.4f}")
print(f"  -> RSA Manifest Hash:   {pc_data['digitalIdentity']['manifestHash'][:16]}...")
assert pc_data['status'] == 'VERIFIED', "Physical check must succeed"
assert pc_data['decision'] == 'AUTHENTIC', "Decision must be AUTHENTIC"
print("  [SUCCESS] TEST 3 PASSED: Real Python ML pipeline authenticated physical fingerprint.\n")

# TEST 4: Second registration confirms dynamic unique ID generation
print("[TEST 4] Registering a second product to confirm uniqueness of 7-character ID...")
prod2_res = api_post('http://localhost:3001/api/products', {
    'title': 'Bastar Lost-Wax Dhokra Bull Figurine',
    'description': 'Ancestral tribal bell metal lost wax brass casting with ornate coiled motifs.',
    'craftType': 'Metal Casting',
    'technique': 'Cire Perdue (Lost Wax) Bell Metal Casting',
    'originState': 'Chhattisgarh',
    'originDistrict': 'Bastar',
    'materials': [
        {'name': 'Bell Metal Brass Scrap', 'source': 'Jagdalpur Artisan Smelter', 'percentage': 80},
        {'name': 'Wild Bee Wax & Clay Core', 'source': 'Bastar Forest Gathering', 'percentage': 20}
    ],
    'image': b64_img
})
prod2 = prod2_res['data']
pid2 = prod2['productId']
print(f"  -> Product 1 ID:        {pid1}")
print(f"  -> Product 2 ID:        {pid2}")
assert pid1 != pid2, "Every product must receive a unique 7-character ID"
assert len(pid2) == 7, "Second Product ID must also be exactly 7 characters"
print("  [SUCCESS] TEST 4 PASSED: Unique dynamic 7-character IDs generated.\n")

# TEST 5: Unregistered/invalid product ID returns 404
print("[TEST 5] Testing invalid product ID lookup...")
try:
    api_get('http://localhost:3001/api/products/lookup/INVALID')
    print("  [FAILED] Should have rejected invalid ID")
except urllib.error.HTTPError as e:
    print(f"  -> HTTP Error Code:     {e.code} (Expected 404)")
    assert e.code == 404
    print("  [SUCCESS] TEST 5 PASSED: Unregistered ID correctly rejected with 404.\n")

print("=================================================================")
print("ALL 5 END-TO-END WORKFLOW & SECURITY TESTS COMPLETED SUCCESSFULLY!")
print("=================================================================")
