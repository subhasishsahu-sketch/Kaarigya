// server/modules/passports/passport.service.ts
import { db } from '../../config/supabase';
import { DigitalPassport, AuthUser } from '../../types';
import { ProvenanceService } from '../provenance/provenance.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '../../config/constants';
import { generatePassportSlug, generateQrHash } from '../../utils/cryptoHash';

export class PassportService {
  /**
   * Mints an official digital passport for an authenticated, verified craft product.
   */
  public static async issuePassport(
    productId: string,
    user: AuthUser,
    nfcTagUid?: string
  ): Promise<DigitalPassport> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' does not exist.`, 404);
    }

    const existingPassport = Array.from(db.passports.values()).find(p => p.productId === productId);
    if (existingPassport) {
      return existingPassport;
    }

    const passportId = `pass-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publicUrlSlug = generatePassportSlug(product.productCode, product.title);
    const qrCodeHash = generateQrHash(productId, publicUrlSlug);

    // Get latest event hash
    const provenance = await ProvenanceService.getProductProvenance(productId);
    const latestEventHash = provenance.events.length > 0
      ? provenance.events[provenance.events.length - 1].currentEventHash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const passport: DigitalPassport = {
      id: passportId,
      productId,
      passportVersion: 1,
      status: 'ACTIVE',
      qrCodeHash,
      nfcTagUid,
      publicUrlSlug,
      latestEventHash,
      product,
      trustScore: db.trustScores.get(productId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.passports.set(passportId, passport);

    // Update product status to ACTIVE / VERIFIED
    product.status = 'ACTIVE';
    product.updatedAt = new Date().toISOString();

    // Log provenance event
    await ProvenanceService.recordEvent({
      productId,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'PASSPORT_CREATED',
      metadata: {
        passportId,
        publicUrlSlug,
        qrCodeHash
      }
    });

    return passport;
  }

  /**
   * Resolves a public passport by ID or public slug.
   * Strips all private artisan identifiers, financial routing, and exact residential addresses.
   */
  public static async getPublicPassport(idOrSlug: string): Promise<{
    passport: Partial<DigitalPassport>;
    product: any;
    trustScore?: any;
    provenanceAudit: any;
  }> {
    let passport = db.passports.get(idOrSlug);
    if (!passport) {
      passport = Array.from(db.passports.values()).find(
        p => p.publicUrlSlug === idOrSlug || p.qrCodeHash === idOrSlug || p.productId === idOrSlug
      );
    }

    if (!passport) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Digital Passport not found or revoked.', 404);
    }

    const product = db.products.get(passport.productId);
    const provenanceAudit = await ProvenanceService.getProductProvenance(passport.productId);
    const trustScore = db.trustScores.get(passport.productId);

    // Public Safe View (Privacy protection)
    const publicArtisan = product?.artisan ? {
      fullName: product.artisan.fullName,
      craftSpecialties: product.artisan.craftSpecialties,
      experienceYears: product.artisan.experienceYears,
      clusterName: product.artisan.clusterName,
      regionState: product.artisan.regionState,
      district: product.artisan.district,
      giAuthorizedNo: product.artisan.giAuthorizedNo,
      verificationStatus: product.artisan.verificationStatus
    } : null;

    const publicCooperative = product?.cooperative ? {
      name: product.cooperative.name,
      registrationNo: product.cooperative.registrationNo,
      regionState: product.cooperative.regionState,
      district: product.cooperative.district,
      establishedYear: product.cooperative.establishedYear
    } : null;

    return {
      passport: {
        id: passport.id,
        productId: passport.productId,
        passportVersion: passport.passportVersion,
        status: passport.status,
        qrCodeHash: passport.qrCodeHash,
        publicUrlSlug: passport.publicUrlSlug,
        latestEventHash: passport.latestEventHash,
        createdAt: passport.createdAt
      },
      product: {
        ...product,
        artisan: publicArtisan,
        cooperative: publicCooperative
      },
      trustScore,
      provenanceAudit: {
        totalEvents: provenanceAudit.totalEvents,
        isChainValid: provenanceAudit.isChainValid,
        events: provenanceAudit.events.map(e => ({
          eventType: e.eventType,
          actorRole: e.actorRole,
          timestamp: e.timestamp,
          currentEventHash: e.currentEventHash
        }))
      }
    };
  }
}
