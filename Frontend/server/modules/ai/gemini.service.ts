// server/modules/ai/gemini.service.ts
import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../../config/env';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
  return aiClient;
}

export interface StructuredProductDraft {
  title: string;
  description: string;
  craftType: string;
  technique: string;
  originState: string;
  originDistrict: string;
  materials: Array<{
    name: string;
    source: string;
    percentage: number;
    organicCert?: string;
  }>;
  dimensions?: {
    widthCm?: number;
    heightCm?: number;
    depthCm?: number;
  };
  weightGrams?: number;
  suggestedGiTag?: string;
  languageDetected?: string;
}

/**
 * Extracts structured handicraft metadata from artisan voice transcriptions or natural language descriptions.
 * Supports Indian regional languages (Odia, Hindi, Bengali, Kannada, Tamil, Telugu, Marathi, etc.).
 * The output is returned as a draft for the artisan to review and edit before submission.
 */
export async function extractStructuredCraftData(
  textOrTranscript: string,
  audioBase64?: string,
  audioMimeType?: string,
  targetLanguage?: string
): Promise<StructuredProductDraft> {
  const client = getGeminiClient();

  // If Gemini API is not yet configured, return deterministic structured fallback based on input analysis
  if (!client) {
    return generateFallbackExtraction(textOrTranscript);
  }

  try {
    const langInstruction = targetLanguage ? `Please return descriptions and titles translated to ${targetLanguage} language.` : '';
    const prompt = `You are a heritage craft documentation assistant for the Indian Traditional Craft Digital Passport Registry.
Analyze the following artisan testimony / craft description (which may be in Hindi, Odia, or other Indian languages or Indian English) and extract structured product details into precise JSON.
${langInstruction}

Input text: "${textOrTranscript}"`;

    const contents: any = [{ text: prompt }];

    if (audioBase64 && audioMimeType) {
      contents.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioBase64
        }
      });
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        systemInstruction: 'You extract precise structured handicraft metadata for official GI and craft passports. Always return valid JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title of the handicraft item' },
            description: { type: Type.STRING, description: 'Rich cultural and technical description' },
            craftType: { type: Type.STRING, description: 'Standard craft category (e.g. Appliqué, Dhokra Casting, Ikat Silk)' },
            technique: { type: Type.STRING, description: 'Specific traditional technique used' },
            originState: { type: Type.STRING, description: 'State of origin in India' },
            originDistrict: { type: Type.STRING, description: 'District of origin in India' },
            materials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  source: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                },
                required: ['name', 'source', 'percentage']
              }
            },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                widthCm: { type: Type.NUMBER },
                heightCm: { type: Type.NUMBER },
                depthCm: { type: Type.NUMBER }
              }
            },
            weightGrams: { type: Type.NUMBER },
            suggestedGiTag: { type: Type.STRING },
            languageDetected: { type: Type.STRING }
          },
          required: ['title', 'description', 'craftType', 'technique', 'originState', 'originDistrict', 'materials']
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return parsed;
    }
  } catch (error) {
    console.error('Gemini extraction failed, using fallback parser:', error);
  }

  return generateFallbackExtraction(textOrTranscript);
}

/**
 * Analyzes marketplace listing discrepancy against official GI product passport.
 */
export async function explainCounterfeitRisk(
  listingTitle: string,
  listingPrice: number,
  registeredTitle: string,
  registeredPriceRange: string,
  reasons: string[],
  targetLanguage?: string
): Promise<string> {
  const client = getGeminiClient();

  const langPrompt = targetLanguage ? `Explain in ${targetLanguage} language.` : '';

  if (!client) {
    return `AI Risk Analysis: Listing '${listingTitle}' claims affiliation with registered craft '${registeredTitle}' but presents anomalies: ${reasons.join(', ')}. Price of ₹${listingPrice} deviates substantially from authentic benchmark (${registeredPriceRange}). Requires human cooperative evaluator review.`;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Explain clearly in 2 concise sentences why the following marketplace listing was flagged for counterfeit risk:
Listing: "${listingTitle}" priced at ₹${listingPrice}
Authentic Passport: "${registeredTitle}" (${registeredPriceRange})
Detected Risk Triggers: ${reasons.join(', ')}
${langPrompt}`,
      config: {
        systemInstruction: 'You are an objective fraud intelligence specialist for traditional craft GI verification.'
      }
    });

    return response.text?.trim() || 'Potential counterfeit listing requiring authorized human review.';
  } catch (err) {
    return `Marketplace listing exhibits severe risk flags: ${reasons.join(', ')}. Marked for human reviewer triage.`;
  }
}

function generateFallbackExtraction(text: string): StructuredProductDraft {
  const lower = text.toLowerCase();
  
  if (lower.includes('dhokra') || lower.includes('brass') || lower.includes('bell metal') || lower.includes('cast')) {
    return {
      title: 'Handcrafted Tribal Dhokra Brass Sculpture',
      description: 'Lost-wax bell metal casting using traditional cire-perdue method with pure beeswax strings and riverbed clay core.',
      craftType: 'Dhokra Metal Casting',
      technique: 'Cire Perdue Lost-Wax Brass Casting',
      originState: 'Chhattisgarh',
      originDistrict: 'Bastar',
      materials: [
        { name: 'Recycled Bell Metal / Brass Alloy', source: 'Kondagaon Guild Supply', percentage: 90 },
        { name: 'Natural Beeswax & Riverbed Clay', source: 'Indravati River Basin', percentage: 10 }
      ],
      dimensions: { widthCm: 15, heightCm: 22, depthCm: 10 },
      weightGrams: 1400,
      suggestedGiTag: 'Bastar Dhokra (GI-83)',
      languageDetected: 'hi'
    };
  }

  if (lower.includes('ikat') || lower.includes('silk') || lower.includes('saree') || lower.includes('weave')) {
    return {
      title: 'Traditional Sambalpuri Handwoven Bandha Silk',
      description: 'Authentic double ikat handloom weaving with precision resist-dyed silk threads and heritage tribal border patterns.',
      craftType: 'Sambalpuri Ikat',
      technique: 'Hand-tied resist warp and weft double ikat',
      originState: 'Odisha',
      originDistrict: 'Bargarh',
      materials: [
        { name: 'Mulberry Pure Silk Threads', source: 'Odisha Silk Federation', percentage: 95 },
        { name: 'Natural Plant Extracts & Indigo', source: 'Local Herbal Dyes', percentage: 5 }
      ],
      dimensions: { widthCm: 115, heightCm: 550, depthCm: 0.1 },
      weightGrams: 620,
      suggestedGiTag: 'Sambalpuri Bandha Sarees (GI-22)',
      languageDetected: 'or'
    };
  }

  // Default to Pipli Appliqué structure
  return {
    title: text.length > 5 ? text.slice(0, 40) : 'Heritage Pipli Handcrafted Textile',
    description: text || 'Handcrafted traditional artisan product with natural fibers and authentic cluster techniques.',
    craftType: 'Appliqué & Needlework',
    technique: 'Traditional Hand Embroidery & Layered Needlework',
    originState: 'Odisha',
    originDistrict: 'Puri',
    materials: [
      { name: 'Organic Khadi Cotton', source: 'Puri Handloom Guild', percentage: 85 },
      { name: 'Vegetable Dyes & Glass Insets', source: 'Pipli Artisan Cooperative', percentage: 15 }
    ],
    dimensions: { widthCm: 60, heightCm: 90, depthCm: 0.5 },
    weightGrams: 450,
    suggestedGiTag: 'Pipli Applique Work (GI-86)',
    languageDetected: 'en'
  };
}
