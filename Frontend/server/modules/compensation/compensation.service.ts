// server/modules/compensation/compensation.service.ts
import { db } from '../../config/supabase';
import { CompensationRecord, AuthUser } from '../../types';
import { ProvenanceService } from '../provenance/provenance.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '../../config/constants';

export class CompensationService {
  /**
   * Records a fair-trade transaction split for a sold craft product.
   */
  public static async recordSale(
    productId: string,
    input: {
      grossSaleAmount: number;
      artisanPayoutPercent?: number; // default 80%
      cooperativeFeePercent?: number; // default 10%
      logisticsMaterialsPercent?: number; // default 7%
      platformFeePercent?: number; // default 3%
      currency?: string;
      disbursementTxId?: string;
    },
    user: AuthUser
  ): Promise<CompensationRecord> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' not found.`, 404);
    }

    const gross = input.grossSaleAmount;
    const artPct = (input.artisanPayoutPercent ?? 80) / 100;
    const coopPct = (input.cooperativeFeePercent ?? 10) / 100;
    const logPct = (input.logisticsMaterialsPercent ?? 7) / 100;
    const platPct = (input.platformFeePercent ?? 3) / 100;

    const record: CompensationRecord = {
      id: `cr-${productId}`,
      productId,
      grossSaleAmount: gross,
      artisanPayout: Number((gross * artPct).toFixed(2)),
      cooperativeFee: Number((gross * coopPct).toFixed(2)),
      logisticsMaterials: Number((gross * logPct).toFixed(2)),
      platformFee: Number((gross * platPct).toFixed(2)),
      currency: input.currency || 'INR',
      payoutStatus: input.disbursementTxId ? 'DISBURSED' : 'ESCROWED',
      disbursementTxId: input.disbursementTxId,
      disbursedAt: input.disbursementTxId ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    db.compensationRecords.set(productId, record);
    product.status = 'SOLD';

    await ProvenanceService.recordEvent({
      productId,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'PRODUCT_SOLD',
      metadata: {
        grossSaleAmount: record.grossSaleAmount,
        artisanPayout: record.artisanPayout,
        cooperativeFee: record.cooperativeFee,
        payoutStatus: record.payoutStatus
      }
    });

    return record;
  }

  /**
   * Retrieves transparent compensation record for a craft product.
   */
  public static async getCompensation(productId: string): Promise<CompensationRecord> {
    const record = db.compensationRecords.get(productId);
    if (!record) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Compensation record for product '${productId}' was not found.`, 404);
    }
    return record;
  }
}
