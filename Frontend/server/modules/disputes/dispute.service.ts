// server/modules/disputes/dispute.service.ts
import { db } from '../../config/supabase';
import { Dispute, DisputeReason, AuthUser } from '../../types';
import { ProvenanceService } from '../provenance/provenance.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '../../config/constants';

export class DisputeService {
  /**
   * Lodges a formal dispute on a product authenticity claim or compensation violation.
   */
  public static async createDispute(
    input: {
      productId: string;
      reason: DisputeReason;
      description: string;
      evidenceUrls?: string[];
    },
    user: AuthUser
  ): Promise<Dispute> {
    const product = db.products.get(input.productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${input.productId}' not found.`, 404);
    }

    const disputeId = `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const dispute: Dispute = {
      id: disputeId,
      productId: input.productId,
      initiatorId: user.id,
      initiatorName: user.fullName,
      reason: input.reason,
      description: input.description,
      evidenceUrls: input.evidenceUrls || [],
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    db.disputes.set(disputeId, dispute);
    product.status = 'DISPUTED';

    await ProvenanceService.recordEvent({
      productId: input.productId,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'DISPUTE_CREATED',
      metadata: {
        disputeId,
        reason: input.reason,
        description: input.description
      }
    });

    return dispute;
  }

  public static async listDisputes(): Promise<Dispute[]> {
    return Array.from(db.disputes.values());
  }

  /**
   * Resolves an open dispute with authorized tribunal notes.
   */
  public static async resolveDispute(
    disputeId: string,
    input: {
      resolutionStatus: 'RESOLVED_VALID' | 'RESOLVED_REJECTED';
      notes: string;
    },
    resolver: AuthUser
  ): Promise<Dispute> {
    const dispute = db.disputes.get(disputeId);
    if (!dispute) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Dispute '${disputeId}' not found.`, 404);
    }

    dispute.status = input.resolutionStatus;
    dispute.resolutionNotes = input.notes;
    dispute.resolvedBy = resolver.id;
    dispute.resolvedAt = new Date().toISOString();

    const product = db.products.get(dispute.productId);
    if (product) {
      product.status = input.resolutionStatus === 'RESOLVED_VALID' ? 'ACTIVE' : 'DISPUTED';
    }

    await ProvenanceService.recordEvent({
      productId: dispute.productId,
      actorId: resolver.id,
      actorName: resolver.fullName,
      actorRole: resolver.role,
      eventType: 'DISPUTE_RESOLVED',
      metadata: {
        disputeId,
        resolutionStatus: input.resolutionStatus,
        notes: input.notes
      }
    });

    return dispute;
  }
}
