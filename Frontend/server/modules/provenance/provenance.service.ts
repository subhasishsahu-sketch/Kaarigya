// server/modules/provenance/provenance.service.ts
import { db } from '../../config/supabase';
import { ProvenanceEvent, ProvenanceEventType, UserRole } from '../../types';
import { GENESIS_PREVIOUS_HASH } from '../../config/constants';
import { computeEventHash, verifyProvenanceChain } from '../../utils/cryptoHash';

export class ProvenanceService {
  /**
   * Appends an immutable cryptographic event to the product's provenance chain.
   */
  public static async recordEvent(params: {
    productId: string;
    actorId: string;
    actorName?: string;
    actorRole?: UserRole;
    eventType: ProvenanceEventType;
    metadata: Record<string, any>;
  }): Promise<ProvenanceEvent> {
    const { productId, actorId, actorName, actorRole, eventType, metadata } = params;

    // Get previous events for this product to find the latest hash
    const productEvents = db.provenanceEvents
      .filter(e => e.productId === productId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const previousEvent = productEvents.length > 0 ? productEvents[productEvents.length - 1] : null;
    const previousEventHash = previousEvent ? previousEvent.currentEventHash : GENESIS_PREVIOUS_HASH;

    const timestamp = new Date().toISOString();
    const currentEventHash = computeEventHash(
      previousEventHash,
      productId,
      eventType,
      actorId,
      timestamp,
      metadata
    );

    const event: ProvenanceEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId,
      actorId,
      actorName: actorName || 'Authorized System Entity',
      actorRole: actorRole || 'ADMIN',
      eventType,
      timestamp,
      metadata,
      previousEventHash,
      currentEventHash
    };

    db.provenanceEvents.push(event);

    // Update passport latestEventHash if passport exists
    const passport = Array.from(db.passports.values()).find(p => p.productId === productId);
    if (passport) {
      passport.latestEventHash = currentEventHash;
      passport.updatedAt = timestamp;
    }

    return event;
  }

  /**
   * Retrieves full chronological provenance events for a product and performs a cryptographic chain audit.
   */
  public static async getProductProvenance(productId: string): Promise<{
    productId: string;
    totalEvents: number;
    isChainValid: boolean;
    brokenIndex?: number;
    events: ProvenanceEvent[];
  }> {
    const events = db.provenanceEvents
      .filter(e => e.productId === productId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const audit = verifyProvenanceChain(events);

    return {
      productId,
      totalEvents: events.length,
      isChainValid: audit.isValid,
      brokenIndex: audit.brokenIndex,
      events
    };
  }
}
