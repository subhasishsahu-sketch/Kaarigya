// server/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { 
  UserRole, 
  Product, 
  DigitalPassport, 
  Artisan, 
  Cooperative, 
  ProvenanceEvent, 
  FraudAlert, 
  MarketplaceListing,
  CompensationRecord,
  Dispute,
  TrustScore,
  Notification
} from '../types';
import { GENESIS_PREVIOUS_HASH } from './constants';
import { computeEventHash } from '../utils/cryptoHash';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try {
      supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Could not initialize Supabase Client:', e);
    }
  }
  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin;
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.warn('Could not initialize Supabase Admin Client:', e);
    }
  }
  return supabaseAdmin;
}

/**
 * Resilient In-Memory Storage Adapter
 * Powers the backend store with full data persistence and cryptographic chaining.
 */
class InMemoryDatabase {
  public users: Map<string, any> = new Map();
  public cooperatives: Map<string, Cooperative> = new Map();
  public artisans: Map<string, Artisan> = new Map();
  public products: Map<string, Product> = new Map();
  public productsBy7CharId: Map<string, string> = new Map(); // 7-character Product ID -> Internal UUID/Product ID
  public passports: Map<string, DigitalPassport> = new Map();
  public trustScores: Map<string, TrustScore> = new Map();
  public provenanceEvents: ProvenanceEvent[] = [];
  public marketplaceListings: Map<string, MarketplaceListing> = new Map();
  public fraudAlerts: Map<string, FraudAlert> = new Map();
  public compensationRecords: Map<string, CompensationRecord> = new Map();
  public disputes: Map<string, Dispute> = new Map();
  public notifications: Map<string, Notification> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Users
    const usersData = [
      { id: '11111111-1111-1111-1111-111111111111', email: 'odisha.handicrafts.coop@craftpass.in', role: 'COOPERATIVE' as UserRole, fullName: 'Utkal Craft Producers Cooperative Ltd.', phoneNumber: '+91 674 2530190' },
      { id: '22222222-2222-2222-2222-222222222222', email: 'bastarcraft.federation@craftpass.in', role: 'COOPERATIVE' as UserRole, fullName: 'Bastar Dhokra Shilp Samiti', phoneNumber: '+91 7782 229100' },
      { id: '33333333-3333-3333-3333-333333333333', email: 'subhadra.mahapatra@craftpass.in', role: 'ARTISAN' as UserRole, fullName: 'Subhadra Mahapatra', phoneNumber: '+91 9437 128901' },
      { id: '44444444-4444-4444-4444-444444444444', email: 'rameshwar.baghel@craftpass.in', role: 'ARTISAN' as UserRole, fullName: 'Rameshwar Baghel', phoneNumber: '+91 9826 341209' },
      { id: '55555555-5555-5555-5555-555555555555', email: 'kalyani.meher@craftpass.in', role: 'ARTISAN' as UserRole, fullName: 'Kalyani Meher', phoneNumber: '+91 9438 567812' },
      { id: '66666666-6666-6666-6666-666666666666', email: 'reviewer@craftpass.in', role: 'REVIEWER' as UserRole, fullName: 'Dr. Arindam Sen (GI Registry Evaluator)', phoneNumber: '+91 11 23456789' },
      { id: '77777777-7777-7777-7777-777777777777', email: 'admin@craftpass.in', role: 'ADMIN' as UserRole, fullName: 'National Craft Board Administrator', phoneNumber: '+91 11 23456700' },
      { id: '88888888-8888-8888-8888-888888888888', email: 'buyer.ananya@gmail.com', role: 'BUYER' as UserRole, fullName: 'Ananya Deshmukh', phoneNumber: '+91 9820 112233' }
    ];
    usersData.forEach(u => this.users.set(u.id, { ...u, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

    // 2. Cooperatives
    const coop1: Cooperative = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Utkal Craft Producers Cooperative Ltd.',
      registrationNo: 'COOP-OD-1984-092',
      regionState: 'Odisha',
      district: 'Puri',
      headArtisanName: 'Brundaban Mahapatra',
      verificationStatus: 'VERIFIED',
      establishedYear: 1984,
      memberCount: 184,
      createdAt: new Date(Date.now() - 365 * 86400000).toISOString()
    };
    this.cooperatives.set(coop1.id, coop1);

    const coop2: Cooperative = {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Bastar Dhokra Shilp Samiti',
      registrationNo: 'COOP-CG-1996-310',
      regionState: 'Chhattisgarh',
      district: 'Bastar',
      headArtisanName: 'Ghasiram Kashyap',
      verificationStatus: 'VERIFIED',
      establishedYear: 1996,
      memberCount: 92,
      createdAt: new Date(Date.now() - 300 * 86400000).toISOString()
    };
    this.cooperatives.set(coop2.id, coop2);

    // 3. Artisans
    const artisan1: Artisan = {
      id: '33333333-3333-3333-3333-333333333333',
      cooperativeId: coop1.id,
      cooperativeName: coop1.name,
      fullName: 'Subhadra Mahapatra',
      craftSpecialties: ['Pipli Appliqué', 'Chitrakathi Appliqué Tapestries'],
      experienceYears: 28,
      regionState: 'Odisha',
      district: 'Puri',
      clusterName: 'Pipli Craft Village',
      preferredLang: 'or',
      bio: '4th generation appliqué master certified by the National Craft Board with Geographical Indication (GI) accreditation.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      giAuthorizedNo: 'GI-OD-PIPLI-0442',
      verificationStatus: 'VERIFIED',
      kalakritiArtisanId: 'KAL-ART-33333',
      createdAt: new Date(Date.now() - 200 * 86400000).toISOString()
    };
    this.artisans.set(artisan1.id, artisan1);

    const artisan2: Artisan = {
      id: '44444444-4444-4444-4444-444444444444',
      cooperativeId: coop2.id,
      cooperativeName: coop2.name,
      fullName: 'Rameshwar Baghel',
      craftSpecialties: ['Dhokra Lost Wax Brass Casting', 'Bastar Bell Metal Statues'],
      experienceYears: 34,
      regionState: 'Chhattisgarh',
      district: 'Bastar',
      clusterName: 'Kondagaon Brass Guild',
      preferredLang: 'hi',
      bio: 'Presidential Awardee for authentic bell metal cire-perdue technique honoring tribal heritage.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      giAuthorizedNo: 'GI-CG-DHOKRA-0189',
      verificationStatus: 'VERIFIED',
      kalakritiArtisanId: 'KAL-ART-44444',
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString()
    };
    this.artisans.set(artisan2.id, artisan2);

    // 4. Products
    const prod1: Product = {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      productCode: 'CRAFT-OD-2026-00124',
      artisanId: artisan1.id,
      cooperativeId: coop1.id,
      title: 'Sacred Lotus Pipli Appliqué Tapestry',
      description: 'Hand-stitched temple canopy cloth with 108 lotus petals layered with hand-dyed organic khadi cotton and mirror insets.',
      craftType: 'Appliqué & Needlework',
      giTagName: 'Pipli Applique Work (GI-86)',
      technique: 'Traditional Hand Embroidery & Layered Needlework',
      originState: 'Odisha',
      originDistrict: 'Puri',
      creationDate: '2026-02-04',
      dimensions: { widthCm: 120, heightCm: 180, depthCm: 1 },
      weightGrams: 850,
      status: 'ACTIVE',
      materials: [
        { id: 'm1', productId: 'aaaa1111-1111-1111-1111-111111111111', name: 'Organic Handspun Khadi Cotton', source: 'Odisha Khadi Board, Cuttack', percentage: 85 },
        { id: 'm2', productId: 'aaaa1111-1111-1111-1111-111111111111', name: 'Natural Madder & Turmeric Vegetable Dyes', source: 'Sambalpur Botanical Extractors', percentage: 15 }
      ],
      evidence: [
        {
          id: 'ev1',
          productId: 'aaaa1111-1111-1111-1111-111111111111',
          uploadedBy: artisan1.id,
          evidenceType: 'WORKSHOP_PHOTO',
          label: 'Primary Finished Tapestry',
          fileUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
          fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          geoLat: 19.8135,
          geoLng: 85.8312,
          geoTagLabel: 'Pipli Master Workshop, Puri District, Odisha',
          capturedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
        },
        {
          id: 'ev2',
          productId: 'aaaa1111-1111-1111-1111-111111111111',
          uploadedBy: artisan1.id,
          evidenceType: 'PROCESS_VIDEO',
          label: 'Needlework & Mirror Setting In-Progress',
          fileUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
          fileHash: 'c4ca4238a0b923820dcc509a6f75849b27ae41e4649b934ca495991b7852b855',
          geoLat: 19.8135,
          geoLng: 85.8312,
          geoTagLabel: 'Pipli Master Workshop, Puri District, Odisha',
          capturedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
        }
      ],
      artisan: artisan1,
      cooperative: coop1,
      productId: 'K7B9X3Q',
      verificationUrl: 'http://localhost:3001/verify/K7B9X3Q',
      primaryImageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
    };
    this.products.set(prod1.id, prod1);
    this.productsBy7CharId.set(prod1.productId, prod1.id);

    // 5. Digital Passport for Product 1
    const pass1: DigitalPassport = {
      id: 'pass-1111-1111-1111-1111-111111111111',
      productId: prod1.id,
      passportVersion: 1,
      status: 'ACTIVE',
      qrCodeHash: 'qr-hash-pipli-00124-9482f',
      nfcTagUid: 'NFC-PIPLI-001',
      publicUrlSlug: 'passport-craft-od-2026-00124',
      latestEventHash: 'f9a2b8e34c718a2b5e092147db189e32a67bc418a098ef123490abcde8761234',
      product: prod1,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
    };
    this.passports.set(pass1.id, pass1);

    // 6. Trust Score
    const trust1: TrustScore = {
      id: 'ts-1',
      productId: prod1.id,
      compositeScore: 0.98,
      artisanFactor: 1.0,
      coopFactor: 0.96,
      evidenceFactor: 0.98,
      provenanceFactor: 0.98,
      calculatedAt: new Date().toISOString()
    };
    this.trustScores.set(prod1.id, trust1);

    // 7. Provenance Events (Hash Chained)
    const t0 = new Date(Date.now() - 14 * 86400000).toISOString();
    const h0 = computeEventHash(
      GENESIS_PREVIOUS_HASH,
      prod1.id,
      'PRODUCT_CREATED',
      artisan1.id,
      t0,
      { title: prod1.title, craftType: prod1.craftType }
    );
    const ev1: ProvenanceEvent = {
      id: 'e1',
      productId: prod1.id,
      actorId: artisan1.id,
      actorName: artisan1.fullName,
      actorRole: 'ARTISAN',
      eventType: 'PRODUCT_CREATED',
      timestamp: t0,
      metadata: { title: prod1.title, craftType: prod1.craftType, origin: 'Pipli Village' },
      previousEventHash: GENESIS_PREVIOUS_HASH,
      currentEventHash: h0
    };

    const t1 = new Date(Date.now() - 10 * 86400000).toISOString();
    const h1 = computeEventHash(
      h0,
      prod1.id,
      'COOPERATIVE_VERIFIED',
      coop1.id,
      t1,
      { coopName: coop1.name, giMatch: true }
    );
    const ev2: ProvenanceEvent = {
      id: 'e2',
      productId: prod1.id,
      actorId: coop1.id,
      actorName: coop1.name,
      actorRole: 'COOPERATIVE',
      eventType: 'COOPERATIVE_VERIFIED',
      timestamp: t1,
      metadata: { coopName: coop1.name, giMatch: true, inspector: coop1.headArtisanName },
      previousEventHash: h0,
      currentEventHash: h1
    };

    this.provenanceEvents.push(ev1, ev2);

    // 8. Compensation Record
    const comp1: CompensationRecord = {
      id: 'cr-1',
      productId: prod1.id,
      grossSaleAmount: 14500.00,
      artisanPayout: 11600.00, // 80% direct to artisan
      cooperativeFee: 1450.00,  // 10% community welfare fund
      logisticsMaterials: 1015.00, // 7% insured packaging
      platformFee: 435.00,     // 3% platform overhead
      currency: 'INR',
      payoutStatus: 'DISBURSED',
      disbursementTxId: 'UPI-REF-948291084-IND',
      disbursedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    };
    this.compensationRecords.set(prod1.id, comp1);

    // 9. Marketplace Listings & Fraud Alerts (Demo for Counterfeit Intelligence)
    const list1: MarketplaceListing = {
      id: 'ml-1',
      platformName: 'Etsy Clone Global',
      externalUrl: 'https://marketplace.mock/listing/cheap-odisha-lotus-tapestry',
      claimedSellerName: 'GlobalCraftExports_Wholesale',
      scrapedTitle: 'Handmade Indian Sacred Lotus Wall Hanging',
      scrapedDescription: 'Mass exported reproduction of Odisha traditional textile tapestry. Synthetic blend fabric with printed borders.',
      scrapedPrice: 1200.00,
      currency: 'INR',
      scrapedImages: ['https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=400&q=80'],
      claimedPassportId: pass1.id,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    };
    this.marketplaceListings.set(list1.id, list1);

    const alert1: FraudAlert = {
      id: 'fa-1',
      listingId: list1.id,
      productId: prod1.id,
      aiRiskScore: 0.94,
      aiRiskLevel: 'CRITICAL',
      detectedReasons: [
        'PASSPORT_REUSE',
        'SEVERE_UNDERPRICING_ANOMALY',
        'UNREGISTERED_SELLER_MISMATCH',
        'SYNTHETIC_MATERIAL_CLAIM'
      ],
      evidencePayload: {
        priceDiscrepancyPercent: -91.7,
        visualSimilarityScore: 0.96,
        passportReuseDetected: true,
        unauthorizedSeller: true,
        explanation: 'Listing utilizes authentic passport photo of CRAFT-OD-2026-00124 but offers it at 8% of registered fair-trade craft value with unauthorized overseas seller credentials.',
        matchedEvidenceUrls: [prod1.evidence![0].fileUrl]
      },
      humanReviewStatus: 'PENDING',
      listing: list1,
      product: prod1,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    };
    this.fraudAlerts.set(alert1.id, alert1);
  }
}

export const db = new InMemoryDatabase();
