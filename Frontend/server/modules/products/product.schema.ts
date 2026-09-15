// server/modules/products/product.schema.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  craftType: z.string().min(2, 'Craft type is required'),
  giTagName: z.string().optional(),
  technique: z.string().min(2, 'Technique description is required'),
  originState: z.string().min(2, 'Origin state is required'),
  originDistrict: z.string().min(2, 'Origin district is required'),
  creationDate: z.string().optional(),
  dimensions: z.object({
    widthCm: z.number().positive().optional(),
    heightCm: z.number().positive().optional(),
    depthCm: z.number().positive().optional()
  }).optional(),
  weightGrams: z.number().positive().optional(),
  image: z.string().optional(),
  materials: z.array(z.object({
    name: z.string().min(2),
    source: z.string().min(1).optional().default('Artisan Workshop Stock'),
    organicCert: z.string().optional(),
    percentage: z.number().min(1).max(100).optional().default(100)
  })).min(1, 'At least one authentic craft material must be declared'),
  evidence: z.array(z.object({
    evidenceType: z.enum(['WORKSHOP_PHOTO', 'PROCESS_VIDEO', 'RAW_MATERIAL_SLIP', 'AUDIO_TESTIMONY', 'GI_CERTIFICATE']),
    label: z.string().min(2),
    fileUrl: z.string().min(5, 'Evidence image is required'),
    geoLat: z.number().optional(),
    geoLng: z.number().optional(),
    geoTagLabel: z.string().optional()
  })).optional(),
  processVideoUrl: z.string().optional(),
  processVideoDuration: z.number().optional(),
  processVideoStatus: z.enum(['SUBMITTED', 'VERIFIED', 'PENDING_REVIEW', 'REJECTED']).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const aiExtractSchema = z.object({
  text: z.string().min(5, 'Craft description text is required for extraction'),
  audioBase64: z.string().optional(),
  audioMimeType: z.string().optional()
});
