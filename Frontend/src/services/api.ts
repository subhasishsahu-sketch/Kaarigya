// src/services/api.ts
// Frontend API Client for Kalakriti Platform (Node + Python ML Engine)

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL)
  ? `${(import.meta as any).env.VITE_API_URL}/api`
  : '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('craftpass_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.success) {
    const errorMsg = json?.error?.message || json?.detail || `API request failed (${response.status})`;
    const error = new Error(errorMsg);
    (error as any).code = json?.error?.code;
    (error as any).details = json?.error?.details;
    throw error;
  }

  return json.data;
}

export const api = {
  // Auth
  auth: {
    me: () => request<any>('/auth/me'),
    switchRole: (role: string) => request<any>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    }),
    getDemoUsers: () => request<any[]>('/auth/demo-users'),
    registerArtisan: (data: any) => request<any>('/auth/register-artisan', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Products & AI Extraction
  products: {
    list: () => request<any[]>('/products'),
    get: (id: string) => request<any>(`/products/${id}`),
    lookupByCode: (code: string) => request<any>(`/products/lookup/${encodeURIComponent(code)}`),
    create: (data: any) => request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    addEvidence: (id: string, evidence: any) => request<any>(`/products/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence)
    }),
    aiExtract: (text: string, audioBase64?: string, audioMimeType?: string) =>
      request<any>('/products/ai-extract', {
        method: 'POST',
        body: JSON.stringify({ text, audioBase64, audioMimeType })
      }),
    physicalCheck: (productId: string, image: string, location?: { latitude?: number; longitude?: number; city?: string; state?: string; country?: string }) =>
      request<any>(`/products/${productId}/physical-check`, {
        method: 'POST',
        body: JSON.stringify({ image, location })
      }),
    getProvenance: (productId: string) => request<any>(`/products/${productId}/provenance`),
    validateProvenance: (productId: string) => request<any>(`/products/${productId}/provenance/validate`, {
      method: 'POST'
    }),
    getCompensation: (productId: string) => request<any>(`/products/${productId}/compensation`),
    recordCompensation: (productId: string, data: any) => request<any>(`/products/${productId}/compensation`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Digital Passports
  passports: {
    get: (idOrSlug: string) => request<any>(`/passports/${idOrSlug}`),
    getByQr: (qrHash: string) => request<any>(`/passports/qr/${qrHash}`),
    issue: (productId: string, nfcTagUid?: string) => request<any>('/passports', {
      method: 'POST',
      body: JSON.stringify({ productId, nfcTagUid })
    })
  },

  // Verification & Layer 1 Physical ML Check
  verification: {
    verifyProduct: (productId: string, decision: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO', notes?: string, checklist?: Record<string, boolean>) =>
      request<any>(`/verify/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes, checklist })
      }),
    physicalCheck1ToN: (image: string, location?: { latitude?: number; longitude?: number; city?: string; state?: string; country?: string }) =>
      request<any>('/verify/physical-1-to-n', {
        method: 'POST',
        body: JSON.stringify({ image, location })
      })
  },

  // Counterfeit Intelligence (Layer 2)
  counterfeit: {
    analyzeListing: (listingData: any) => request<any>('/listings/analyze', {
      method: 'POST',
      body: JSON.stringify(listingData)
    }),
    listAlerts: () => request<any[]>('/fraud-alerts'),
    getAlert: (id: string) => request<any>(`/fraud-alerts/${id}`),
    reviewAlert: (id: string, decision: string, notes: string) => request<any>(`/fraud-alerts/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes })
    }),
    getIntelligenceDashboard: () => request<any>('/fraud-alerts/intelligence/dashboard'),
    listIncidents: (status?: string) => request<any[]>(`/fraud-alerts/intelligence/incidents${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    getHotspots: () => request<any[]>('/fraud-alerts/intelligence/hotspots')
  },

  // Disputes
  disputes: {
    list: () => request<any[]>('/disputes'),
    create: (data: any) => request<any>('/disputes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    resolve: (id: string, resolutionStatus: string, notes: string) => request<any>(`/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionStatus, notes })
    })
  },

  // Artisans
  artisans: {
    list: () => request<any[]>('/artisans'),
    get: (id: string) => request<any>(`/artisans/${id}`),
    update: (id: string, data: any) => request<any>(`/artisans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    listCooperatives: () => request<any[]>('/artisans/cooperatives'),
    getPending: (cooperativeId?: string) => request<any[]>(`/artisans/pending${cooperativeId ? `?cooperativeId=${encodeURIComponent(cooperativeId)}` : ''}`),
    accept: (id: string) => request<any>(`/artisans/${id}/accept`, {
      method: 'POST'
    }),
    reject: (id: string) => request<any>(`/artisans/${id}/reject`, {
      method: 'POST'
    })
  },

  // Health check
  health: {
    get: () => request<any>('/health')
  }
};
