export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

export interface ThemeConfig {
  primary: string;
  background: string;
  foto_url?: string;
}

export interface CopyData {
  title: string;
  subtitle: string;
  format?: string;
  hooks: string[];
  benefits: string[];
  social_proof_quotes?: Array<{
    user: string;
    avatar?: string;
    comment: string;
  }>;
}

export interface CampaignSalesData {
  id: string;
  handle: string;
  status: string;
  product_type: string;
  price: number;
  theme_config: ThemeConfig;
  copy_data: CopyData;
  scarcity_limit?: number | null;
  expires_at?: string | null;
  created_at?: string;
  paid_orders_count: number;
}


export interface CheckoutPayload {
  campaign_id: string;
}

export interface CheckoutResponse {
  order_id: string;
  checkout_url: string;
}

export interface OrderStatusResponse {
  order_id: string;
  status: "PENDING" | "PAID" | "FAILED";
}

/**
 * Fetches campaign sales landing page data
 */
export async function fetchCampaignSalesData(
  campaignId: string
): Promise<CampaignSalesData> {
  const response = await fetch(
    `${API_BASE_URL}/api/sales/campaign/${campaignId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Falha ao carregar dados do Drop (${response.status}: ${response.statusText})`
    );
  }

  return response.json();
}

/**
 * Submits checkout information to generate PIX payment
 */
export async function createCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sales/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Erro ao processar o checkout.";
    try {
      const err = await response.json();
      if (err.detail) {
        message = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
      }
    } catch {
      // Fallback
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Polls order payment status
 */
export async function getOrderStatus(
  orderId: string
): Promise<OrderStatusResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/sales/order/${orderId}/status`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao verificar status do pedido.");
  }

  return response.json();
}

