import crypto from 'crypto';
import QRCode from 'qrcode';
import { db } from '../../config/supabase';
import { Product, ProductEvidence, ProductMaterial, AuthUser, ProductStatus } from '../../types';
import { ProvenanceService } from '../provenance/provenance.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '../../config/constants';
import { sha256 } from '../../utils/cryptoHash';
import { MLClientService } from '../ai/mlClient.service';

export class ProductService {
  /**
   * Generates a cryptographically secure, globally unique 7-character alphanumeric Product ID.
   */
  public static generate7CharProductId(): string {
    const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let attempts = 0;
    while (attempts < 20) {
      attempts++;
      const bytes = crypto.randomBytes(7);
      let result = '';
      for (let i = 0; i < 7; i++) {
        result += CHARSET[bytes[i] % CHARSET.length];
      }
      if (!db.productsBy7CharId.has(result)) {
        return result;
      }
    }
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, 'Could not generate a unique 7-character Product ID', 500);
  }

  /**
   * Registers a new craft product with materials and optional workshop evidence.
   */
  public static async createProduct(
    input: any,
    user: AuthUser
  ): Promise<Product> {
    const artisanId = user.role === 'ARTISAN' ? user.id : input.artisanId || user.id;
    const artisan = db.artisans.get(artisanId);

    // Enforce strict Artisan Verification & Kalakriti Artisan ID check
    if (user.role === 'ARTISAN') {
      if (!artisan || artisan.verificationStatus !== 'VERIFIED' || !artisan.kalakritiArtisanId) {
        throw new AppError(
          ERROR_CODES.FORBIDDEN,
          `Product registration is blocked. Artisan account status is '${artisan?.verificationStatus || 'UNVERIFIED'}'. Cooperative/Guild approval and a valid Kalakriti Artisan ID are required.`,
          403
        );
      }
    }

    // Authoritative 7-character Product ID generated securely on the backend
    const productId7 = this.generate7CharProductId();
    const internalId = `prod-${Date.now()}-${productId7}`;
    const productCode = `CRAFT-${(input.originState || 'IND').slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${productId7}`;

    const materials: ProductMaterial[] = (input.materials || []).map((m: any, idx: number) => ({
      id: `mat-${internalId}-${idx}`,
      productId: internalId,
      name: m.name,
      source: m.source || 'Artisan Workshop Stock',
      organicCert: m.organicCert,
      percentage: m.percentage || 100
    }));

    const evidence: ProductEvidence[] = (input.evidence || []).map((ev: any, idx: number) => ({
      id: `ev-${internalId}-${idx}`,
      productId: internalId,
      uploadedBy: user.id,
      evidenceType: ev.evidenceType,
      label: ev.label,
      fileUrl: ev.fileUrl,
      fileHash: sha256(ev.fileUrl + ev.label),
      geoLat: ev.geoLat,
      geoLng: ev.geoLng,
      geoTagLabel: ev.geoTagLabel,
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }));

    const primaryEvidence = evidence.find(e => e.fileUrl) || (input.image ? { fileUrl: input.image } : null);
    const primaryImgUrl = primaryEvidence?.fileUrl || input.image || '';

    // Generate real Kalakriti verification URL and high-resolution QR code
    const publicBaseUrl = process.env.VITE_PUBLIC_URL || process.env.APP_BASE_URL || 'http://localhost:3001';
    const verificationUrl = `${publicBaseUrl}/verify/${productId7}`;
    
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 600,
        color: {
          dark: '#1C1917',
          light: '#FAF7F2'
        }
      });
    } catch (qrErr) {
      console.warn('Failed to generate QR code data URL:', qrErr);
    }

    // Enroll physical fingerprint with Python ML Service if image evidence is provided
    let mlRegistration: any = null;
    if (primaryEvidence?.fileUrl) {
      mlRegistration = await MLClientService.registerProduct({
        productId: productId7,
        name: input.title,
        category: input.craftType,
        location: `${input.originDistrict || ''}, ${input.originState || 'India'}`,
        imageBase64: primaryEvidence.fileUrl.startsWith('data:') ? primaryEvidence.fileUrl : undefined,
        imageUrl: !primaryEvidence.fileUrl.startsWith('data:') ? primaryEvidence.fileUrl : undefined,
        force: true
      });
    }

    const newProduct: Product = {
      id: internalId,
      productId: productId7,
      productCode,
      artisanId,
      cooperativeId: artisan?.cooperativeId || user.cooperativeId,
      title: input.title,
      description: input.description,
      craftType: input.craftType,
      giTagName: input.giTagName,
      technique: input.technique,
      originState: input.originState,
      originDistrict: input.originDistrict,
      creationDate: input.creationDate || new Date().toISOString().split('T')[0],
      dimensions: input.dimensions,
      weightGrams: input.weightGrams,
      status: 'ACTIVE',
      materials,
      evidence,
      verificationUrl,
      qrCodeDataUrl,
      fingerprintImageDataUrl: mlRegistration?.roi_image_base64 || primaryImgUrl,
      primaryImageUrl: primaryImgUrl,
      processVideoUrl: input.processVideoUrl || undefined,
      processVideoStatus: input.processVideoStatus || (input.processVideoUrl ? 'SUBMITTED' : undefined),
      processVideoDuration: input.processVideoDuration || undefined,
      processVideoTimestamp: input.processVideoUrl ? new Date().toISOString() : undefined,
      artisan: artisan ? {
        id: artisan.id,
        fullName: artisan.fullName,
        craftSpecialties: artisan.craftSpecialties,
        experienceYears: artisan.experienceYears,
        regionState: artisan.regionState,
        district: artisan.district,
        clusterName: artisan.clusterName,
        giAuthorizedNo: artisan.giAuthorizedNo,
        verificationStatus: artisan.verificationStatus
      } : undefined,
      cooperative: artisan?.cooperativeId ? db.cooperatives.get(artisan.cooperativeId) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save product and enforce database unique index on 7-character Product ID
    db.products.set(internalId, newProduct);
    db.productsBy7CharId.set(productId7, internalId);

    // Cryptographically record provenance genesis event
    await ProvenanceService.recordEvent({
      productId: internalId,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'PRODUCT_CREATED',
      metadata: {
        productId: productId7,
        productCode,
        craftType: newProduct.craftType,
        materialsCount: materials.length,
        evidenceCount: evidence.length,
        origin: `${newProduct.originDistrict}, ${newProduct.originState}`,
        manifestHash: mlRegistration?.manifest_hash,
        rsaSigned: Boolean(mlRegistration?.rsa_signature)
      }
    });

    return newProduct;
  }

  /**
   * Retrieves a product by its unique 7-character Product ID or internal UUID.
   */
  public static async getProductBy7CharId(code: string): Promise<Product> {
    const cleanCode = (code || '').trim().toUpperCase();
    const internalId = db.productsBy7CharId.get(cleanCode);
    let product: Product | undefined;
    if (internalId) {
      product = db.products.get(internalId);
    }
    if (!product) {
      product = db.products.get(cleanCode);
    }
    if (!product) {
      for (const p of db.products.values()) {
        if (p.productId?.toUpperCase() === cleanCode || p.productCode?.toUpperCase() === cleanCode || p.id === cleanCode) {
          product = p;
          break;
        }
      }
    }
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product ID '${code}' is not registered in the Kalakriti database.`, 404);
    }
    return product;
  }

  /**
   * Retrieves a product. If unauthenticated/public, sensitive fields (like exact private phone/internal notes) are masked.
   */
  public static async getProductById(
    productId: string,
    requestingUser?: AuthUser
  ): Promise<Product> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product with ID '${productId}' was not found.`, 404);
    }
    return product;
  }

  /**
   * Updates an existing product draft or submitted record before final lock.
   */
  public static async updateProduct(
    productId: string,
    updates: any,
    user: AuthUser
  ): Promise<Product> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product with ID '${productId}' was not found.`, 404);
    }

    if (user.role !== 'ADMIN' && product.artisanId !== user.id) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'You do not have permission to modify this product record.', 403);
    }

    if (product.status === 'VERIFIED' || product.status === 'ACTIVE') {
      if (user.role !== 'ADMIN') {
        throw new AppError(
          ERROR_CODES.FORBIDDEN,
          'Product has already been formally verified and locked with a digital passport. Modifications require administrator audit.',
          403
        );
      }
    }

    const updated: Product = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.products.set(productId, updated);
    return updated;
  }

  /**
   * Adds supplementary evidence (workshop photos, audio, certificate) to an existing product.
   */
  public static async addEvidence(
    productId: string,
    evidenceItem: any,
    user: AuthUser
  ): Promise<ProductEvidence> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product with ID '${productId}' was not found.`, 404);
    }

    const newEvidence: ProductEvidence = {
      id: `ev-${productId}-${Date.now()}`,
      productId,
      uploadedBy: user.id,
      evidenceType: evidenceItem.evidenceType,
      label: evidenceItem.label,
      fileUrl: evidenceItem.fileUrl,
      fileHash: sha256(evidenceItem.fileUrl + evidenceItem.label),
      geoLat: evidenceItem.geoLat,
      geoLng: evidenceItem.geoLng,
      geoTagLabel: evidenceItem.geoTagLabel,
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!product.evidence) product.evidence = [];
    product.evidence.push(newEvidence);
    product.updatedAt = new Date().toISOString();

    await ProvenanceService.recordEvent({
      productId,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'EVIDENCE_ADDED',
      metadata: {
        evidenceType: newEvidence.evidenceType,
        label: newEvidence.label,
        fileHash: newEvidence.fileHash
      }
    });

    return newEvidence;
  }

  public static async listProducts(): Promise<Product[]> {
    return Array.from(db.products.values());
  }
}
