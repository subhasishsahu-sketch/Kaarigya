Yes. For the **current Kalakriti/Kaarigya scope**, I would make the Backend Schema more disciplined than the draft you pasted.

Two important changes from that draft:

1. **RSA / `digital_signatures` are out of the current schema.** SHA-256 integrity hashes can remain.
2. **`wage_escrow_ledgers` should not be in the core MVP schema** unless the Fair-Wage/Escrow feature is actually part of the current PRD. I would keep it as a future extension rather than adding unrelated financial tables now.

Below is a clean **Backend Schema Document v1.0** that matches the PRD and TRD we established.

---

# KALAKRITI / KAARIGYA

# Backend Schema Document

**Database:** PostgreSQL
**Spatial Extension:** PostGIS
**UUID Generation:** `pgcrypto`
**Primary Key Strategy:** UUID
**Timestamp Standard:** `TIMESTAMPTZ`
**Financial Numeric Standard:** `NUMERIC`, never `FLOAT`/`REAL`
**Object Storage:** S3-compatible object storage for images/videos/audio/documents

---

# 1. Database Architecture

Use PostgreSQL logical schemas to separate domains.

```text
PostgreSQL
│
├── identity
│   ├── users
│   ├── roles
│   ├── user_roles
│   └── sessions
│
├── trust
│   ├── cooperative_guilds
│   ├── artisans
│   ├── artisan_memberships
│   └── verification_requests
│
├── registry
│   ├── national_artisan_records
│   └── national_product_records
│
├── catalog
│   ├── craft_categories
│   ├── materials
│   ├── products
│   ├── product_materials
│   ├── product_locations
│   ├── product_media
│   ├── product_reference_images
│   ├── roi_fingerprints
│   ├── qr_codes
│   └── qr_manifests
│
├── authentication
│   ├── authentication_scans
│   └── authentication_metrics
│
├── intelligence
│   ├── counterfeit_incidents
│   ├── counterfeit_incident_events
│   ├── incident_features
│   ├── anomaly_scores
│   ├── clustering_runs
│   ├── cluster_assignments
│   ├── risk_areas
│   └── risk_alerts
│
└── audit
    ├── audit_log
    └── provenance_ledger
```

---

# 2. Common Database Conventions

## 2.1 Primary Keys

Use UUIDs:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

This avoids exposing sequential internal database IDs through APIs.

Public identifiers such as:

```text
KAL-ART-8F29X
KAL-PROD-001928
A7K92XZ
```

are separate from the database UUID.

---

# 3. Identity & Access

## 3.1 `identity.users`

Stores the account used for authentication.

| Column          | Type        | Constraint       | Purpose                  |
| --------------- | ----------- | ---------------- | ------------------------ |
| `id`            | UUID        | PK               | Internal user identifier |
| `email`         | CITEXT      | UNIQUE           | Login email              |
| `phone`         | VARCHAR(20) | UNIQUE, nullable | Phone number             |
| `password_hash` | TEXT        | NOT NULL         | Password hash            |
| `status`        | user_status | NOT NULL         | Account state            |
| `created_at`    | TIMESTAMPTZ | NOT NULL         | Creation time            |
| `updated_at`    | TIMESTAMPTZ | NOT NULL         | Last modification        |
| `last_login_at` | TIMESTAMPTZ | NULL             | Last successful login    |

Passwords are never stored in plaintext.

---

# 4. Roles

## `identity.roles`

| Column        | Type         | Constraint |
| ------------- | ------------ | ---------- |
| `id`          | UUID         | PK         |
| `code`        | VARCHAR(50)  | UNIQUE     |
| `name`        | VARCHAR(100) | NOT NULL   |
| `description` | TEXT         | NULL       |

Recommended roles:

```text
ARTISAN
COOPERATIVE_VERIFIER
REGISTRY_REVIEWER
REGISTRY_ADMIN
SYSTEM_ADMIN
```

A buyer does not need a registered account for QR authentication.

---

# 5. User Roles

## `identity.user_roles`

Many-to-many relationship:

```text
users
  ↕
user_roles
  ↕
roles
```

| Column       | Type        | Constraint |
| ------------ | ----------- | ---------- |
| `user_id`    | UUID        | PK, FK     |
| `role_id`    | UUID        | PK, FK     |
| `granted_at` | TIMESTAMPTZ | NOT NULL   |
| `granted_by` | UUID        | FK → users |

Composite primary key:

```text
(user_id, role_id)
```

---

# 6. Sessions

## `identity.sessions`

| Column               | Type        | Constraint |
| -------------------- | ----------- | ---------- |
| `id`                 | UUID        | PK         |
| `user_id`            | UUID        | FK         |
| `refresh_token_hash` | TEXT        | UNIQUE     |
| `expires_at`         | TIMESTAMPTZ | NOT NULL   |
| `revoked_at`         | TIMESTAMPTZ | NULL       |
| `created_at`         | TIMESTAMPTZ | NOT NULL   |
| `user_agent`         | TEXT        | NULL       |
| `ip_address`         | INET        | NULL       |

Never store raw refresh tokens.

---

# 7. Cooperative / Guild

## `trust.cooperative_guilds`

Represents artisan organizations.

| Column                | Type               | Constraint      |
| --------------------- | ------------------ | --------------- |
| `id`                  | UUID               | PK              |
| `name`                | TEXT               | NOT NULL        |
| `registration_number` | VARCHAR(100)       | UNIQUE          |
| `organization_type`   | VARCHAR(50)        | NOT NULL        |
| `address`             | TEXT               | NULL            |
| `locality`            | TEXT               | NULL            |
| `district`            | TEXT               | NULL            |
| `state`               | TEXT               | NULL            |
| `country`             | TEXT               | DEFAULT `India` |
| `status`              | cooperative_status | NOT NULL        |
| `created_at`          | TIMESTAMPTZ        | NOT NULL        |
| `updated_at`          | TIMESTAMPTZ        | NOT NULL        |

---

# 8. Artisan

## `trust.artisans`

This is the professional artisan profile.

```text
users
   │
   │ 1:1
   ↓
artisans
```

| Column                 | Type                        | Constraint             | Purpose                            |
| ---------------------- | --------------------------- | ---------------------- | ---------------------------------- |
| `id`                   | UUID                        | PK                     | Artisan DB ID                      |
| `user_id`              | UUID                        | UNIQUE, FK             | Associated login account           |
| `kalakriti_artisan_id` | VARCHAR(30)                 | UNIQUE, NULL initially | Public/internal artisan identifier |
| `full_name`            | TEXT                        | NOT NULL               | Artisan name                       |
| `craft_specialization` | TEXT                        | NULL                   | Specialization                     |
| `bio`                  | TEXT                        | NULL                   | Artisan description                |
| `state`                | TEXT                        | NULL                   | State                              |
| `district`             | TEXT                        | NULL                   | District                           |
| `verification_status`  | artisan_verification_status | NOT NULL               | Verification state                 |
| `verified_at`          | TIMESTAMPTZ                 | NULL                   | Verification time                  |
| `created_at`           | TIMESTAMPTZ                 | NOT NULL               | Creation                           |
| `updated_at`           | TIMESTAMPTZ                 | NOT NULL               | Modification                       |

Important:

```text
kalakriti_artisan_id
```

is NULL until the artisan is successfully verified.

After approval:

```text
KAL-ART-8F29X
```

is assigned and remains unique.

---

# 9. Artisan Membership

Do **not** put only `cooperative_id` directly in `artisans`.

Use a membership table so affiliation can be tracked over time.

## `trust.artisan_memberships`

| Column              | Type              | Constraint |
| ------------------- | ----------------- | ---------- |
| `id`                | UUID              | PK         |
| `artisan_id`        | UUID              | FK         |
| `cooperative_id`    | UUID              | FK         |
| `membership_status` | membership_status | NOT NULL   |
| `joined_at`         | TIMESTAMPTZ       | NOT NULL   |
| `left_at`           | TIMESTAMPTZ       | NULL       |
| `created_at`        | TIMESTAMPTZ       | NOT NULL   |

Relationship:

```text
artisan
   │
   └────< artisan_memberships >──── cooperative_guild
```

This supports historical membership.

---

# 10. Artisan Verification Requests

## `trust.verification_requests`

| Column                | Type                        | Constraint |
| --------------------- | --------------------------- | ---------- |
| `id`                  | UUID                        | PK         |
| `artisan_id`          | UUID                        | FK         |
| `membership_id`       | UUID                        | FK         |
| `submitted_at`        | TIMESTAMPTZ                 | NOT NULL   |
| `status`              | verification_request_status | NOT NULL   |
| `reviewed_at`         | TIMESTAMPTZ                 | NULL       |
| `reviewed_by_user_id` | UUID                        | FK         |
| `rejection_reason`    | TEXT                        | NULL       |
| `reviewer_notes`      | TEXT                        | NULL       |

Relationship:

```text
artisan
   ↓
verification_request
   ↓
cooperative membership
   ↓
cooperative verifier
```

---

# 11. National Registry

The national registry should have its own records rather than duplicating artisan/product tables.

## `registry.national_artisan_records`

| Column                | Type            | Constraint |
| --------------------- | --------------- | ---------- |
| `id`                  | UUID            | PK         |
| `artisan_id`          | UUID            | UNIQUE, FK |
| `registry_identifier` | VARCHAR(50)     | UNIQUE     |
| `status`              | registry_status | NOT NULL   |
| `registered_at`       | TIMESTAMPTZ     | NOT NULL   |
| `last_verified_at`    | TIMESTAMPTZ     | NULL       |
| `metadata`            | JSONB           | NULL       |

Relationship:

```text
artisans
   │
   │ 1:1
   ↓
national_artisan_records
```

---

# 12. National Product Registry

## `registry.national_product_records`

| Column                | Type            | Constraint |
| --------------------- | --------------- | ---------- |
| `id`                  | UUID            | PK         |
| `product_id`          | UUID            | UNIQUE, FK |
| `registry_identifier` | VARCHAR(50)     | UNIQUE     |
| `status`              | registry_status | NOT NULL   |
| `registered_at`       | TIMESTAMPTZ     | NOT NULL   |
| `last_verified_at`    | TIMESTAMPTZ     | NULL       |
| `metadata`            | JSONB           | NULL       |

Relationship:

```text
products
   │
   │ 1:1
   ↓
national_product_records
```

---

# 13. Craft Categories

## `catalog.craft_categories`

| Column        | Type        | Constraint |
| ------------- | ----------- | ---------- |
| `id`          | UUID        | PK         |
| `code`        | VARCHAR(50) | UNIQUE     |
| `name`        | TEXT        | UNIQUE     |
| `description` | TEXT        | NULL       |
| `created_at`  | TIMESTAMPTZ | NOT NULL   |

Examples:

```text
TEXTILE
POTTERY
WOOD_CRAFT
METAL_CRAFT
HANDICRAFT
PAINTING
JEWELLERY
```

---

# 14. Materials

## `catalog.materials`

| Column        | Type        | Constraint |
| ------------- | ----------- | ---------- |
| `id`          | UUID        | PK         |
| `code`        | VARCHAR(50) | UNIQUE     |
| `name`        | TEXT        | UNIQUE     |
| `description` | TEXT        | NULL       |
| `created_at`  | TIMESTAMPTZ | NOT NULL   |

---

# 15. Products

## `catalog.products`

This is the central registered-product entity.

| Column              | Type           | Constraint |
| ------------------- | -------------- | ---------- |
| `id`                | UUID           | PK         |
| `product_code`      | VARCHAR(40)    | UNIQUE     |
| `artisan_id`        | UUID           | FK         |
| `craft_category_id` | UUID           | FK         |
| `name`              | TEXT           | NOT NULL   |
| `description`       | TEXT           | NULL       |
| `status`            | product_status | NOT NULL   |
| `registration_date` | TIMESTAMPTZ    | NOT NULL   |
| `created_at`        | TIMESTAMPTZ    | NOT NULL   |
| `updated_at`        | TIMESTAMPTZ    | NOT NULL   |

Relationship:

```text
artisan
   │
   │ 1:N
   ↓
products
```

A product must belong to a valid artisan.

---

# 16. Product Materials

Because one product can contain multiple materials:

## `catalog.product_materials`

| Column        | Type          | Constraint |
| ------------- | ------------- | ---------- |
| `product_id`  | UUID          | PK, FK     |
| `material_id` | UUID          | PK, FK     |
| `quantity`    | NUMERIC(12,3) | NULL       |
| `unit`        | VARCHAR(20)   | NULL       |
| `notes`       | TEXT          | NULL       |

Composite PK:

```text
(product_id, material_id)
```

---

# 17. Product Location

This is **provenance/product metadata**, not authentication location.

## `catalog.product_locations`

| Column          | Type                 | Constraint |
| --------------- | -------------------- | ---------- |
| `id`            | UUID                 | PK         |
| `product_id`    | UUID                 | FK         |
| `location_type` | location_type        | NOT NULL   |
| `locality`      | TEXT                 | NULL       |
| `district`      | TEXT                 | NULL       |
| `state`         | TEXT                 | NULL       |
| `country`       | TEXT                 | NULL       |
| `latitude`      | NUMERIC(9,6)         | NULL       |
| `longitude`     | NUMERIC(9,6)         | NULL       |
| `geom`          | GEOMETRY(Point,4326) | NULL       |
| `created_at`    | TIMESTAMPTZ          | NOT NULL   |

---

# 18. Product Media

All large media goes to object storage.

## `catalog.product_media`

| Column            | Type         | Constraint |
| ----------------- | ------------ | ---------- |
| `id`              | UUID         | PK         |
| `product_id`      | UUID         | FK         |
| `media_type`      | media_type   | NOT NULL   |
| `storage_key`     | TEXT         | NOT NULL   |
| `media_url`       | TEXT         | NULL       |
| `mime_type`       | VARCHAR(100) | NULL       |
| `file_size_bytes` | BIGINT       | NULL       |
| `sha256_hash`     | CHAR(64)     | NULL       |
| `created_at`      | TIMESTAMPTZ  | NOT NULL   |

Store:

```text
S3/Object Storage
    ├── original image
    ├── reference image
    ├── ROI image
    ├── video
    ├── audio
    └── documents
```

PostgreSQL stores metadata and references, not large binaries.

---

# 19. Product Reference Images

## `catalog.product_reference_images`

| Column             | Type                 | Constraint |
| ------------------ | -------------------- | ---------- |
| `id`               | UUID                 | PK         |
| `product_id`       | UUID                 | FK         |
| `media_id`         | UUID                 | UNIQUE, FK |
| `image_role`       | reference_image_role | NOT NULL   |
| `quality_score`    | NUMERIC(6,4)         | NULL       |
| `capture_metadata` | JSONB                | NULL       |
| `created_at`       | TIMESTAMPTZ          | NOT NULL   |

---

# 20. ROI Fingerprints

This replaces the older concept of a heavy "cryptographic physical fingerprint."

It is the **stored physical reference feature representation**.

## `catalog.roi_fingerprints`

| Column                 | Type         | Constraint |
| ---------------------- | ------------ | ---------- |
| `id`                   | UUID         | PK         |
| `reference_image_id`   | UUID         | FK         |
| `roi_method`           | roi_method   | NOT NULL   |
| `x_normalized`         | NUMERIC(8,6) | NOT NULL   |
| `y_normalized`         | NUMERIC(8,6) | NOT NULL   |
| `width_normalized`     | NUMERIC(8,6) | NOT NULL   |
| `height_normalized`    | NUMERIC(8,6) | NOT NULL   |
| `feature_type`         | feature_type | NOT NULL   |
| `descriptor_data`      | BYTEA        | NULL       |
| `template_storage_key` | TEXT         | NULL       |
| `feature_metadata`     | JSONB        | NULL       |
| `algorithm_version`    | VARCHAR(30)  | NOT NULL   |
| `created_at`           | TIMESTAMPTZ  | NOT NULL   |

Possible `feature_type`:

```text
KEYPOINT_RICH
LOW_FEATURE
```

The schema can therefore support:

```text
KEYPOINT_RICH
    → ORB / AKAZE descriptors

LOW_FEATURE
    → NCC / phase / template reference
```

---

# 21. QR Codes

## `catalog.qr_codes`

This is the actual QR identifier table.

| Column            | Type        | Constraint |
| ----------------- | ----------- | ---------- |
| `id`              | UUID        | PK         |
| `qr_id`           | VARCHAR(7)  | UNIQUE     |
| `product_id`      | UUID        | FK         |
| `status`          | qr_status   | NOT NULL   |
| `payload_version` | SMALLINT    | NOT NULL   |
| `generated_at`    | TIMESTAMPTZ | NOT NULL   |
| `activated_at`    | TIMESTAMPTZ | NULL       |
| `revoked_at`      | TIMESTAMPTZ | NULL       |

### Critical constraint

```text
qr_id = exactly 7 characters
```

For example:

```text
A7K92XZ
```

And:

```text
UNIQUE(qr_id)
```

---

# 22. QR Manifest

Since RSA has been removed, this table should **not represent a digitally signed object**.

It can still maintain a versioned product/QR integrity record.

## `catalog.qr_manifests`

| Column             | Type        | Constraint |
| ------------------ | ----------- | ---------- |
| `id`               | UUID        | PK         |
| `qr_code_id`       | UUID        | FK         |
| `manifest_version` | INTEGER     | NOT NULL   |
| `manifest_hash`    | CHAR(64)    | NOT NULL   |
| `manifest_data`    | JSONB       | NOT NULL   |
| `created_at`       | TIMESTAMPTZ | NOT NULL   |

SHA-256:

```text
SHA-256(manifest)
       ↓
64-character hexadecimal hash
```

No RSA private/public key is required in this version.

---

# 23. Digital Signatures

## `digital_signatures`

### **NOT PART OF CURRENT SCHEMA**

Because RSA has explicitly been removed from the current scope.

Do not create a production table for it unless RSA is added back into the requirements.

---

# 24. Authentication Scans

Every buyer authentication attempt becomes a scan record.

## `authentication.authentication_scans`

| Column                 | Type        | Constraint |
| ---------------------- | ----------- | ---------- |
| `id`                   | UUID        | PK         |
| `submitted_qr_id`      | VARCHAR(7)  | NULL       |
| `product_id`           | UUID        | FK, NULL   |
| `query_image_media_id` | UUID        | FK, NULL   |
| `scan_status`          | scan_status | NOT NULL   |
| `algorithm_version`    | VARCHAR(30) | NOT NULL   |
| `client_platform`      | VARCHAR(50) | NULL       |
| `started_at`           | TIMESTAMPTZ | NOT NULL   |
| `completed_at`         | TIMESTAMPTZ | NULL       |

`product_id` can be NULL because an invalid QR may not resolve to a product.

---

# 25. Authentication Metrics

## `authentication.authentication_metrics`

One result per scan.

| Column                    | Type                    |
| ------------------------- | ----------------------- |
| `id`                      | UUID PK                 |
| `scan_id`                 | UUID UNIQUE FK          |
| `roi_method`              | VARCHAR(30)             |
| `keypoint_count`          | INTEGER                 |
| `descriptor_match_count`  | INTEGER                 |
| `good_match_count`        | INTEGER                 |
| `ransac_inlier_count`     | INTEGER                 |
| `inlier_ratio`            | NUMERIC(8,6)            |
| `reprojection_error`      | NUMERIC(12,6)           |
| `ncc_score`               | NUMERIC(8,6)            |
| `phase_correlation_score` | NUMERIC(8,6)            |
| `ssim_score`              | NUMERIC(8,6)            |
| `gradient_similarity`     | NUMERIC(8,6)            |
| `physical_similarity`     | NUMERIC(8,6)            |
| `hard_threshold_passed`   | BOOLEAN                 |
| `ml_enabled`              | BOOLEAN                 |
| `ml_probability`          | NUMERIC(8,6)            |
| `authentication_score`    | NUMERIC(6,3)            |
| `decision`                | authentication_decision |
| `created_at`              | TIMESTAMPTZ             |

The ML fields are nullable.

Therefore:

```text
ml_enabled = false
ml_probability = NULL
```

is perfectly valid.

---

# 26. Counterfeit Incidents

Only suspicious/counterfeit authentication cases enter Layer 2.

## `intelligence.counterfeit_incidents`

| Column                | Type                 | Constraint |
| --------------------- | -------------------- | ---------- |
| `id`                  | UUID                 | PK         |
| `scan_id`             | UUID                 | UNIQUE, FK |
| `product_id`          | UUID                 | FK         |
| `qr_id`               | VARCHAR(7)           | NULL       |
| `incident_type`       | incident_type        | NOT NULL   |
| `physical_similarity` | NUMERIC(8,6)         | NULL       |
| `reported_at`         | TIMESTAMPTZ          | NOT NULL   |
| `location_geom`       | GEOMETRY(Point,4326) | NULL       |
| `latitude`            | NUMERIC(9,6)         | NULL       |
| `longitude`           | NUMERIC(9,6)         | NULL       |
| `location_source`     | location_source      | NULL       |
| `evidence_media_id`   | UUID                 | FK, NULL   |
| `created_at`          | TIMESTAMPTZ          | NOT NULL   |

Important:

```text
location_geom
latitude
longitude
location_source
```

exist **only in Layer 2 incident data**.

They are not used by Layer 1 authentication.

---

# 27. Counterfeit Incident Events

Instead of repeatedly overwriting an incident's history, maintain an append-only event stream.

## `intelligence.counterfeit_incident_events`

| Column        | Type        |
| ------------- | ----------- |
| `id`          | UUID PK     |
| `incident_id` | UUID FK     |
| `event_type`  | VARCHAR(50) |
| `event_data`  | JSONB       |
| `created_by`  | UUID FK     |
| `created_at`  | TIMESTAMPTZ |

Examples:

```text
INCIDENT_CREATED
REVIEW_STARTED
FLAG_CONFIRMED
FLAG_DISMISSED
ALERT_GENERATED
INCIDENT_RESOLVED
```

This gives you an audit-friendly history without deleting the original incident.

---

# 28. Layer 2 Feature Snapshot

## `intelligence.incident_features`

Stores the feature set used by intelligence models.

| Column                 | Type           |
| ---------------------- | -------------- |
| `id`                   | UUID PK        |
| `incident_id`          | UUID UNIQUE FK |
| `feature_version`      | VARCHAR(30)    |
| `incident_count_local` | INTEGER        |
| `time_bucket_count`    | INTEGER        |
| `product_repeat_count` | INTEGER        |
| `physical_similarity`  | NUMERIC(8,6)   |
| `feature_vector`       | JSONB          |
| `created_at`           | TIMESTAMPTZ    |

The `feature_vector` allows new Layer 2 features to be added without immediately changing the relational schema.

---

# 29. Isolation Forest Results

## `intelligence.anomaly_scores`

| Column          | Type          |
| --------------- | ------------- |
| `id`            | UUID PK       |
| `incident_id`   | UUID FK       |
| `model_name`    | VARCHAR(50)   |
| `model_version` | VARCHAR(30)   |
| `anomaly_score` | NUMERIC(10,6) |
| `is_anomaly`    | BOOLEAN       |
| `generated_at`  | TIMESTAMPTZ   |

Example:

```text
model_name:
isolation_forest_v1

anomaly_score:
0.812400

is_anomaly:
true
```

The anomaly score is **Layer 2 intelligence**, not product authenticity.

---

# 30. DBSCAN Clustering Runs

A separate run table is better than storing only the latest cluster.

## `intelligence.clustering_runs`

| Column          | Type          |
| --------------- | ------------- |
| `id`            | UUID PK       |
| `algorithm`     | VARCHAR(30)   |
| `model_version` | VARCHAR(30)   |
| `eps_meters`    | NUMERIC(10,2) |
| `min_samples`   | INTEGER       |
| `parameters`    | JSONB         |
| `started_at`    | TIMESTAMPTZ   |
| `completed_at`  | TIMESTAMPTZ   |

Example:

```text
algorithm = DBSCAN
eps_meters = 500
min_samples = 5
```

Values remain configurable.

---

# 31. Cluster Assignments

## `intelligence.cluster_assignments`

| Column          | Type        |
| --------------- | ----------- |
| `run_id`        | UUID FK     |
| `incident_id`   | UUID FK     |
| `cluster_label` | INTEGER     |
| `is_noise`      | BOOLEAN     |
| `assigned_at`   | TIMESTAMPTZ |

Primary key:

```text
(run_id, incident_id)
```

DBSCAN noise can be represented using:

```text
cluster_label = -1
is_noise = true
```

---

# 32. Geographic Risk Areas

## `intelligence.risk_areas`

This represents the regions displayed on the map.

| Column                    | Type                   |
| ------------------------- | ---------------------- |
| `id`                      | UUID PK                |
| `cluster_run_id`          | UUID FK                |
| `area_geom`               | GEOMETRY(Polygon,4326) |
| `centroid_geom`           | GEOMETRY(Point,4326)   |
| `incident_count`          | INTEGER                |
| `anomaly_count`           | INTEGER                |
| `temporal_activity_score` | NUMERIC(8,6)           |
| `cluster_score`           | NUMERIC(8,6)           |
| `risk_score`              | NUMERIC(6,3)           |
| `risk_level`              | risk_level             |
| `calculated_at`           | TIMESTAMPTZ            |

This is the data consumed by the map.

---

# 33. Risk Alerts

## `intelligence.risk_alerts`

| Column            | Type        |
| ----------------- | ----------- |
| `id`              | UUID PK     |
| `risk_area_id`    | UUID FK     |
| `alert_type`      | VARCHAR(50) |
| `severity`        | risk_level  |
| `message`         | TEXT        |
| `generated_at`    | TIMESTAMPTZ |
| `acknowledged_at` | TIMESTAMPTZ |
| `acknowledged_by` | UUID FK     |

---

# 34. Audit Log

## `audit.audit_log`

Tracks security-sensitive actions.

| Column          | Type         |
| --------------- | ------------ |
| `id`            | UUID PK      |
| `actor_user_id` | UUID FK      |
| `action`        | VARCHAR(100) |
| `entity_type`   | VARCHAR(50)  |
| `entity_id`     | UUID         |
| `old_values`    | JSONB        |
| `new_values`    | JSONB        |
| `ip_address`    | INET         |
| `user_agent`    | TEXT         |
| `created_at`    | TIMESTAMPTZ  |

Examples:

```text
ARTISAN_VERIFICATION_APPROVED
PRODUCT_REGISTERED
QR_CREATED
QR_REVOKED
ROLE_CHANGED
REGISTRY_UPDATED
```

---

# 35. Provenance Ledger

## `audit.provenance_ledger`

Append-only product history.

| Column                | Type        |
| --------------------- | ----------- |
| `id`                  | UUID PK     |
| `product_id`          | UUID FK     |
| `event_type`          | VARCHAR(50) |
| `actor_user_id`       | UUID FK     |
| `event_data`          | JSONB       |
| `previous_event_hash` | CHAR(64)    |
| `event_hash`          | CHAR(64)    |
| `created_at`          | TIMESTAMPTZ |

Example:

```text
PRODUCT_REGISTERED
        ↓
REFERENCE_IMAGE_ADDED
        ↓
ROI_REGISTERED
        ↓
QR_ASSIGNED
        ↓
REGISTRY_REGISTERED
```

The hash chain provides tamper-evidence without RSA.

---

# 36. ER Relationship Map

The core relationships should look like this:

```text
                         ┌──────────────┐
                         │    roles     │
                         └──────┬───────┘
                                │
                         user_roles
                                │
┌──────────────┐          ┌─────┴─────┐
│   sessions   │──────────│   users   │
└──────────────┘          └─────┬─────┘
                                │ 1:1
                                ↓
                         ┌─────────────┐
                         │   artisans  │
                         └──────┬──────┘
                                │
                   ┌────────────┼─────────────┐
                   │            │             │
                   ↓            ↓             ↓
          memberships    verification   national_registry
                   │         requests       record
                   ↓
          cooperative_guilds

                         artisans
                            │
                            │ 1:N
                            ↓
                        products
                            │
             ┌──────────────┼───────────────┐
             │              │               │
             ↓              ↓               ↓
        materials       media         reference_images
             │                              │
             │                              ↓
             └──── product_materials   roi_fingerprints
                                           
                        products
                           │
                           ↓
                       qr_codes
                           │
                           ↓
                      qr_manifests

                         qr_codes
                            │
                            ↓
                   authentication_scans
                            │
                            ↓
                  authentication_metrics
                            │
                  ┌─────────┴──────────┐
                  │                    │
                  ↓                    ↓
          normal result       counterfeit_incident
                                       │
                         ┌─────────────┼─────────────┐
                         ↓             ↓             ↓
                  incident_features  anomaly      events
                                      scores
                                       │
                                       ↓
                                 clustering_runs
                                       │
                                       ↓
                               cluster_assignments
                                       │
                                       ↓
                                  risk_areas
                                       │
                                       ↓
                                  risk_alerts
```

---

# 37. Foreign-Key Rules

For important trust data, use restrictive deletion.

For example:

```text
products.artisan_id
        ↓
artisans.id
```

should use:

```sql
ON DELETE RESTRICT
```

Likewise:

```text
artisans.user_id
verification_requests.artisan_id
products.artisan_id
qr_codes.product_id
counterfeit_incidents.product_id
provenance_ledger.product_id
```

should not cascade-delete trusted records.

### Why?

Deleting an artisan must not silently delete:

```text
Artisan
   ↓
Products
   ↓
QRs
   ↓
Authentication history
   ↓
Counterfeit incidents
   ↓
Registry records
```

For trusted historical records, **soft retirement/status changes** are preferable to destructive deletion.

---

# 38. Important Unique Constraints

At minimum:

```text
users.email
users.phone

roles.code

artisans.user_id
artisans.kalakriti_artisan_id

cooperative_guilds.registration_number

national_artisan_records.registry_identifier
national_product_records.registry_identifier

products.product_code

qr_codes.qr_id

reference_images.media_id

authentication_metrics.scan_id
counterfeit_incidents.scan_id
incident_features.incident_id
```

And an active product QR should be unique.

Conceptually:

```sql
CREATE UNIQUE INDEX uq_active_product_qr
ON catalog.qr_codes(product_id)
WHERE status = 'ACTIVE';
```

---

# 39. QR ID Constraint

The 7-character QR ID should be validated at the database level as well.

Example:

```sql
CHECK (qr_id ~ '^[A-Z0-9]{7}$')
```

Therefore:

```text
A7K92XZ ✅
7AB3K91 ✅

ABC123 ❌   -- 6 characters
ABC12345 ❌ -- 8 characters
a7k92xz ❌  -- lowercase if uppercase-only policy
```

The exact alphabet can later be restricted further to avoid visually confusing characters such as `O/0` or `I/1`.

---

# 40. Timestamp Rules

Every event-bearing table should use:

```text
TIMESTAMPTZ
```

Never use:

```text
TIMESTAMP WITHOUT TIME ZONE
```

for audit/event timestamps.

Examples:

```text
created_at
updated_at
submitted_at
reviewed_at
verified_at
registered_at
generated_at
completed_at
reported_at
calculated_at
```

This is particularly important when records are viewed across different geographic regions.

---

# 41. Geospatial Storage

Use PostGIS:

```sql
GEOMETRY(Point, 4326)
```

for:

* counterfeit incident locations
* product origin locations where appropriate
* risk-area geometry
* cluster centroids

Recommended indexes:

```sql
CREATE INDEX idx_counterfeit_incident_geom
ON intelligence.counterfeit_incidents
USING GIST(location_geom);

CREATE INDEX idx_risk_area_geom
ON intelligence.risk_areas
USING GIST(area_geom);
```

This supports spatial querying and DBSCAN-related processing.

---

# 42. Indexing Strategy

## Critical QR lookup

```text
qr_codes.qr_id
```

must have a B-tree/UNIQUE index.

This is the most important lookup for the buyer flow:

```text
QR
 ↓
qr_codes
 ↓
product
```

## Other important indexes

```text
artisans.kalakriti_artisan_id
artisans.user_id

verification_requests.artisan_id
verification_requests.membership_id
verification_requests.status

products.product_code
products.artisan_id

qr_codes.product_id
qr_codes.status

authentication_scans.submitted_qr_id
authentication_scans.product_id
authentication_scans.started_at

counterfeit_incidents.product_id
counterfeit_incidents.reported_at
counterfeit_incidents.location_geom

anomaly_scores.incident_id
cluster_assignments.incident_id
cluster_assignments.run_id
risk_areas.area_geom
```

Important correction to the earlier statement: an index can support the **database portion** of a fast QR lookup, but a `<150 ms` end-to-end authentication/scan target also depends on API processing, image transfer, CV computation, device performance, and network latency. It should therefore be specified as an application performance target measured under defined conditions, not as a guarantee provided by the schema alone.

---

# 43. Object Storage Architecture

Do not put large image/video/audio binaries into PostgreSQL.

Use:

```text
Object Storage
│
├── artisan/
│
├── products/
│   ├── reference/
│   ├── roi/
│   └── media/
│
├── authentication/
│   └── query-images/
│
└── incidents/
    └── evidence/
```

PostgreSQL stores:

```text
storage_key
media_url
mime_type
file_size_bytes
sha256_hash
```

For example:

```text
storage_key:
products/01H.../reference/ref_001.jpg

sha256_hash:
8f2e...64 hexadecimal characters
```

---

# 44. Immutability Policy

### Append-only

These should be treated as append-only:

```text
audit.audit_log
audit.provenance_ledger
intelligence.counterfeit_incidents
intelligence.counterfeit_incident_events
intelligence.anomaly_scores
intelligence.clustering_runs
intelligence.cluster_assignments
```

Corrections should be represented as new records/events rather than silently rewriting historical evidence.

### Mutable

These can legitimately change:

```text
users
artisans
cooperative_guilds
artisan_memberships
verification_requests
products
qr_codes
registry records
risk_alerts
```

However, sensitive changes should generate an `audit_log` entry.

---

# 45. No RSA in Current Database

The current cryptographic data model is:

```text
Product / Manifest
        ↓
SHA-256
        ↓
Integrity Hash
        ↓
PostgreSQL
```

Not:

```text
RSA Private Key
      ↓
Digital Signature
      ↓
Database
```

There should therefore be **no private-key storage in PostgreSQL** for the current version.

---

# 46. ML Storage Model

Layer 1:

```text
Physical Metrics
      ↓
Hard Thresholds
      ↓
Optional Logistic Regression
```

Database fields:

```text
ml_enabled
ml_probability
model_version
authentication_score
```

These must be nullable because ML can be disabled.

Layer 2:

```text
Counterfeit Incidents
      ↓
Isolation Forest
      ↓
anomaly_scores

Counterfeit Locations
      ↓
DBSCAN
      ↓
clustering_runs
      ↓
cluster_assignments
```

Then:

```text
Isolation Forest
        +
DBSCAN
        +
Density
        +
Temporal Activity
        +
Other Layer 2 Evidence
        ↓
risk_areas
        ↓
risk_score
```

---

# 47. Current Scope vs Future Scope

## Current schema

```text
Identity
✓ Users
✓ Roles
✓ Sessions

Trust
✓ Artisans
✓ Cooperatives/Guilds
✓ Memberships
✓ Verification Requests

Registry
✓ National Artisan Registry
✓ National Product Registry

Product
✓ Products
✓ Materials
✓ Craft Categories
✓ Product Locations
✓ Media
✓ Reference Images
✓ ROI Fingerprints
✓ QR Codes
✓ QR Manifests

Authentication
✓ Scans
✓ Physical Similarity Metrics
✓ Optional Logistic Regression

Layer 2
✓ Counterfeit Incidents
✓ Anomaly Scores
✓ Isolation Forest
✓ DBSCAN
✓ Risk Areas
✓ Risk Alerts

Audit
✓ Audit Log
✓ Provenance Ledger
```

## Not current scope

```text
✗ RSA Digital Signatures
✗ Private Key Storage
✗ Mandatory ML Authentication
✗ Deep Learning Authentication
✗ Wage Escrow / Financial Ledger
```

The **wage escrow ledger** should be placed in a separate future-extension section rather than contaminating the current Kalakriti database design.

---

# 48. Final Data Flow Through the Database

The entire system can now be understood as:

```text
USER
 │
 ↓
users
 │
 ↓
artisans
 │
 ↓
artisan_memberships
 │
 ↓
cooperative_guilds
 │
 ↓
verification_requests
 │
 ↓
VERIFIED ARTISAN
 │
 ↓
national_artisan_records
 │
 ↓
products
 ├────────→ product_materials → materials
 │
 ├────────→ product_locations
 │
 ├────────→ product_media
 │
 ├────────→ product_reference_images
 │                     │
 │                     ↓
 │                roi_fingerprints
 │
 └────────→ qr_codes
                  │
                  ↓
             qr_manifests
                  │
                  ↓
          BUYER SCANS QR
                  │
                  ↓
       authentication_scans
                  │
                  ↓
       authentication_metrics
                  │
          ┌───────┴────────┐
          ↓                ↓
      AUTHENTIC       SUSPICIOUS
                            │
                            ↓
               counterfeit_incidents
                            │
                ┌───────────┼───────────┐
                ↓           ↓           ↓
           features    Isolation     events
                           Forest
                            ↓
                      anomaly_scores

counterfeit locations
          ↓
        DBSCAN
          ↓
cluster_assignments
          ↓
     risk_areas
          ↓
     geographic map
          ↓
    risk alerts
```

## The most important design principle

Your database should enforce this separation:

```text
                    LAYER 1
              PRODUCT AUTHENTICATION
                       │
                       │
          Physical evidence + QR
                       │
                       ↓
                Authentication
                       │
                       │ suspicious only
                       ↓
                    LAYER 2
          COUNTERFEIT INTELLIGENCE
                       │
           ┌───────────┴───────────┐
           ↓                       ↓
     Isolation Forest           DBSCAN
           ↓                       ↓
      Anomalies               Clusters
           └───────────┬───────────┘
                       ↓
                   Risk Map
```

**Location, DBSCAN, Isolation Forest, geographic risk, and map intelligence are not database inputs to the Layer 1 authentication calculation.**

That separation should be reflected not just in the TRD, but also in the actual table relationships and API permissions.
