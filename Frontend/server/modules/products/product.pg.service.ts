// server/modules/products/product.pg.service.ts
// PostgreSQL-backed product service.
// Mirrors product.service.ts but reads/writes from the real database defined in Data Base.md.
// The in-memory supabase.ts is used as a fallback when the DB is unavailable.

import crypto from 'crypto';
import QRCode from 'qrcode';
import { query, withTransaction } from '../../config/db';
import { sha256 } from '../../utils/cryptoHash';
import { MLClientService } from '../ai/mlClient.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '../../config/constants';
import type { AuthUser, Product, ProductMaterial, ProductEvidence } from '../../types';

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

async function generateUnique7CharId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const bytes = crypto.randomBytes(7);
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += CHARSET[bytes[i] % CHARSET.length];
    }
    // Check uniqueness in DB
    const { rowCount } = await query(
      'SELECT 1 FROM catalog.products WHERE product_id = $1',
      [result]
    );
    if (rowCount === 0) return result;
  }
  throw new AppError(ERROR_CODES.INTERNAL_ERROR, 'Could not generate unique 7-char Product ID', 500);
}

/**
 * Maps a raw catalog.products row (with joined artisan) to the Product domain type.
 */
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    productId: row.product_id,
    productCode: row.product_code,
    artisanId: row.artisan_id,
    cooperativeId: row.cooperative_id,
    title: row.title,
    description: row.description,
    craftType: row.craft_type,
    giTagName: row.gi_tag_name,
    technique: row.technique,
    originState: row.origin_state,
    originDistrict: row.origin_district,
    creationDate: row.creation_date,
    weightGrams: row.weight_grams,
    status: row.status,
    verificationUrl: row.verification_url,
    qrCodeDataUrl: row.qr_code_data_url,
    fingerprintImageDataUrl: row.fingerprint_image_data_url,
    primaryImageUrl: row.primary_image_url,
    processVideoUrl: row.process_video_url,
    processVideoStatus: row.process_video_status,
    processVideoDuration: row.process_video_duration,
    materials: row.materials || [],
    evidence: row.evidence || [],
    artisan: row.artisan || undefined,
    cooperative: row.cooperative || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProductPgService {

  /**
   * List all products with artisan join.
   */
  static async listProducts(): Promise<Product[]> {
    const { rows } = await query(`
      SELECT
        p.*,
        jsonb_build_object(
          'id', a.id,
          'fullName', a.full_name,
          'craftSpecialties', a.craft_specialties,
          'experienceYears', a.experience_years,
          'regionState', a.state,
          'district', a.district,
          'clusterName', a.craft_village,
          'giAuthorizedNo', a.gi_authorized_no,
          'verificationStatus', a.verification_status
        ) AS artisan,
        jsonb_build_object(
          'id', cg.id,
          'name', cg.name,
          'regionState', cg.state,
          'district', cg.district
        ) AS cooperative,
        COALESCE(
          (SELECT json_agg(jsonb_build_object(
            'id', pm.id, 'productId', pm.product_id,
            'name', pm.name, 'source', pm.source,
            'organicCert', pm.organic_cert, 'percentage', pm.percentage
          )) FROM catalog.product_materials pm WHERE pm.product_id = p.id),
          '[]'::json
        ) AS materials,
        COALESCE(
          (SELECT json_agg(jsonb_build_object(
            'id', pe.id, 'productId', pe.product_id,
            'uploadedBy', pe.uploaded_by,
            'evidenceType', pe.evidence_type, 'label', pe.label,
            'fileUrl', pe.file_url, 'fileHash', pe.file_hash,
            'geoLat', pe.geo_lat, 'geoLng', pe.geo_lng,
            'geoTagLabel', pe.geo_tag_label,
            'capturedAt', pe.captured_at, 'createdAt', pe.created_at
          )) FROM catalog.product_evidence pe WHERE pe.product_id = p.id),
          '[]'::json
        ) AS evidence
      FROM catalog.products p
      LEFT JOIN trust.artisans a ON a.id = p.artisan_id
      LEFT JOIN trust.cooperative_guilds cg ON cg.id = p.cooperative_id
      ORDER BY p.registered_at DESC
    `);
    return rows.map(rowToProduct);
  }

  /**
   * Fetch a single product by its internal UUID or 7-char product_id.
   */
  static async getProduct(id: string): Promise<Product> {
    const { rows } = await query(`
      SELECT
        p.*,
        jsonb_build_object(
          'id', a.id, 'fullName', a.full_name,
          'craftSpecialties', a.craft_specialties,
          'experienceYears', a.experience_years,
          'regionState', a.state, 'district', a.district,
          'clusterName', a.craft_village, 'giAuthorizedNo', a.gi_authorized_no,
          'verificationStatus', a.verification_status
        ) AS artisan,
        jsonb_build_object('id', cg.id, 'name', cg.name, 'regionState', cg.state, 'district', cg.district) AS cooperative,
        COALESCE(
          (SELECT json_agg(jsonb_build_object('id',pm.id,'productId',pm.product_id,'name',pm.name,'source',pm.source,'organicCert',pm.organic_cert,'percentage',pm.percentage))
           FROM catalog.product_materials pm WHERE pm.product_id = p.id),
          '[]'::json
        ) AS materials,
        COALESCE(
          (SELECT json_agg(jsonb_build_object('id',pe.id,'productId',pe.product_id,'uploadedBy',pe.uploaded_by,'evidenceType',pe.evidence_type,'label',pe.label,'fileUrl',pe.file_url,'fileHash',pe.file_hash,'geoLat',pe.geo_lat,'geoLng',pe.geo_lng,'geoTagLabel',pe.geo_tag_label,'capturedAt',pe.captured_at,'createdAt',pe.created_at))
           FROM catalog.product_evidence pe WHERE pe.product_id = p.id),
          '[]'::json
        ) AS evidence
      FROM catalog.products p
      LEFT JOIN trust.artisans a ON a.id = p.artisan_id
      LEFT JOIN trust.cooperative_guilds cg ON cg.id = p.cooperative_id
      WHERE p.id = $1 OR p.product_id = $2
      LIMIT 1
    `, [id, id.toUpperCase()]);

    if (rows.length === 0) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${id}' not found.`, 404);
    }
    return rowToProduct(rows[0]);
  }

  /**
   * Lookup by 7-char QR ID or product_code (used by public buyer verification).
   */
  static async lookupByCode(code: string): Promise<Product> {
    const clean = code.trim().toUpperCase();
    const { rows } = await query(`
      SELECT
        p.*,
        jsonb_build_object('id',a.id,'fullName',a.full_name,'craftSpecialties',a.craft_specialties,'experienceYears',a.experience_years,'regionState',a.state,'district',a.district,'clusterName',a.craft_village,'giAuthorizedNo',a.gi_authorized_no,'verificationStatus',a.verification_status) AS artisan,
        jsonb_build_object('id',cg.id,'name',cg.name,'regionState',cg.state,'district',cg.district) AS cooperative,
        COALESCE((SELECT json_agg(jsonb_build_object('id',pm.id,'productId',pm.product_id,'name',pm.name,'source',pm.source,'organicCert',pm.organic_cert,'percentage',pm.percentage)) FROM catalog.product_materials pm WHERE pm.product_id=p.id),'[]'::json) AS materials,
        COALESCE((SELECT json_agg(jsonb_build_object('id',pe.id,'productId',pe.product_id,'uploadedBy',pe.uploaded_by,'evidenceType',pe.evidence_type,'label',pe.label,'fileUrl',pe.file_url,'fileHash',pe.file_hash,'geoLat',pe.geo_lat,'geoLng',pe.geo_lng,'geoTagLabel',pe.geo_tag_label,'capturedAt',pe.captured_at,'createdAt',pe.created_at)) FROM catalog.product_evidence pe WHERE pe.product_id=p.id),'[]'::json) AS evidence
      FROM catalog.products p
      LEFT JOIN trust.artisans a ON a.id = p.artisan_id
      LEFT JOIN trust.cooperative_guilds cg ON cg.id = p.cooperative_id
      WHERE p.product_id = $1 OR p.product_code = $1 OR p.id::text = $1
      LIMIT 1
    `, [clean]);

    if (rows.length === 0) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product ID '${code}' is not registered in the Kalakriti database.`, 404);
    }
    return rowToProduct(rows[0]);
  }

  /**
   * Register a new craft product.
   * Validates artisan VERIFIED status, generates 7-char ID, creates QR, enrolls ML fingerprint,
   * inserts product + materials + evidence + QR code + manifest + provenance ledger event.
   */
  static async createProduct(input: any, user: AuthUser): Promise<Product> {
    const artisanId = user.role === 'ARTISAN' ? user.id : (input.artisanId || user.id);

    // Enforce artisan verification (must be VERIFIED in trust.artisans)
    if (user.role === 'ARTISAN') {
      const { rows: artRows } = await query(
        'SELECT verification_status, kalakriti_artisan_id FROM trust.artisans WHERE id = $1',
        [artisanId]
      );
      if (!artRows.length || artRows[0].verification_status !== 'VERIFIED' || !artRows[0].kalakriti_artisan_id) {
        const status = artRows[0]?.verification_status || 'UNVERIFIED';
        throw new AppError(
          ERROR_CODES.FORBIDDEN,
          `Product registration blocked. Artisan status: '${status}'. Cooperative approval required.`,
          403
        );
      }
    }

    // Get artisan's cooperative_id
    const { rows: artRows2 } = await query('SELECT cooperative_id FROM trust.artisans WHERE id = $1', [artisanId]);
    const cooperativeId = artRows2[0]?.cooperative_id || null;

    const productId7 = await generateUnique7CharId();
    const productCode = `CRAFT-${(input.originState || 'IND').slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${productId7}`;
    const publicBaseUrl = process.env.APP_URL || 'http://localhost:3001';
    const verificationUrl = `${publicBaseUrl}/verify/${productId7}`;

    // Generate QR code
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H', margin: 2, width: 600,
        color: { dark: '#1C1917', light: '#FAF7F2' }
      });
    } catch {
      console.warn('[ProductPgService] QR generation failed');
    }

    // Build evidence list
    const evidence: any[] = (input.evidence || []).map((ev: any) => ({
      evidenceType: ev.evidenceType || 'WORKSHOP_PHOTO',
      label: ev.label || 'Evidence Photo',
      fileUrl: ev.fileUrl || '',
      fileHash: sha256((ev.fileUrl || '') + (ev.label || '')),
      geoLat: ev.geoLat || null,
      geoLng: ev.geoLng || null,
      geoTagLabel: ev.geoTagLabel || null,
    }));

    const primaryImgUrl = evidence.find(e => e.fileUrl)?.fileUrl || input.image || '';

    // Try ML fingerprint enrollment
    let mlRegistration: any = null;
    if (primaryImgUrl) {
      mlRegistration = await MLClientService.registerProduct({
        productId: productId7,
        name: input.title,
        category: input.craftType,
        location: `${input.originDistrict || ''}, ${input.originState || 'India'}`,
        imageBase64: primaryImgUrl.startsWith('data:') ? primaryImgUrl : undefined,
        imageUrl: !primaryImgUrl.startsWith('data:') ? primaryImgUrl : undefined,
        force: true
      }).catch(err => { console.warn('[ML] Registration failed:', err.message); return null; });
    }

    const manifestData = {
      productId: productId7,
      productCode,
      craftType: input.craftType,
      artisanId,
      registeredAt: new Date().toISOString(),
    };
    const manifestHash = sha256(JSON.stringify(manifestData));

    // Write everything to the database atomically
    const newProduct = await withTransaction(async (client) => {
      // 1. Insert product
      const { rows: [productRow] } = await client.query(`
        INSERT INTO catalog.products (
          product_id, product_code, artisan_id, cooperative_id,
          title, description, craft_type, gi_tag_name, technique,
          origin_state, origin_district, weight_grams,
          status, verification_url, qr_code_data_url,
          fingerprint_image_data_url, primary_image_url,
          process_video_url, process_video_status,
          manifest_hash, registered_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW())
        RETURNING *
      `, [
        productId7, productCode, artisanId, cooperativeId,
        input.title, input.description || '', input.craftType, input.giTagName || null, input.technique || null,
        input.originState || 'India', input.originDistrict || '', input.weightGrams || null,
        'REGISTERED', verificationUrl, qrCodeDataUrl || null,
        mlRegistration?.roi_image_base64 || primaryImgUrl || null, primaryImgUrl || null,
        input.processVideoUrl || null, input.processVideoUrl ? 'SUBMITTED' : null,
        manifestHash
      ]);

      const productDbId = productRow.id;

      // 2. Insert materials
      for (const m of (input.materials || [])) {
        await client.query(
          'INSERT INTO catalog.product_materials (product_id, name, source, organic_cert, percentage) VALUES ($1,$2,$3,$4,$5)',
          [productDbId, m.name, m.source || 'Artisan Workshop', m.organicCert || null, m.percentage || 100]
        );
      }

      // 3. Insert evidence
      for (const ev of evidence) {
        await client.query(
          'INSERT INTO catalog.product_evidence (product_id, uploaded_by, evidence_type, label, file_url, file_hash, geo_lat, geo_lng, geo_tag_label) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [productDbId, user.id, ev.evidenceType, ev.label, ev.fileUrl, ev.fileHash, ev.geoLat, ev.geoLng, ev.geoTagLabel]
        );
      }

      // 4. Create QR code record
      await client.query(
        'INSERT INTO catalog.qr_codes (qr_id, product_id, status, activated_at) VALUES ($1,$2,$3,NOW())',
        [productId7, productDbId, 'ACTIVE']
      );

      // 5. Create QR manifest (SHA-256 tamper-evidence, no RSA)
      const { rows: [qrRow] } = await client.query(
        'SELECT id FROM catalog.qr_codes WHERE qr_id = $1', [productId7]
      );
      await client.query(
        'INSERT INTO catalog.qr_manifests (qr_code_id, manifest_data, manifest_hash) VALUES ($1,$2,$3)',
        [qrRow.id, JSON.stringify(manifestData), manifestHash]
      );

      // 6. Provenance ledger genesis event
      const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const entryPayload = { craftType: input.craftType, origin: `${input.originDistrict}, ${input.originState}`, manifestHash };
      const entryHash = sha256(genesisHash + productDbId + 'PRODUCT_CREATED' + JSON.stringify(entryPayload));
      await client.query(
        'INSERT INTO audit.provenance_ledger (product_id, event_name, actor_id, actor_name, actor_role, event_payload, previous_entry_hash, entry_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [productDbId, 'PRODUCT_CREATED', user.id, user.fullName, user.role, JSON.stringify(entryPayload), genesisHash, entryHash]
      );

      return productRow;
    });

    // Return full product
    return ProductPgService.getProduct(newProduct.id);
  }

  /**
   * Add evidence item to existing product.
   */
  static async addEvidence(productId: string, evidenceItem: any, user: AuthUser): Promise<ProductEvidence> {
    // Verify product exists
    const { rowCount } = await query('SELECT 1 FROM catalog.products WHERE id = $1', [productId]);
    if (rowCount === 0) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' not found.`, 404);
    }

    const fileHash = sha256((evidenceItem.fileUrl || '') + (evidenceItem.label || ''));
    const { rows: [ev] } = await query(`
      INSERT INTO catalog.product_evidence
        (product_id, uploaded_by, evidence_type, label, file_url, file_hash, geo_lat, geo_lng, geo_tag_label)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      productId, user.id,
      evidenceItem.evidenceType || 'WORKSHOP_PHOTO',
      evidenceItem.label || 'Evidence',
      evidenceItem.fileUrl || '',
      fileHash,
      evidenceItem.geoLat || null,
      evidenceItem.geoLng || null,
      evidenceItem.geoTagLabel || null,
    ]);

    return {
      id: ev.id,
      productId: ev.product_id,
      uploadedBy: ev.uploaded_by,
      evidenceType: ev.evidence_type,
      label: ev.label,
      fileUrl: ev.file_url,
      fileHash: ev.file_hash,
      geoLat: ev.geo_lat,
      geoLng: ev.geo_lng,
      geoTagLabel: ev.geo_tag_label,
      capturedAt: ev.captured_at,
      createdAt: ev.created_at,
    };
  }
}
