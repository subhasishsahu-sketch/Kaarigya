You are working on my existing Kalakriti computer-vision product authentication project.

IMPORTANT:
Do NOT rebuild the project from scratch.
First inspect the entire existing repository, including:
- README.md
- requirements.txt
- train.py
- verify.py
- all files under src/
- config/config.yaml
- model/artifact directories
- dataset structure
- existing ROI detection
- preprocessing
- texture feature extraction
- fingerprint generation
- matching logic
- database/storage logic

Understand the existing pipeline before modifying anything.

============================================================
MAIN OBJECTIVE
============================================================

I do NOT want the current verification workflow where the user must provide:

python verify.py -r REFERENCE_IMAGE -q QUERY_IMAGE

This is only a basic 1:1 test and is NOT the final system I want.

I want an automated 1:N PRODUCT IDENTIFICATION + AUTHENTICATION system.

The user should provide ONLY ONE NEW/QUERY IMAGE.

Example:

python verify.py --query "path/to/query.jpg"

The system must automatically search the registered physical-product fingerprint database and determine which registered product the query image belongs to.

============================================================
IMPORTANT CONCEPT
============================================================

There are TWO separate stages:

1. PRODUCT REGISTRATION / ENROLLMENT
2. PRODUCT VERIFICATION / IDENTIFICATION

------------------------------------------------------------
1. PRODUCT REGISTRATION
------------------------------------------------------------

When a genuine physical product is registered, the system receives one or more photographs of that physical product.

The system must:

Image(s)
   ↓
Image preprocessing
   ↓
Find the PRODUCT SURFACE
   ↓
Detect ONE SINGLE, HIGH-QUALITY ROI
   ↓
Normalize ROI
   ↓
Extract texture / micro-level features
   ↓
Generate physical fingerprint
   ↓
Store fingerprint + product ID in database

The database should conceptually look like:

product_id | fingerprint | metadata
------------------------------------
P001       | fingerprint | ...
P002       | fingerprint | ...
P003       | fingerprint | ...
P004       | fingerprint | ...

The reference image should be used during REGISTRATION to create the registered fingerprint.

The reference image should NOT have to be supplied manually every time during verification.

------------------------------------------------------------
2. VERIFICATION / IDENTIFICATION
------------------------------------------------------------

During real-world verification, the user provides ONLY ONE image:

query.jpg

Example:

python verify.py --query "query.jpg"

The system must automatically:

Query image
    ↓
Preprocessing
    ↓
Detect the PRODUCT SURFACE
    ↓
Detect ONE SINGLE BEST ROI
    ↓
ROI quality validation
    ↓
ROI normalization
    ↓
Feature extraction
    ↓
Generate query fingerprint
    ↓
Search ALL registered fingerprints in database
    ↓
Similarity comparison
    ↓
Rank candidates
    ↓
Best matching product
    ↓
Threshold decision
    ↓
RESULT

Example:

Query:
query.jpg

Result:

Product ID: P003
Similarity: 96.8%
Decision: VERIFIED
Confidence: HIGH

OR:

Product ID: UNKNOWN
Best similarity: 61.2%
Decision: NOT VERIFIED
Confidence: LOW

============================================================
CRITICAL REQUIREMENT — NO ITEM DETECTION
============================================================

I do NOT want a generic object/item detection system.

Do NOT implement:
- YOLO object detection
- generic object classification
- bounding boxes around arbitrary objects
- "detect what object is in the image"
- object category recognition

The system already knows that the image contains the product.

The goal is NOT:

"What object is this?"

The goal is:

"Where is the best physical surface/region on this product that contains stable, distinctive micro-level information?"

============================================================
ROI REQUIREMENT
============================================================

The system must detect ONE SINGLE BEST ROI from the product image.

Not multiple random ROIs.

Not the entire image.

Not arbitrary crops.

Not several candidate ROIs returned to the user.

The final pipeline must select ONE optimal ROI that is:

- on the product surface
- sufficiently large
- sharp
- in focus
- well illuminated
- sufficiently textured
- minimally reflective
- minimally blurred
- free from obvious obstruction
- free from edges when possible
- free from logos/text when those areas are not suitable
- geometrically stable
- repeatable across different photographs

The ROI should contain the physical microstructure/texture that can act as the product fingerprint.

============================================================
ROI QUALITY SCORING
============================================================

Implement or improve ROI quality evaluation.

The system should evaluate candidate regions using factors such as:

- sharpness
- local contrast
- texture richness
- entropy
- gradient strength
- illumination uniformity
- blur
- saturation
- reflection/specular highlight
- edge contamination
- usable area

Do NOT simply select the largest region.

Select the BEST region according to a meaningful quality score.

Example conceptual scoring:

ROI score =
    texture quality
  + sharpness
  + contrast
  + structural information
  - blur penalty
  - reflection penalty
  - edge penalty
  - poor illumination penalty

The exact implementation should be chosen based on the existing project architecture.

============================================================
SINGLE ROI CONSISTENCY
============================================================

The same physical product photographed from different angles or under slightly different lighting should ideally produce a similar physical ROI/fingerprint.

Therefore investigate and improve:

- ROI normalization
- resizing
- grayscale conversion where appropriate
- illumination normalization
- contrast normalization
- geometric normalization
- perspective correction if appropriate
- rotation handling
- scale normalization

Do NOT destroy the physical texture information during preprocessing.

============================================================
PHYSICAL FINGERPRINT
============================================================

The fingerprint must represent the physical micro-level characteristics of the product surface.

Preserve the existing feature extraction architecture if it is good.

Inspect the existing implementation for features such as:

- LBP
- texture descriptors
- local gradients
- frequency/texture information
- statistical texture features
- learned embeddings if already present

Do not unnecessarily replace working components.

If the existing feature pipeline is inadequate, improve it carefully.

The final fingerprint should be deterministic and reproducible.

============================================================
DATABASE / REGISTRY
============================================================

Create a proper product fingerprint registry.

The registry must associate:

product_id
+
fingerprint
+
ROI metadata
+
registration metadata

with each registered physical product.

Use a clean architecture.

For example:

database/
    fingerprints/
        P001.json
        P002.json
        P003.json

or an appropriate SQLite/vector database depending on the existing architecture.

Do NOT store only image paths and call that the fingerprint database.

The fingerprint itself must be stored.

If embeddings are used, store the embeddings.

If handcrafted feature vectors are used, store the feature vectors.

============================================================
REGISTRATION COMMAND
============================================================

Create a clean registration/enrollment command.

For example:

python register.py --product-id P001 --image "path/to/reference.jpg"

or support multiple registration images:

python register.py --product-id P001 --images "image1.jpg" "image2.jpg"

If multiple images are used for registration, combine them intelligently to create a robust product fingerprint rather than treating them as unrelated products.

The system must prevent accidental duplicate product IDs.

============================================================
VERIFICATION COMMAND
============================================================

Change verify.py so that the normal usage is:

python verify.py --query "path/to/query.jpg"

or:

python verify.py -q "path/to/query.jpg"

The reference image argument should NO LONGER be required.

Remove the old requirement:

-r / --reference

from the normal verification workflow.

If backward compatibility is useful, the old 1:1 mode may remain as an optional developer/testing mode, but it must NOT be the primary workflow.

============================================================
AUTOMATIC SEARCH
============================================================

Verification must search the complete registered fingerprint database automatically.

Conceptually:

query fingerprint
       ↓
compare with P001
compare with P002
compare with P003
compare with P004
...
       ↓
similarity scores
       ↓
rank candidates
       ↓
best candidate
       ↓
threshold decision

Do not require the user to specify which reference product to compare against.

============================================================
MATCHING LOGIC
============================================================

Implement a clear matching strategy.

The system should calculate a similarity/distance score between:

query fingerprint

and

every registered fingerprint.

Then:

1. Rank all candidates.
2. Select the best candidate.
3. Compare its score against a properly defined verification threshold.
4. Return VERIFIED only if the score passes the threshold.
5. Otherwise return UNKNOWN / NOT VERIFIED.

IMPORTANT:

Do NOT automatically declare the best candidate as genuine just because it is the highest score.

Example:

P001 = 61%
P002 = 63%
P003 = 60%

If the verification threshold is 85%:

Result must be:

UNKNOWN / NOT VERIFIED

not P002.

============================================================
THRESHOLD CALIBRATION
============================================================

Do not invent an arbitrary threshold without documenting it.

If the existing project has validation data, use it.

Ideally evaluate:

Genuine pairs:
same physical product photographed multiple times

Impostor pairs:
different physical products

Use these to determine an appropriate threshold.

Report:

- genuine similarity distribution
- impostor similarity distribution
- threshold
- false acceptance rate
- false rejection rate
- accuracy
- precision
- recall
- ROC/AUC if applicable

If sufficient data is not currently available, implement the architecture for threshold calibration and clearly document that the threshold is provisional.

============================================================
OUTPUT
============================================================

The verification result should be clear and machine-readable.

Example human output:

========================================
KALAKRITI PRODUCT VERIFICATION
========================================

Query image:
query.jpg

ROI:
Detected successfully

ROI quality:
0.91

Best matching product:
P003

Similarity:
96.8%

Threshold:
85.0%

Decision:
VERIFIED

Confidence:
HIGH

========================================

For an unknown product:

========================================
Best candidate:
P007

Similarity:
63.4%

Threshold:
85.0%

Decision:
NOT VERIFIED / UNKNOWN

Reason:
No registered fingerprint exceeded the verification threshold.
========================================

Also provide JSON output if practical:

{
    "query_image": "...",
    "product_id": "P003",
    "similarity": 0.968,
    "threshold": 0.85,
    "decision": "VERIFIED",
    "confidence": "HIGH",
    "roi_quality": 0.91
}

============================================================
ROI FAILURE HANDLING
============================================================

If the system cannot find a sufficiently good single ROI:

DO NOT continue with a bad ROI.

Return:

ROI DETECTION FAILED

Reason:
- insufficient texture
- excessive blur
- excessive reflection
- insufficient usable area
- poor illumination
- etc.

The system should tell the user to retake the image if necessary.

============================================================
IMAGE QUALITY / USER GUIDANCE
============================================================

If possible, add a quality report before verification.

Example:

Image quality:
Sharpness       : GOOD
Lighting        : GOOD
Texture         : GOOD
Reflection      : LOW
ROI quality     : EXCELLENT

Proceeding with verification...

If the image is unsuitable:

Image quality:
Sharpness       : POOR
Reflection      : HIGH
ROI quality     : FAILED

Please capture another image.

============================================================
TRAINING PIPELINE
============================================================

Do not confuse training and verification.

The final architecture should be:

                 TRAINING
                    ↓
              Dataset images
                    ↓
              Preprocessing
                    ↓
             ROI extraction
                    ↓
             Feature extraction
                    ↓
              Model training
                    ↓
              Saved model
                    ↓
             ─────────────
                    ↓
              REGISTRATION
                    ↓
        Genuine product image(s)
                    ↓
              Single ROI
                    ↓
          Physical fingerprint
                    ↓
        Fingerprint database
                    ↓
             ─────────────
                    ↓
             VERIFICATION
                    ↓
             ONE query image
                    ↓
              Single ROI
                    ↓
          Query fingerprint
                    ↓
       Search fingerprint database
                    ↓
             Rank matches
                    ↓
          Threshold decision
                    ↓
       VERIFIED / UNKNOWN