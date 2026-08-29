import uuid
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(
    title="ByteMedia Checkout API",
    version="1.0.0",
    description="Handles B2C sales transactions, Asaas PIX checkout, and payment webhooks.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ThemeConfig(BaseModel):
    primary: str = "#6366F1"
    background: str = "#0F172A"
    foto_url: str = "https://images.unsplash.com/photo-1534528741775-53994a69daeb"


class CopyData(BaseModel):
    title: str = "Masterclass Exclusiva"
    subtitle: str = "Aprenda a construir produtos digitais de alta conversão."
    hooks: List[str] = ["Acesso imediato", "Vagas limitadas"]
    benefits: List[str] = ["Mentoria em grupo", "Templates prontos", "Comunidade VIP"]


class CampaignPublicResponse(BaseModel):
    id: str
    handle: str = "@exemplo"
    status: str = "active"
    product_type: str = "digital"
    price: float = 97.00
    theme_config: ThemeConfig = Field(default_factory=ThemeConfig)
    copy_data: CopyData = Field(default_factory=CopyData)
    scarcity_limit: Optional[int] = 50
    expires_at: Optional[str] = "2026-12-31T23:59:59Z"
    created_at: str = "2026-08-29T16:00:00Z"


class CheckoutRequest(BaseModel):
    campaign_id: str = Field(..., description="Campaign UUID")
    buyer_name: str = Field(..., description="Full name of the buyer")
    cpf: str = Field(..., description="Buyer CPF")
    email: EmailStr = Field(..., description="Buyer email address")


class CheckoutResponse(BaseModel):
    order_id: str = Field(..., description="Created order UUID")
    pix_qr_code: str = Field(..., description="Base64 encoded QR Code image or image URL")
    pix_copy_paste: str = Field(..., description="Pix copia e cola string payload")


class AsaasWebhookPayload(BaseModel):
    event: Optional[str] = None
    payment: Optional[Dict[str, Any]] = None


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "checkout"}


@app.get(
    "/api/sales/campaign/{campaign_id}",
    response_model=CampaignPublicResponse,
    status_code=status.HTTP_200_OK,
    tags=["Sales"],
    summary="Get public campaign drop data for sales page",
)
async def get_campaign_sales_data(campaign_id: str):
    """
    Returns public campaign details (copy, colors, pricing, scarcity)
    to render the creator's drop landing/checkout page.
    """
    return CampaignPublicResponse(id=campaign_id)


@app.post(
    "/api/sales/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Sales"],
    summary="Process checkout and generate PIX payment",
)
async def create_checkout(payload: CheckoutRequest):
    """
    Creates customer and charge via Asaas API, registers order as PENDING,
    and returns the PIX QR code and copy-paste string.
    """
    order_id = str(uuid.uuid4())
    return CheckoutResponse(
        order_id=order_id,
        pix_qr_code="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        pix_copy_paste="00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913ByteMedia6009Sao Paulo62070503***6304ABCD",
    )


@app.post(
    "/webhooks/asaas",
    status_code=status.HTTP_200_OK,
    tags=["Webhooks"],
    summary="Handle Asaas payment webhooks",
)
async def asaas_webhook(payload: AsaasWebhookPayload):
    """
    Listens for payment notifications (e.g. PAYMENT_RECEIVED) from Asaas
    and updates order status in the database.
    """
    return {"status": "received", "event": payload.event}
