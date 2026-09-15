// server/utils/cryptoHash.ts
import crypto from 'crypto';
import { GENESIS_PREVIOUS_HASH } from '../config/constants';
import { ProvenanceEvent } from '../types';

/**
 * Generates a standard SHA-256 hash from a string or object.
 */
export function sha256(data: string | object): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Computes a tamper-evident event hash chaining to the previous event hash.
 * currentEventHash = SHA256(previousEventHash + productId + eventType + actorId + timestamp + metadata)
 */
export function computeEventHash(
  previousHash: string,
  productId: string,
  eventType: string,
  actorId: string,
  timestamp: string,
  metadata: Record<string, any>
): string {
  const payload = `${previousHash}|${productId}|${eventType}|${actorId}|${timestamp}|${JSON.stringify(metadata)}`;
  return sha256(payload);
}

/**
 * Validates an array of provenance events from genesis to latest.
 * Returns true if the cryptographic chain is unbroken, or details on where it failed.
 */
export function verifyProvenanceChain(events: ProvenanceEvent[]): {
  isValid: boolean;
  brokenIndex?: number;
  expectedHash?: string;
  actualHash?: string;
} {
  if (!events || events.length === 0) {
    return { isValid: true };
  }

  let previousHash = GENESIS_PREVIOUS_HASH;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (event.previousEventHash !== previousHash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: previousHash,
        actualHash: event.previousEventHash
      };
    }

    const calculatedCurrentHash = computeEventHash(
      event.previousEventHash,
      event.productId,
      event.eventType,
      event.actorId,
      event.timestamp,
      event.metadata
    );

    if (calculatedCurrentHash !== event.currentEventHash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: calculatedCurrentHash,
        actualHash: event.currentEventHash
      };
    }

    previousHash = event.currentEventHash;
  }

  return { isValid: true };
}

/**
 * Generates a clean URL slug for a public passport.
 */
export function generatePassportSlug(productCode: string, title: string): string {
  const cleanCode = productCode.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `passport-${cleanCode}-${cleanTitle}-${randomSuffix}`;
}

/**
 * Generates a tamper-evident QR verification code hash.
 */
export function generateQrHash(productId: string, publicSlug: string): string {
  const salt = crypto.randomBytes(8).toString('hex');
  return sha256(`${productId}:${publicSlug}:${salt}:${Date.now()}`);
}
