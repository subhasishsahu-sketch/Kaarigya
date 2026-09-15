import { ProductPassport, ArtisanProfile, CounterfeitAlert, DisputeCase } from '../types';

export const mockArtisans: ArtisanProfile[] = [
  {
    id: "artisan-01",
    name: "Sita Devi Mahapatra",
    email: "subhadra.mahapatra@craftpass.in",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    title: "Master Appliqué & Needlework Artisan",
    bio: "Carrying forward a 4th generation heirloom tradition of Pipli Chandua craft. Sita specializes in sacred temple canopies, organic cotton patchwork, and natural mirror embroidery.",
    location: "Pipli Craft Village",
    district: "Puri",
    state: "Odisha",
    cooperativeName: "Utkalika State Handicraft Apex Co-op",
    cooperativeId: "COOP-OD-042",
    experienceYears: 28,
    craftTradition: "Pipli Appliqué (GI-Tagged Craft)",
    storyAudioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
    phone: "+91 98450 12384",
    verifiedAt: "2024-03-15",
    totalProducts: 24,
    totalPayouts: "₹3,84,000",
    rating: 4.95,
    kalakritiArtisanId: "KAL-ART-33333",
    verificationStatus: "VERIFIED"
  },
  {
    id: "artisan-02",
    name: "Ramesh Kumar Sahu",
    email: "rameshwar.baghel@craftpass.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    title: "National Awardee Dhokra Metallurgist",
    bio: "Practices 4,000-year-old non-ferrous lost-wax metal casting using beeswax cords, riverbed clay molds, and recycled brass scrap in open charcoal furnaces.",
    location: "Sadeibareni Artisan Hamlet",
    district: "Dhenkanal",
    state: "Odisha",
    cooperativeName: "Dhenkanal Bell Metal Artisans Society",
    cooperativeId: "COOP-OD-108",
    experienceYears: 34,
    craftTradition: "Dhokra Lost-Wax Bell Metal Casting",
    storyAudioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
    phone: "+91 94371 89201",
    verifiedAt: "2023-11-20",
    totalProducts: 42,
    totalPayouts: "₹6,15,000",
    rating: 5.0,
    kalakritiArtisanId: "KAL-ART-44444",
    verificationStatus: "VERIFIED"
  },
  {
    id: "artisan-03",
    name: "Anita Das & Weavers Collective",
    email: "anita.das@craftpass.in",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    title: "Master Handloom Bandha Weaver",
    bio: "Specializing in the mathematical tie-dye warp-weft precision of Sambalpuri double ikat. Each saree weaves poetry of Odia folklore with mulberry and tussar silk.",
    location: "Bargarh Weavers Colony",
    district: "Bargarh",
    state: "Odisha",
    cooperativeName: "Bargarh Handloom Weavers Apex",
    cooperativeId: "COOP-OD-019",
    experienceYears: 22,
    craftTradition: "Sambalpuri Bandha (GI-Tagged Silk)",
    storyAudioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
    phone: "+91 97780 44512",
    verifiedAt: "2024-01-10",
    totalProducts: 18,
    totalPayouts: "₹5,40,000",
    rating: 4.9,
    kalakritiArtisanId: "KAL-ART-55555",
    verificationStatus: "VERIFIED"
  },
  {
    id: "artisan-04",
    name: "Manjunath Gowda",
    email: "manjunath.gowda@craftpass.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    title: "Master Toy Craftsman & Natural Woodturner",
    bio: "Creating non-toxic Wrightia tinctoria (Aale Mara) ivory-wood toys dyed with turmeric, indigo, and kunkum using foot-powered lathes.",
    location: "Channapatna Craft Town",
    district: "Ramanagara",
    state: "Karnataka",
    cooperativeName: "Karnataka Artisans Craft Guild",
    cooperativeId: "COOP-KA-077",
    experienceYears: 19,
    craftTradition: "Channapatna Wooden Toys (GI-Tagged)",
    storyAudioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
    phone: "+91 99801 67234",
    verifiedAt: "2024-05-18",
    totalProducts: 31,
    totalPayouts: "₹2,90,000",
    rating: 4.85,
    kalakritiArtisanId: "KAL-ART-66666",
    verificationStatus: "VERIFIED"
  }
];

export const mockProducts: ProductPassport[] = [
  {
    id: "prod-001",
    productId: "CRAFT-00124",
    name: "Sacred Lotus Pipli Appliqué Tapestry",
    craftCategory: "Appliqué & Needlework",
    productType: "Handmade Wall Art Hanging",
    description: "An authentic Pipli Chandua art piece hand-stitched with 100% unbleached khadi cotton, brass mirror embellishments, and traditional floral borders symbolizing auspicious prosperity.",
    artisan: mockArtisans[0],
    materials: [
      "Organic Handspun Khadi Cotton",
      "Traditional Shisha (Convex Glass Mirrors)",
      "Natural Madder Root & Indigo Dyes",
      "Pure Cotton Twisted Thread"
    ],
    techniques: [
      "Traditional Bakhia & Taropa Needlework",
      "Hand-Cut Motif Layering (Chandua)",
      "Mirror Encasing Stitch",
      "Hand-Finished Braided Border"
    ],
    creationDate: "2026-08-12",
    productionDuration: "3 Days (24 Craft Hours)",
    price: {
      retail: 5000,
      artisanCompensation: 3250, // 65%
      cooperativeShare: 750,     // 15%
      rawMaterialsLogistics: 1000, // 20%
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [
      {
        id: "ev-1",
        url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
        category: "finished",
        label: "Finished Tapestry with Inspection Seal",
        timestamp: "12 Aug 2026, 16:30 IST",
        geoTag: "19.9850° N, 85.8340° E (Pipli Cluster)",
        hash: "sha256:4f8e91a2d48c3b7a12e879fbc..."
      },
      {
        id: "ev-2",
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        category: "artisan_with_product",
        label: "Sita Devi with In-Progress Appliqué",
        timestamp: "11 Aug 2026, 11:15 IST",
        geoTag: "Pipli Workshop Hall #3",
        hash: "sha256:7b2c99a8e0f1d3e4..."
      },
      {
        id: "ev-3",
        url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80",
        category: "craft_process",
        label: "Precision Scissor Cutting of Lotus Petal Canvas",
        timestamp: "10 Aug 2026, 14:00 IST",
        geoTag: "Pipli Workshop Hall #3"
      },
      {
        id: "ev-4",
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
        category: "makers_mark",
        label: "Hand-Stitched Micro Maker Sign on Back Hem",
        timestamp: "12 Aug 2026, 15:45 IST"
      }
    ],
    careInstructions: [
      "Dry clean or spot clean gently with lukewarm water only",
      "Do not machine wash or soak for extended periods",
      "Iron on reverse side using low-to-medium heat setting",
      "Keep away from continuous harsh direct sunlight to preserve natural dyes"
    ],
    trustLevel: {
      score: 4.8,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-1",
          label: "Artisan Identity Verified",
          verified: true,
          description: "Sita Devi identity & craft guild membership authenticated via Utkalika Apex KYC.",
          evidenceType: "Biometric & Artisan Guild ID #OD-ART-8821",
          authority: "Handicrafts Dept, Govt of Odisha"
        },
        {
          id: "tf-2",
          label: "Cooperative Validation Complete",
          verified: true,
          description: "Utkalika State Cooperative field inspector physically logged batch creation.",
          evidenceType: "Inspector Signoff (Ref: INSP-2026-891)",
          authority: "Utkalika Apex Society"
        },
        {
          id: "tf-3",
          label: "Tamper-Evident Passport Cryptographically Sealed",
          verified: true,
          description: "Immutable digital passport hash anchored to decentralized provenance ledger.",
          evidenceType: "SHA-256 State Root #7e29b19...f3",
          authority: "National Handicraft Trust Network"
        },
        {
          id: "tf-4",
          label: "Geo-Tagged Workshop Evidence",
          verified: true,
          description: "Creation timestamp and camera GPS metadata match Pipli craft cluster bounds.",
          evidenceType: "GPS Coordinates 19.9850° N, 85.8340° E",
          authority: "Geographic Indication Registry"
        },
        {
          id: "tf-5",
          label: "Fair Compensation Audit",
          verified: true,
          description: "₹3,250 (65%) direct bank remittance escrow earmarked to Sita Devi upon sale.",
          evidenceType: "UPI / PFMS Remittance Contract",
          authority: "Fair Craft Federation"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 94,
      status: "LIKELY_MATCH",
      patternMatch: true,
      makerMarkDetected: true,
      evidenceConsistency: true,
      notes: "Computer vision comparison between buyer capture and passport evidence indicates high statistical correlation in petal symmetry, thread density, and signature maker's back stitch."
    },
    provenanceTimeline: [
      {
        id: "pt-1",
        date: "10 Aug 2026",
        timestamp: "09:30 AM",
        title: "Raw Material Selection & Blessing",
        actor: "Sita Devi Mahapatra",
        role: "Master Artisan",
        location: "Pipli, Odisha",
        status: "completed",
        txRef: "TX-RAW-00124",
        description: "Pure khadi cotton and madder dyes procured through certified cooperative raw material bank."
      },
      {
        id: "pt-2",
        date: "12 Aug 2026",
        timestamp: "04:30 PM",
        title: "Craft Completion & Evidence Registration",
        actor: "Sita Devi Mahapatra",
        role: "Artisan",
        location: "Pipli Cluster Workshop",
        status: "completed",
        txRef: "TX-REG-00124",
        description: "Product completed, high-resolution evidence captured with voice narrative in Odia."
      },
      {
        id: "pt-3",
        date: "13 Aug 2026",
        timestamp: "11:00 AM",
        title: "Cooperative Quality & Fair Wage Verification",
        actor: "Bipin Nayak (Lead Auditor)",
        role: "Cooperative Inspector",
        location: "Utkalika Regional Office, Bhubaneswar",
        status: "completed",
        txRef: "TX-AUD-00124",
        description: "Physical inspection passed. ₹3,250 minimum artisan wage floor locked in escrow."
      },
      {
        id: "pt-4",
        date: "14 Aug 2026",
        timestamp: "02:15 PM",
        title: "Digital Product Passport Issued & QR Tagged",
        actor: "Kalakriti Protocol",
        role: "Registry Node",
        location: "Decentralized Registry",
        status: "completed",
        txRef: "TX-PASSPORT-00124",
        description: "Cryptographic QR/NFC identity CRAFT-00124 generated and affixed to tamper-evident craft tag."
      },
      {
        id: "pt-5",
        date: "16 Aug 2026",
        timestamp: "03:45 PM",
        title: "Authenticity Scanned by Buyer",
        actor: "Public Consumer / Buyer",
        role: "Buyer",
        location: "Verified in New Delhi, India",
        status: "completed",
        txRef: "TX-VERIFY-00124",
        description: "Buyer authenticated physical piece via NFC tag and camera physical match analyzer."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00124",
    nfcUid: "04:A2:89:1F:B3:7C:80",
    status: "verified",
    creationLocation: {
      latitude: 19.9850,
      longitude: 85.8340,
      accuracy: 15,
      timestamp: "12 Aug 2026, 16:30 IST",
      address: "Craft Workshop #3, Appliqué Village, Pipli, Odisha 752104",
      isSimulated: true
    },
    publicLocation: {
      city: "Pipli",
      district: "Puri",
      state: "Odisha",
      country: "India",
      approximateArea: "Pipli Craft Cluster, Puri District",
      clusterName: "Pipli Appliqué Heritage Cluster"
    },
    locationConsistency: "consistent",
    verificationHistory: [
      {
        id: "vh-1",
        date: "13 Aug 2026",
        reviewer: "Bipin Nayak (Utkalika)",
        action: "APPROVED_VERIFIED",
        notes: "Flawless mirror binding and traditional petal cut. Material authenticity verified."
      }
    ]
  },
  {
    id: "prod-002",
    productId: "CRAFT-00125",
    name: "Ancient Dhenkanal Tribal Dhokra Dancing Trio",
    craftCategory: "Metalwork & Lost-Wax Casting",
    productType: "Handmade Bell Metal Sculpture",
    description: "Centuries-old lost-wax cast sculpture made with natural beeswax coils, clay loam molds, and melted recycled bell metal (kansa). Depicts ancestral Santhal ritual dancers in rhythm.",
    artisan: mockArtisans[1],
    materials: [
      "Recycled Bell Metal / Brass Alloy (Kansa)",
      "Forest Beehive Wax (Moum)",
      "River Mahanadi Alluvial Clay",
      "Rice Husk & Jute Binding Core"
    ],
    techniques: [
      "Traditional Lost-Wax Casting (Cire Perdue)",
      "Hand-Rolled Wax Wire Detailing",
      "Open Pit Clay-Charcoal Fired Annealing",
      "Manual Chisel Deburring & Herbal Patina"
    ],
    creationDate: "2026-08-08",
    productionDuration: "7 Days (56 Craft Hours)",
    price: {
      retail: 7800,
      artisanCompensation: 5200, // 66.6%
      cooperativeShare: 1100,
      rawMaterialsLogistics: 1500,
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [
      {
        id: "ev-201",
        url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
        category: "finished",
        label: "Polished Dhokra Figurine with Stamp",
        timestamp: "08 Aug 2026, 17:00 IST",
        geoTag: "Sadeibareni Dhokra Village"
      },
      {
        id: "ev-202",
        url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
        category: "artisan_with_product",
        label: "Ramesh Kumar with Mold at Hearth",
        timestamp: "06 Aug 2026, 08:30 IST"
      }
    ],
    careInstructions: [
      "Wipe gently with a clean, dry micro-fiber cloth",
      "Never use harsh chemical metal polish or acidic cleansers",
      "Natural brass patina will mature gracefully over decades",
      "Keep dry and avoid water stagnation"
    ],
    trustLevel: {
      score: 5.0,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-21",
          label: "Master Metallurgist Identity Confirmed",
          verified: true,
          description: "Ramesh Kumar Sahu holds National Master Craftsperson credentials.",
          evidenceType: "National Awardee Registry #OD-DH-09",
          authority: "Development Commissioner (Handicrafts), Ministry of Textiles"
        },
        {
          id: "tf-22",
          label: "Non-Industrial Metallurgy Verified",
          verified: true,
          description: "XRF spectrometry analysis shows absence of industrial mold lines.",
          evidenceType: "Alloy Composition & Artisan Guild Tag",
          authority: "Dhenkanal Bell Metal Society"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 96,
      status: "LIKELY_MATCH",
      patternMatch: true,
      makerMarkDetected: true,
      evidenceConsistency: true,
      notes: "Cire perdue individual wax coil striations match high-magnification registered artisan evidence."
    },
    provenanceTimeline: [
      {
        id: "pt-201",
        date: "02 Aug 2026",
        timestamp: "07:00 AM",
        title: "Wax Model Sculpting & Wire Rolling",
        actor: "Ramesh Kumar Sahu",
        role: "Master Artisan",
        location: "Dhenkanal, Odisha",
        status: "completed",
        description: "Hand-rolled beeswax coils shaped around core clay torso."
      },
      {
        id: "pt-202",
        date: "08 Aug 2026",
        timestamp: "05:00 PM",
        title: "Brazier Kiln Casting & Breakout",
        actor: "Ramesh Kumar Sahu",
        role: "Master Artisan",
        location: "Sadeibareni Workshop",
        status: "completed",
        description: "Brass melted and poured into lost-wax mold."
      },
      {
        id: "pt-203",
        date: "10 Aug 2026",
        timestamp: "10:30 AM",
        title: "Cooperative Verification & Tagging",
        actor: "Dhenkanal Bell Metal Society",
        role: "Cooperative",
        location: "Dhenkanal Cluster",
        status: "completed",
        description: "Passed inspection, recorded on Kalakriti registry."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00125",
    nfcUid: "04:B4:72:2A:44:91:80",
    status: "verified",
    creationLocation: {
      latitude: 20.6628,
      longitude: 85.5960,
      accuracy: 20,
      timestamp: "08 Aug 2026, 17:00 IST",
      address: "Sadeibareni Dhokra Village, Dhenkanal, Odisha",
      isSimulated: true
    },
    publicLocation: {
      city: "Dhenkanal",
      district: "Dhenkanal",
      state: "Odisha",
      country: "India",
      approximateArea: "Sadeibareni Dhokra Cluster, Dhenkanal",
      clusterName: "Dhenkanal Lost-Wax Bell Metal Hub"
    },
    locationConsistency: "consistent",
    verificationHistory: [
      {
        id: "vh-21",
        date: "10 Aug 2026",
        reviewer: "Kailash Mishra (Dhenkanal Guild)",
        action: "APPROVED_VERIFIED",
        notes: "Exemplary craft quality. Authentic lost-wax technique confirmed."
      }
    ]
  },
  {
    id: "prod-003",
    productId: "CRAFT-00126",
    name: "Sambalpuri Bandha Pure Mulberry Silk Saree",
    craftCategory: "Handloom Weaving & Ikat",
    productType: "GI-Tagged Handloom Saree",
    description: "An authentic Sambalpuri Bandhakala saree woven on traditional pit looms. Features intricate 'Maa Samaleswari' and conch shell warp-weft tie-dye motifs.",
    artisan: mockArtisans[2],
    materials: [
      "100% Certified Mulberry Raw Silk (Tassar & Resham)",
      "Azo-Free Natural Vegetable Dyes",
      "Pure Zari Border Threads"
    ],
    techniques: [
      "Double Ikat Bandha (Warp & Weft Tie-Dye)",
      "Traditional Pit Loom Hand Weaving",
      "Mathematical Graph Calculation for Motifs",
      "Temple Border Hand Interlocking"
    ],
    creationDate: "2026-08-01",
    productionDuration: "14 Days (112 Craft Hours)",
    price: {
      retail: 16500,
      artisanCompensation: 11000, // 66.6%
      cooperativeShare: 2500,
      rawMaterialsLogistics: 3000,
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [
      {
        id: "ev-301",
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        category: "finished",
        label: "Completed Saree Pallu Spread",
        timestamp: "01 Aug 2026, 18:00 IST",
        geoTag: "Bargarh Weavers Guild"
      }
    ],
    careInstructions: [
      "Pure silk requires professional dry cleaning only",
      "Store wrapped in breathable white cotton cloth",
      "Refold periodically every 3-4 months to avoid crease wear",
      "Keep away from plastic packaging and mothballs"
    ],
    trustLevel: {
      score: 4.9,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-31",
          label: "Silk Mark & GI Tag Verified",
          verified: true,
          description: "Certified by Silk Mark Organisation of India and GI Registry #GI-19.",
          evidenceType: "Silk Mark Hologram #SM-2026-9901",
          authority: "Central Silk Board"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 92,
      status: "LIKELY_MATCH",
      patternMatch: true,
      makerMarkDetected: true,
      evidenceConsistency: true,
      notes: "Warp and weft ikat tie-bleed characteristics match the authentic hand-tied profile."
    },
    provenanceTimeline: [
      {
        id: "pt-301",
        date: "18 Jul 2026",
        timestamp: "08:00 AM",
        title: "Bandha Tie-Dye Binding",
        actor: "Anita Das",
        role: "Weaver",
        location: "Bargarh, Odisha",
        status: "completed",
        description: "Tying rubber bands onto raw silk yarns prior to color baths."
      },
      {
        id: "pt-302",
        date: "01 Aug 2026",
        timestamp: "06:00 PM",
        title: "Pit Loom Weaving Completed",
        actor: "Anita Das & Collective",
        role: "Weaver",
        location: "Bargarh Cluster",
        status: "completed",
        description: "14 days of meticulous handloom weaving completed."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00126",
    nfcUid: "04:C8:19:3D:52:10:80",
    status: "verified",
    creationLocation: {
      latitude: 21.3340,
      longitude: 83.6180,
      accuracy: 25,
      timestamp: "01 Aug 2026, 18:00 IST",
      address: "Bargarh Weavers Cooperative Guild, Odisha",
      isSimulated: true
    },
    publicLocation: {
      city: "Bargarh",
      district: "Bargarh",
      state: "Odisha",
      country: "India",
      approximateArea: "Bargarh Handloom Cluster",
      clusterName: "Sambalpuri Silk Handloom Apex"
    },
    locationConsistency: "consistent",
    verificationHistory: [
      {
        id: "vh-31",
        date: "03 Aug 2026",
        reviewer: "Sanjeev Rath (Bargarh Apex)",
        action: "APPROVED_VERIFIED",
        notes: "Superb double ikat symmetry. Saree authenticated for export."
      }
    ]
  },
  {
    id: "prod-004",
    productId: "CRAFT-00127",
    name: "Natural Ivory-Wood Channapatna Stacking Forest",
    craftCategory: "Woodcraft & Natural Lacquer",
    productType: "Non-Toxic Child Safe Educational Toy",
    description: "Turned on foot lathes from seasoned Wrightia tinctoria (Aale Mara) wood and glazed with hot melted vegetable lacquer derived from turmeric, indigo, and kunkum.",
    artisan: mockArtisans[3],
    materials: [
      "Wrightia Tinctoria (Seasoned Aale Mara Ivory-Wood)",
      "Natural Tree Resin Lacquer (Non-toxic)",
      "Natural Plant Colorants (Turmeric Yellow, Indigo Blue, Kunkum Red)"
    ],
    techniques: [
      "High-Speed Wood Lathe Turning",
      "Friction Heat Natural Lacquer Stick Glazing",
      "Screw-Threadless Interlocking Architecture"
    ],
    creationDate: "2026-08-14",
    productionDuration: "1.5 Days (12 Craft Hours)",
    price: {
      retail: 1850,
      artisanCompensation: 1200,
      cooperativeShare: 350,
      rawMaterialsLogistics: 300,
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [
      {
        id: "ev-401",
        url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
        category: "finished",
        label: "Finished Lacquered Stacking Rings",
        timestamp: "14 Aug 2026, 12:00 IST"
      }
    ],
    careInstructions: [
      "Wipe clean with a damp cloth, do not submerge in water",
      "Store in a dry shaded environment",
      "Natural lacquer shine can be buffed with a drop of coconut oil on cotton"
    ],
    trustLevel: {
      score: 4.7,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-41",
          label: "Channapatna GI Registration Validated",
          verified: true,
          description: "Registered under Geographical Indication of Goods Act #GI-23.",
          evidenceType: "GI Seal Tag #KA-CP-4402",
          authority: "Karnataka Artisans Guild"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 90,
      status: "LIKELY_MATCH",
      patternMatch: true,
      makerMarkDetected: true,
      evidenceConsistency: true,
      notes: "Lathe ring groove depth and vegetable dye luster correlate with certified craft batch."
    },
    provenanceTimeline: [
      {
        id: "pt-401",
        date: "13 Aug 2026",
        timestamp: "09:00 AM",
        title: "Wood Seasoning & Lathe Turn",
        actor: "Manjunath Gowda",
        role: "Toy Artisan",
        location: "Channapatna, Karnataka",
        status: "completed",
        description: "Turned wood on lathe and buffed with lac sticks."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00127",
    nfcUid: "04:E2:33:41:88:99:80",
    status: "verified",
    creationLocation: {
      latitude: 12.6518,
      longitude: 77.2089,
      accuracy: 15,
      timestamp: "14 Aug 2026, 12:00 IST",
      address: "Toy Town Artisan Street, Channapatna, Karnataka",
      isSimulated: true
    },
    publicLocation: {
      city: "Channapatna",
      district: "Ramanagara",
      state: "Karnataka",
      country: "India",
      approximateArea: "Channapatna Toy Cluster",
      clusterName: "Channapatna Lacquerware Guild"
    },
    locationConsistency: "consistent",
    verificationHistory: []
  },
  {
    id: "prod-005",
    productId: "CRAFT-00128",
    name: "Madhubani Tree of Life Mithila Folk Painting",
    craftCategory: "Folk Painting & Natural Inks",
    productType: "Hand-Painted Canvas Scroll",
    description: "Drawn with bamboo twigs, nib-pens, and fingers using pigments extracted from crushed hibiscus, soot, and bilva leaves on handmade acid-free paper.",
    artisan: {
      ...mockArtisans[0],
      name: "Radha Jha",
      title: "Mithila Kohbar & Bharni Artist",
      location: "Ranti Village, Madhubani",
      district: "Madhubani",
      state: "Bihar",
      cooperativeName: "Mithila Artisans Kalyan Sangh",
      craftTradition: "Madhubani Painting (GI-Tagged)"
    },
    materials: [
      "Handmade Cotton Rag Parchment Paper",
      "Soot Lamp Black & Turmeric Yellow Inks",
      "Crushed Hibiscus & Green Bean Leaf Extracts"
    ],
    techniques: [
      "Bamboo Twig Pen Linework (Kachni)",
      "Finger-Dipped Color Filling (Bharni)",
      "Traditional Double-Border Sacred Geometry"
    ],
    creationDate: "2026-08-16",
    productionDuration: "4 Days",
    price: {
      retail: 4200,
      artisanCompensation: 2800,
      cooperativeShare: 600,
      rawMaterialsLogistics: 800,
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [
      {
        id: "ev-501",
        url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
        category: "finished",
        label: "Canvas with Natural Pigments Ready for Inspection",
        timestamp: "16 Aug 2026, 11:00 IST"
      }
    ],
    careInstructions: [
      "Keep framed behind UV-protective glass",
      "Avoid moisture and damp wall placement"
    ],
    trustLevel: {
      score: 3.2,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-51",
          label: "Artisan Identity Awaiting Final Biometric Signoff",
          verified: true,
          description: "Radha Jha registered profile verified.",
          evidenceType: "Artisan ID Card",
          authority: "Mithila Sangh"
        },
        {
          id: "tf-52",
          label: "Cooperative Physical Inspection In-Queue",
          verified: false,
          description: "Field auditor scheduled for onsite batch signoff.",
          evidenceType: "Queue ID #VER-2026-991",
          authority: "Utkalika / Mithila Hub"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 82,
      status: "INCONCLUSIVE",
      patternMatch: true,
      makerMarkDetected: false,
      evidenceConsistency: true,
      notes: "Linework matches artisan style, awaiting physical inspection stamp."
    },
    provenanceTimeline: [
      {
        id: "pt-501",
        date: "16 Aug 2026",
        timestamp: "10:00 AM",
        title: "Product Passport Drafted by Artisan",
        actor: "Radha Jha",
        role: "Artisan",
        location: "Madhubani, Bihar",
        status: "in_progress",
        description: "Registered using voice assistant and mobile photo evidence."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00128",
    nfcUid: "04:F1:00:22:76:88:80",
    status: "pending",
    creationLocation: {
      latitude: 26.3534,
      longitude: 86.0722,
      accuracy: 22,
      timestamp: "16 Aug 2026, 10:00 IST",
      address: "Ranti Village, Madhubani District, Bihar",
      isSimulated: true
    },
    publicLocation: {
      city: "Madhubani",
      district: "Madhubani",
      state: "Bihar",
      country: "India",
      approximateArea: "Ranti Mithila Cluster",
      clusterName: "Madhubani Painting Hub"
    },
    locationConsistency: "consistent",
    verificationHistory: []
  },
  {
    id: "prod-006",
    productId: "CRAFT-00999",
    name: "Flagged Suspicious Listing: Machine Printed Applique Copy",
    craftCategory: "Appliqué & Needlework (Counterfeit Duplicate)",
    productType: "Factory Printed Imitation",
    description: "Listing detected on third-party marketplace claiming to be handcrafted by Sita Devi. System detected passport reuse, abnormal price discount, and synthetic polyester fabric with printed stitches.",
    artisan: mockArtisans[0],
    materials: [
      "Polyester Synthetic Fabric (Unregistered)",
      "Chemical Screen Print Ink (Non-traditional)"
    ],
    techniques: [
      "Automated Screen Machine Print (Unauthorized Copy)"
    ],
    creationDate: "2026-08-17",
    productionDuration: "Unrecorded / Factory Bulk",
    price: {
      retail: 999,
      artisanCompensation: 0,
      cooperativeShare: 0,
      rawMaterialsLogistics: 999,
      currency: "INR"
    },
    primaryImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    evidenceImages: [],
    careInstructions: [],
    trustLevel: {
      score: 1.2,
      maxScore: 5.0,
      factors: [
        {
          id: "tf-61",
          label: "Counterfeit Risk Alert Active",
          verified: false,
          description: "Seller unlinked to certified Pipli cooperative. Passport QR copied from legitimate CRAFT-00124.",
          evidenceType: "Anomaly Detector Alert #ALT-4821",
          authority: "Kalakriti Anti-Fraud Engine"
        }
      ]
    },
    physicalMatch: {
      similarityPercentage: 38,
      status: "MISMATCH",
      patternMatch: false,
      makerMarkDetected: false,
      evidenceConsistency: false,
      notes: "Stitches are digitally printed 2D patterns rather than physical 3D needlework. Fabric is synthetic polyester instead of registered khadi cotton."
    },
    provenanceTimeline: [
      {
        id: "pt-601",
        date: "17 Aug 2026",
        timestamp: "02:15 PM",
        title: "Counterfeit Alert Triggered by Cooperative Bot",
        actor: "Kalakriti Intelligence Node",
        role: "Automated Bot",
        location: "Marketplace Scraper",
        status: "completed",
        description: "Suspicious reuse of Sita Devi's passport detected on unauthorized seller store."
      }
    ],
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CRAFT-00999",
    nfcUid: "INVALID-NFC-UID",
    status: "flagged",
    creationLocation: {
      latitude: 21.1702,
      longitude: 72.8311,
      accuracy: 100,
      timestamp: "17 Aug 2026, 02:15 PM",
      address: "Surat Industrial Textile Mill Zone, Gujarat",
      isSimulated: true
    },
    publicLocation: {
      city: "Surat",
      district: "Surat",
      state: "Gujarat",
      country: "India",
      approximateArea: "Surat Industrial Zone (Outside Pipli Cluster)",
      clusterName: "Unregistered Industrial Mill"
    },
    locationConsistency: "inconsistent_review",
    verificationHistory: [],
    flagDetails: {
      isSuspicious: true,
      riskLevel: "high",
      reasons: [
        "Product image differs significantly from registered craft evidence",
        "Seller 'FastRetailMart_99' is not linked to any verified artisan cooperative",
        "Extreme price anomaly (₹999 vs registered ₹5,000 floor for authentic Pipli work)",
        "Synthetic polyester material detected via image spectral match"
      ],
      investigationStatus: "pending"
    }
  }
];

export const mockCounterfeitAlerts: CounterfeitAlert[] = [
  {
    id: "alt-01",
    alertCode: "ALT-4821",
    listingNumber: "LISTING #4821",
    productId: "CRAFT-00124",
    productName: "Sacred Lotus Pipli Appliqué Tapestry",
    riskPercentage: 87,
    riskLevel: "high",
    reasons: [
      "Image visual similarity: 94% match with Sita Devi's registered work",
      "Passport QR reused across multiple unlinked third-party listings",
      "Seller identity mismatch (Listed by unverified drop-shipper 'CraftHubExpress')",
      "Abnormal pricing (₹899 vs registered benchmark ₹5,000)",
      "Location Anomaly: Listing shipping origin originates in Surat Industrial Zone, 1,480 km from Pipli, Odisha"
    ],
    detectedUrl: "https://marketplace.example.com/item/4821-pipli-lotus-tapestry",
    priceAnomaly: "82% Below Minimum Artisan Wage Floor",
    imageSimilarity: 94,
    passportReused: true,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Surat Industrial Mill Zone, Gujarat",
    registeredLocation: "Pipli Craft Cluster, Odisha",
    detectionLocation: {
      latitude: 21.1702,
      longitude: 72.8311,
      city: "Surat",
      district: "Surat",
      state: "Gujarat",
      facilityType: "Industrial Synthetic Powerloom Mill",
      address: "Plot 14B, Pandesara GIDC Textile Zone",
      region: "Western Industrial Corridor",
      interceptionType: "shipping_origin"
    },
    genuineOrigin: {
      latitude: 19.9850,
      longitude: 85.8340,
      city: "Pipli",
      state: "Odisha",
      clusterName: "Pipli Appliqué GI Cluster"
    },
    distanceFromOriginKm: 1480,
    seizureVolume: 340,
    enforcementAgency: "Odisha State Crime Branch & GI Protection Cell",
    reportedDate: "17 Aug 2026, 14:20 IST",
    status: "investigating",
    originalArtisan: "Sita Devi Mahapatra (Utkalika Co-op)",
    suspectedSeller: "CraftHubExpress (New Delhi / Surat Warehouse)",
    platform: "GlobalCraftBazaar.com"
  },
  {
    id: "alt-02",
    alertCode: "ALT-4822",
    listingNumber: "LISTING #5109",
    productId: "CRAFT-00125",
    productName: "Dhenkanal Tribal Dhokra Figurine Copy",
    riskPercentage: 74,
    riskLevel: "high",
    reasons: [
      "Industrial die-cast seam marks detected on surface",
      "Absence of authentic lost-wax clay core evidence",
      "Claiming GI certification without authorized user number",
      "Location Anomaly: Automated metallurgy tracing points to Moradabad casting hub, 1,220 km from Dhenkanal"
    ],
    detectedUrl: "https://souvenirzone.example.com/tribal-statue",
    priceAnomaly: "Factory Cast Zinc Alloy Selling for ₹1,200",
    imageSimilarity: 78,
    passportReused: false,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Moradabad Brass & Metal Zone, Uttar Pradesh",
    registeredLocation: "Dhenkanal Tribal Metal Guild, Odisha",
    detectionLocation: {
      latitude: 28.8386,
      longitude: 78.7733,
      city: "Moradabad",
      district: "Moradabad",
      state: "Uttar Pradesh",
      facilityType: "Die-Cast Zinc Alloy Automated Foundry",
      address: "Lakri Fazalpur Industrial Belt",
      region: "North Central Metal Hub",
      interceptionType: "physical_seizure"
    },
    genuineOrigin: {
      latitude: 20.6528,
      longitude: 85.5960,
      city: "Dhenkanal",
      state: "Odisha",
      clusterName: "Dhenkanal Dhokra GI Guild"
    },
    distanceFromOriginKm: 1220,
    seizureVolume: 185,
    enforcementAgency: "National IP Enforcement Wing",
    reportedDate: "16 Aug 2026, 18:45 IST",
    status: "investigating",
    originalArtisan: "Ramesh Kumar Sahu",
    suspectedSeller: "HeritageGifts Co.",
    platform: "IndiaSouvenirsOnline"
  },
  {
    id: "alt-03",
    alertCode: "ALT-4809",
    listingNumber: "LISTING #3912",
    productId: "CRAFT-00126",
    productName: "Powerloom Polyester Sambalpuri Print Saree",
    riskPercentage: 62,
    riskLevel: "medium",
    reasons: [
      "Screen-printed duplicate of Bargarh Bandha pattern",
      "Misleading 'Handloom Pure Silk' label on polyester blend",
      "Location Anomaly: Dispatch IP located in Surat Textile Market, 1,180 km from Bargarh weavers guild"
    ],
    detectedUrl: "https://sareemart.example.com/sambalpuri-look",
    priceAnomaly: "₹650 printed copy vs ₹16,500 authentic handloom",
    imageSimilarity: 88,
    passportReused: false,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Surat Ring Road Textile Market, Gujarat",
    registeredLocation: "Bargarh Weavers Cooperative Guild, Odisha",
    detectionLocation: {
      latitude: 21.1950,
      longitude: 72.8194,
      city: "Surat",
      district: "Surat",
      state: "Gujarat",
      facilityType: "High-Speed Rotary Screen Printing Unit",
      address: "Millennium Textile Market, Ring Road",
      region: "Western Industrial Corridor",
      interceptionType: "market_inspection"
    },
    genuineOrigin: {
      latitude: 21.3340,
      longitude: 83.6180,
      city: "Bargarh",
      state: "Odisha",
      clusterName: "Sambalpuri Silk Handloom Apex"
    },
    distanceFromOriginKm: 1180,
    seizureVolume: 520,
    enforcementAgency: "Handloom Inspectorate & State Police",
    reportedDate: "14 Aug 2026, 09:15 IST",
    status: "escalated",
    originalArtisan: "Anita Das & Weavers Collective",
    suspectedSeller: "SuratTextiles Wholesale",
    platform: "SareeMegaStore"
  },
  {
    id: "alt-04",
    alertCode: "ALT-4780",
    listingNumber: "LISTING #3801",
    productId: "CRAFT-00127",
    productName: "Plastic Coated Wooden Stacker (Channapatna Claim)",
    riskPercentage: 45,
    riskLevel: "medium",
    reasons: [
      "Synthetic chemical lacquer detected in customer photo review",
      "Resolved: Seller issued takedown and removed GI claim",
      "Workshop located in Peenya Industrial Area, outside Channapatna boundary"
    ],
    detectedUrl: "https://toyzone.example.com/stacker-toy",
    priceAnomaly: "Factory Produced at 40% Lower Cost",
    imageSimilarity: 65,
    passportReused: false,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Peenya Industrial Area, Bengaluru, Karnataka",
    registeredLocation: "Channapatna Toy Town, Karnataka",
    detectionLocation: {
      latitude: 13.0285,
      longitude: 77.5186,
      city: "Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      facilityType: "Chemical Lead-Lacquer Spray Workshop",
      address: "Peenya 3rd Phase Industrial Belt",
      region: "Southern Manufacturing Hub",
      interceptionType: "physical_seizure"
    },
    genuineOrigin: {
      latitude: 12.6518,
      longitude: 77.2089,
      city: "Channapatna",
      state: "Karnataka",
      clusterName: "Channapatna Toys GI Guild"
    },
    distanceFromOriginKm: 58,
    seizureVolume: 120,
    enforcementAgency: "Karnataka State Toy Craft Development Corp",
    reportedDate: "11 Aug 2026, 11:30 IST",
    status: "resolved",
    originalArtisan: "Manjunath Gowda",
    suspectedSeller: "KidzChoice Toys",
    platform: "QuickPlay India"
  },
  {
    id: "alt-05",
    alertCode: "ALT-4850",
    listingNumber: "LISTING #5430",
    productId: "CRAFT-00130",
    productName: "Synthetic Banarasi Kadwa Brocade Replica",
    riskPercentage: 91,
    riskLevel: "high",
    reasons: [
      "Chinese synthetic nylon warp disguised as pure Katan silk",
      "Re-tagged with stolen Varanasi Weaver Society authentication badge",
      "Drop-shipping fulfillment center detected in West Delhi logistics cluster"
    ],
    detectedUrl: "https://weddingcouture.example.com/banarasi-royal",
    priceAnomaly: "₹1,800 replica vs ₹42,000 genuine handwoven Kadwa",
    imageSimilarity: 96,
    passportReused: true,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Kirti Nagar Logistics Cluster, New Delhi",
    registeredLocation: "Varanasi Weavers Colony, Uttar Pradesh",
    detectionLocation: {
      latitude: 28.6500,
      longitude: 77.1400,
      city: "New Delhi",
      district: "West Delhi",
      state: "Delhi",
      facilityType: "Unauthorized Packaging & Tag Spoofing Hub",
      address: "Kirti Nagar Warehouse Complex",
      region: "NCR Distribution Corridor",
      interceptionType: "shipping_origin"
    },
    genuineOrigin: {
      latitude: 25.3176,
      longitude: 82.9739,
      city: "Varanasi",
      state: "Uttar Pradesh",
      clusterName: "Varanasi Handloom Silk Guild"
    },
    distanceFromOriginKm: 810,
    seizureVolume: 410,
    enforcementAgency: "Delhi Police Special Cell & Handloom Ministry",
    reportedDate: "18 Aug 2026, 10:15 IST",
    status: "investigating",
    originalArtisan: "Master Weaver Farooq Ansari",
    suspectedSeller: "RoyalSilksDirect",
    platform: "LuxeBoutiqueIndia"
  },
  {
    id: "alt-06",
    alertCode: "ALT-4862",
    listingNumber: "LISTING #5899",
    productId: "CRAFT-00131",
    productName: "Rotary Printed Pochampally Ikat Pattern",
    riskPercentage: 68,
    riskLevel: "medium",
    reasons: [
      "Mechanical rotary printing simulating double ikat mathematical geometry",
      "Manufactured in bulk synthetic knitwear export zone in Tiruppur",
      "Unregistered brand claiming Pochampally GI Geographical Indication mark"
    ],
    detectedUrl: "https://fastfashionhub.example.com/ikat-tunic",
    priceAnomaly: "₹450 mass print vs ₹6,800 authentic handwoven piece",
    imageSimilarity: 82,
    passportReused: false,
    sellerMismatch: true,
    locationMismatch: true,
    creationLocationMismatch: true,
    listingLocation: "Tiruppur Export Industrial Area, Tamil Nadu",
    registeredLocation: "Bhoodan Pochampally, Telangana",
    detectionLocation: {
      latitude: 11.1085,
      longitude: 77.3411,
      city: "Tiruppur",
      district: "Tiruppur",
      state: "Tamil Nadu",
      facilityType: "Bulk Polyester Synthetic Rotary Printer",
      address: "Avinashi Road Industrial Area",
      region: "Southern Textile Corridor",
      interceptionType: "market_inspection"
    },
    genuineOrigin: {
      latitude: 17.3450,
      longitude: 78.8250,
      city: "Pochampally",
      state: "Telangana",
      clusterName: "Pochampally Handloom Weavers Cooperative"
    },
    distanceFromOriginKm: 720,
    seizureVolume: 670,
    enforcementAgency: "Telangana Weavers Protection Squad",
    reportedDate: "18 Aug 2026, 16:40 IST",
    status: "escalated",
    originalArtisan: "G. Narsimha Rao",
    suspectedSeller: "TextileTrends Direct",
    platform: "FastFashionHub"
  }
];

export const mockDisputes: DisputeCase[] = [
  {
    id: "disp-01",
    disputeCode: "DISP-D102",
    caseNumber: "CASE #DISP-D102",
    productId: "CRAFT-00124",
    productName: "Sacred Lotus Pipli Appliqué Tapestry",
    buyerName: "Ananya Sharma (Bengaluru)",
    buyerContact: "ananya.sharma@example.com",
    buyerComplaint: "The item I received from an online reseller has thin polyester fabric with no mirror embroidery, but came with a tag linking to this digital passport CRAFT-00124.",
    buyerClaim: "Received counterfeit machine print instead of authentic hand-stitched applique tapestry.",
    artisanName: "Sita Devi Mahapatra",
    artisanAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    cooperativeName: "Utkalika State Handicraft Apex Co-op",
    cooperativeId: "coop-utkalika",
    aiRiskScore: 87,
    aiRiskAssessment: 87,
    filingDate: "17 Aug 2026",
    filedDate: "17 Aug 2026",
    escrowStatus: "locked_in_escrow",
    escrowAmount: 5200,
    currency: "INR",
    transactionRef: "TXN-UPI-98210344",
    marketplacePlatform: "GlobalCraftBazaar.com (Third-Party Seller)",
    artisanResponse: "This is my genuine original craft design. The reseller has unauthorizedly printed my product photos and copied my digital passport QR code onto mass factory-printed polyester imitations.",
    evidenceList: [
      {
        id: "ev-disp-101",
        title: "Original Creation In-Progress Photo at Pipli Workshop",
        type: "image",
        verified: true,
        url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
        timestamp: "12 Aug 2026, 11:30 IST",
        submittedBy: "Sita Devi Mahapatra",
        notes: "Shows authentic hand-stitched needlework on 100% Khadi cotton base."
      },
      {
        id: "ev-disp-102",
        title: "Utkalika Co-op Physical Batch Registry Log #OD-8821",
        type: "document",
        verified: true,
        timestamp: "14 Aug 2026, 16:00 IST",
        submittedBy: "Utkalika Lead Inspector",
        notes: "Physical seal logged with matching NFC tag UID 04:A2:33:1B:7F."
      },
      {
        id: "ev-disp-103",
        title: "Voice Audio Testimony of Sita Devi with Field Auditor",
        type: "voice",
        verified: true,
        timestamp: "17 Aug 2026, 17:15 IST",
        submittedBy: "Regional Field Officer",
        notes: "Artisan confirms never fulfilling orders through GlobalCraftBazaar unauthorized store."
      },
      {
        id: "ev-disp-104",
        title: "Spectroscopy Spectral Analysis: 100% Polyester Detected in Buyer Sample",
        type: "spectroscopy",
        verified: true,
        timestamp: "18 Aug 2026, 09:40 IST",
        submittedBy: "Textiles Testing Laboratory",
        notes: "Buyer's received piece fails pure cotton standard required by GI-89 specification."
      }
    ],
    status: "open",
    assignedAuditor: "Bipin Nayak (Senior Guild Inspector)",
    blockchainHash: "0x7a8e9d34b67f12e84d2891c9802bf3764812a3d0f7652c4e518b459a"
  },
  {
    id: "disp-02",
    disputeCode: "DISP-D098",
    caseNumber: "CASE #DISP-D098",
    productId: "CRAFT-00125",
    productName: "Ancient Dhenkanal Tribal Dhokra Dancing Trio",
    buyerName: "Vikramaditya Sengupta (Kolkata)",
    buyerContact: "vikram.sengupta@example.com",
    buyerComplaint: "Patina tone looks darker and has slight greenish oxidation compared to the bright golden catalog photograph.",
    buyerClaim: "Suspected color defect or non-standard brass alloy composition.",
    artisanName: "Ramesh Kumar Sahu",
    artisanAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    cooperativeName: "Dhenkanal Bell Metal Society",
    cooperativeId: "coop-dhenkanal",
    aiRiskScore: 18,
    aiRiskAssessment: 18,
    filingDate: "12 Aug 2026",
    filedDate: "12 Aug 2026",
    escrowStatus: "released_to_artisan",
    escrowAmount: 8500,
    currency: "INR",
    transactionRef: "TXN-NETB-44129987",
    marketplacePlatform: "Direct Cooperative Portal",
    artisanResponse: "Lost-wax dhokra casting relies on natural beeswax firing in wood charcoal pits. The organic river clay slurry and open-hearth annealing produce distinct patina shading on every individual handcrafted statue. This natural variance is the hallmark of genuine non-factory metallurgy.",
    evidenceList: [
      {
        id: "ev-disp-201",
        title: "Kiln Annealing Temperature & Clay Slurry Log",
        type: "document",
        verified: true,
        timestamp: "08 Aug 2026, 17:00 IST",
        submittedBy: "Dhenkanal Bell Metal Society",
        notes: "Annealing log confirms authentic lost-wax charcoal firing at 950°C."
      },
      {
        id: "ev-disp-202",
        title: "XRF Metallurgy Spectroscopy of Bell Metal Purity",
        type: "spectroscopy",
        verified: true,
        timestamp: "10 Aug 2026, 14:20 IST",
        submittedBy: "National Metallurgical Lab",
        notes: "Copper 78.4%, Zinc 20.8%, Tin 0.8% — passes GI-540 brass alloy standard."
      }
    ],
    status: "approved_authentic",
    assignedAuditor: "Kailash Mishra (Lead Metallurgist)",
    verdict: "Authentic Handicraft Approved",
    verdictNotes: "Tribunal verified natural lost-wax metallurgical patina. Product meets all GI standards. Full escrow released to Master Artisan Ramesh Sahu.",
    verdictDate: "14 Aug 2026",
    blockchainHash: "0x4e21b8f98a2d3c5e7b1a0942d765e9123fa456789b12d34e56f78a90"
  },
  {
    id: "disp-03",
    disputeCode: "DISP-D105",
    caseNumber: "CASE #DISP-D105",
    productId: "CRAFT-00126",
    productName: "Bargarh Pure Silk Sambalpuri Ikat Saree",
    buyerName: "Pooja Hegde (Hyderabad)",
    buyerContact: "pooja.hegde@example.com",
    buyerComplaint: "Found identical saree listed on Surat wholesale portal for ₹799 claiming to have the exact same Sambalpuri weave passport.",
    buyerClaim: "Suspected illicit duplicate production using authentic weaver's GI tag.",
    artisanName: "Anita Das & Weavers Collective",
    artisanAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    cooperativeName: "Bargarh Weavers Apex Society",
    cooperativeId: "coop-bargarh",
    aiRiskScore: 92,
    aiRiskAssessment: 92,
    filingDate: "18 Aug 2026",
    filedDate: "18 Aug 2026",
    escrowStatus: "locked_in_escrow",
    escrowAmount: 16500,
    currency: "INR",
    transactionRef: "TXN-CARD-11928374",
    marketplacePlatform: "SuratTextiles Wholesale / External Scraper",
    artisanResponse: "Our collective spent 14 days on the pit loom tying and dying pure mulberry silk threads. The Surat listing is a high-speed polyester rotary screen print reproducing our copyrighted Bandha motif.",
    evidenceList: [
      {
        id: "ev-disp-301",
        title: "Pit Loom Weaving Progress Video (Bargarh Loom #14)",
        type: "image",
        verified: true,
        url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
        timestamp: "10 Aug 2026, 10:15 IST",
        submittedBy: "Anita Das",
        notes: "Shows manual tie-dye warp adjustment on traditional wooden frame."
      },
      {
        id: "ev-disp-302",
        title: "Handloom Mark & Silk Mark India Inspection Certificate",
        type: "document",
        verified: true,
        timestamp: "12 Aug 2026, 15:45 IST",
        submittedBy: "Central Silk Board",
        notes: "Authentic mulberry silk certified with hologram tag #SM-OD-8921."
      },
      {
        id: "ev-disp-303",
        title: "Surat Factory Powerloom Seizure Incident Report",
        type: "document",
        verified: true,
        timestamp: "19 Aug 2026, 11:00 IST",
        submittedBy: "State Handloom Enforcement Squad",
        notes: "520 counterfeit printed rolls seized at Millennium Textile Market, Surat."
      }
    ],
    status: "open",
    assignedAuditor: "Trilochan Pradhan (Handloom Inspector)",
    blockchainHash: "0x89d2c1e45f78a0b9e3d4c6a8f12e57b90234c891a67d4e5f32b1a9c0"
  },
  {
    id: "disp-04",
    disputeCode: "DISP-D094",
    caseNumber: "CASE #DISP-D094",
    productId: "CRAFT-00127",
    productName: "Channapatna Natural Lacquer Wooden Rattle Set",
    buyerName: "Rajesh Kulkarni (Pune)",
    buyerContact: "rajesh.kulkarni@example.com",
    buyerComplaint: "The toy set has a chemical paint smell and flaked slightly when wiped with warm water.",
    buyerClaim: "Suspected chemical synthetic enamel used instead of non-toxic vegetable lac resins.",
    artisanName: "Manjunath Gowda",
    artisanAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    cooperativeName: "Karnataka Craft Development Board",
    cooperativeId: "coop-karnataka",
    aiRiskScore: 76,
    aiRiskAssessment: 76,
    filingDate: "05 Aug 2026",
    filedDate: "05 Aug 2026",
    escrowStatus: "refunded_to_buyer",
    escrowAmount: 1800,
    currency: "INR",
    transactionRef: "TXN-UPI-33019284",
    marketplacePlatform: "KidzChoice Toys (Third-Party Portal)",
    artisanResponse: "Master Manjunath only produces toys with Wrightia tinctoria wood and organic turmeric/indigo lac. The seller 'KidzChoice Toys' operates from Peenya Industrial Area and spray-paints pine wood with synthetic auto lacquer, hijacking our cooperative registry number.",
    evidenceList: [
      {
        id: "ev-disp-401",
        title: "Chemical Toxicology Lab Report #TOX-BLR-441",
        type: "spectroscopy",
        verified: true,
        timestamp: "07 Aug 2026, 13:00 IST",
        submittedBy: "Bangalore Testing Laboratories",
        notes: "Found synthetic nitrocellulose enamel. Failed non-toxic GI-24 food-safe standard."
      },
      {
        id: "ev-disp-402",
        title: "Formal Legal Cease & Desist Notice Issued to KidzChoice Toys",
        type: "document",
        verified: true,
        timestamp: "09 Aug 2026, 16:30 IST",
        submittedBy: "Karnataka Craft Board Legal Cell",
        notes: "Seller delisted from marketplace; buyer refunded in full."
      }
    ],
    status: "confirmed_counterfeit",
    assignedAuditor: "Suresh Babu (Safety & GI Inspector)",
    verdict: "Confirmed Counterfeit — Takedown Executed",
    verdictNotes: "Laboratory tests proved synthetic spray paint on unverified pine wood. Rogue seller delisted under GI Act Sec 39. Buyer refunded 100% and artisan credentials cleared.",
    verdictDate: "10 Aug 2026",
    legalNoticeGenerated: true,
    legalNoticeRef: "CD-GI-2026-KA-094",
    blockchainHash: "0x12a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3"
  },
  {
    id: "disp-05",
    disputeCode: "DISP-D110",
    caseNumber: "CASE #DISP-D110",
    productId: "CRAFT-00128",
    productName: "Mithila Kohbar Ritual Wall Painting Canvas",
    buyerName: "Meenakshi Sundaram (Chennai)",
    buyerContact: "meenakshi.s@example.com",
    buyerComplaint: "Buyer noticed difference in border pigment saturation and requested confirmation of natural plant dye authenticity.",
    buyerClaim: "Verification of natural plant/lampblack pigment vs synthetic poster color.",
    artisanName: "Radha Jha",
    artisanAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    cooperativeName: "Mithila Folk Artists Guild",
    cooperativeId: "coop-mithila",
    aiRiskScore: 35,
    aiRiskAssessment: 35,
    filingDate: "19 Aug 2026",
    filedDate: "19 Aug 2026",
    escrowStatus: "locked_in_escrow",
    escrowAmount: 4200,
    currency: "INR",
    transactionRef: "TXN-NETB-77889900",
    marketplacePlatform: "Mithila Direct Guild",
    artisanResponse: "I extract the black ink from mustard oil lamp soot (kajal) and the yellow from turmeric rhizomes. Natural seasonal plant pigments vary slightly based on harvest sunlight. I am ready to submit high-magnification macro photos of the organic pigment texture.",
    evidenceList: [
      {
        id: "ev-disp-501",
        title: "Artisan Pigment Extraction Process Video",
        type: "image",
        verified: true,
        url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
        timestamp: "16 Aug 2026, 14:00 IST",
        submittedBy: "Radha Jha",
        notes: "Shows preparation of natural soot lampblack and gum acacia binder."
      }
    ],
    status: "needs_evidence",
    assignedAuditor: "Dr. Arvind Pathak (Folk Art Curator)",
    blockchainHash: "0x65c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8"
  }
];

export const mockCooperativeStats = {
  totalProducts: 1240,
  verifiedProducts: 1102,
  pendingVerification: 92,
  suspiciousAlerts: 46,
  activeArtisans: 138,
  totalCompensationFormatted: "₹12.4 Lakh",
  totalCompensationRaw: 1240000,
  compensationSplit: {
    artisanSharePct: 65,
    cooperativeSharePct: 15,
    materialsLogisticsPct: 20
  },
  monthlyVolume: [
    { month: "Mar", authenticSales: 120, payout: 110000, alerts: 4 },
    { month: "Apr", authenticSales: 150, payout: 145000, alerts: 6 },
    { month: "May", authenticSales: 180, payout: 180000, alerts: 5 },
    { month: "Jun", authenticSales: 210, payout: 225000, alerts: 8 },
    { month: "Jul", authenticSales: 260, payout: 290000, alerts: 11 },
    { month: "Aug", authenticSales: 320, payout: 390000, alerts: 12 }
  ]
};

export const mockAdminStats = {
  totalPassportsNationwide: 18450,
  verifiedArtisans: 4820,
  activeCooperatives: 142,
  totalEscrowDisbursed: "₹14.8 Cr",
  counterfeitsNeutralized: 342,
  systemUptime: "99.98%"
};

export const mockCraftClusters = [
  {
    id: "cluster-pipli",
    clusterName: "Pipli Appliqué Cluster",
    state: "Odisha",
    giTag: "GI-89 (Appliqué Chandua)",
    cooperativeName: "Utkalika Apex Society",
    activeArtisans: 138,
    totalProducts: 1240,
    totalWageDisbursed: "₹42.8 Lakh",
    description: "4th generation temple canopy and handcrafted textile cluster using hand-cut geometric patchwork and mirror inlay."
  },
  {
    id: "cluster-dhokra",
    clusterName: "Dhenkanal & Mayurbhanj Dhokra Cluster",
    state: "Odisha",
    giTag: "GI-540 (Dhokra Bell Metal)",
    cooperativeName: "Dhenkanal Artisans Guild",
    activeArtisans: 94,
    totalProducts: 860,
    totalWageDisbursed: "₹31.2 Lakh",
    description: "Ancient lost-wax casting metallurgy practiced by indigenous metalsmiths using beeswax and riverbed clay molds."
  },
  {
    id: "cluster-sambalpuri",
    clusterName: "Bargarh Sambalpuri Handloom Cluster",
    state: "Odisha",
    giTag: "GI-22 (Sambalpuri Bandha)",
    cooperativeName: "Bargarh Weavers Apex Society",
    activeArtisans: 310,
    totalProducts: 3400,
    totalWageDisbursed: "₹1.15 Cr",
    description: "Tie-dyed warp and weft double ikat silk and cotton sarees woven on traditional wood pit looms."
  },
  {
    id: "cluster-channapatna",
    clusterName: "Channapatna Wooden Toys Cluster",
    state: "Karnataka",
    giTag: "GI-24 (Channapatna Toys)",
    cooperativeName: "Karnataka Craft Development Board",
    activeArtisans: 220,
    totalProducts: 2100,
    totalWageDisbursed: "₹76.4 Lakh",
    description: "Traditional lathe-turned ivory wood toys colored with natural vegetable and non-toxic lac resins."
  },
  {
    id: "cluster-madhubani",
    clusterName: "Mithila Madhubani Painting Cluster",
    state: "Bihar",
    giTag: "GI-105 (Madhubani Art)",
    cooperativeName: "Mithila Folk Artists Guild",
    activeArtisans: 440,
    totalProducts: 4800,
    totalWageDisbursed: "₹1.48 Cr",
    description: "Folk art created using fingers, twigs, brushes, nib-pens, and matchsticks with natural pigment dyes."
  }
];

