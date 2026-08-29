export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const CHECKOUT_BASE_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL || "http://localhost:3001";

export const AI_BASE_URL =
  process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8001";

export interface CreateCampaignRequest {
  handle: string;
  description?: string;
}

export interface CreateCampaignResponse {
  campaign_id: string;
}

export interface CampaignStatusResponse {
  campaign_id: string;
  status: "pending" | "analyzing" | "generating" | "synthesizing" | "active" | "failed";
  progress?: number;
  handle?: string;
  pdf_url?: string;
  checkout_url?: string;
}

/**
 * Returns the public blueprint PDF download URL
 */
export function getBlueprintPdfUrl(campaignId: string): string {
  return `${AI_BASE_URL}/static/blueprints/${campaignId}.pdf`;
}

/**
 * Creates a new campaign by sending handle and optional drop description/idea to backend platform
 */
export async function createCampaign(
  handle: string,
  description?: string
): Promise<CreateCampaignResponse> {
  const normalizedHandle = handle.trim().startsWith("@")
    ? handle.trim()
    : `@${handle.trim()}`;

  const payload: CreateCampaignRequest = {
    handle: normalizedHandle,
  };

  if (description && description.trim()) {
    payload.description = description.trim();
  }

  const response = await fetch(`${API_BASE_URL}/api/platform/campaign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = "Erro ao criar campanha no servidor.";
    try {
      const errorJson = await response.json();
      if (errorJson?.detail) {
        errorDetail = Array.isArray(errorJson.detail)
          ? errorJson.detail.map((d: any) => d.msg || d).join(", ")
          : String(errorJson.detail);
      }
    } catch {
      // Fallback message
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetches campaign status (if endpoint available, or returns null if not implemented yet)
 */
export async function fetchCampaignStatus(
  campaignId: string
): Promise<CampaignStatusResponse | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/platform/campaign/${campaignId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Silently catch network errors if polling endpoint is in progress
  }
  return null;
}
