import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

# Infrastructure
from infrastructure.database import get_db, init_db

# Adapters
from adapters.repositories import SQLAlchemyCampaignRepository, SQLAlchemyOrderRepository

# UseCases
from usecases.get_campaign import GetCampaignSalesDataUseCase
from usecases.create_order import CreateOrderUseCase
from usecases.simulate_payment import SimulatePaymentUseCase
from usecases.get_order_status import GetOrderStatusUseCase
from usecases.handle_payment_webhook import HandlePaymentWebhookUseCase

logger = logging.getLogger("checkout.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup via infrastructure
    init_db()
    yield


app = FastAPI(
    title="ByteMedia Checkout API",
    version="1.0.0",
    description="Handles B2C sales transactions, Asaas PIX checkout, and payment webhooks.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# DTO Schemas
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
    description: Optional[str] = None
    status: str = "active"
    product_type: str = "digital"
    price: float = 97.00
    theme_config: ThemeConfig = Field(default_factory=ThemeConfig)
    copy_data: CopyData = Field(default_factory=CopyData)
    scarcity_limit: Optional[int] = 50
    blueprint_content: Optional[str] = None
    pdf_url: Optional[str] = None
    expires_at: Optional[str] = None
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


class OrderStatusResponse(BaseModel):
    order_id: str
    campaign_id: str
    status: str
    buyer_name: str
    buyer_email: str
    created_at: str


class SimulatePaymentResponse(BaseModel):
    order_id: str
    status: str
    message: str


class AsaasWebhookPayload(BaseModel):
    event: Optional[str] = None
    payment: Optional[Dict[str, Any]] = None


# Dependency Injection Helpers
def get_campaign_repository(db: Session = Depends(get_db)) -> SQLAlchemyCampaignRepository:
    return SQLAlchemyCampaignRepository(db)


def get_order_repository(db: Session = Depends(get_db)) -> SQLAlchemyOrderRepository:
    return SQLAlchemyOrderRepository(db)


def get_campaign_sales_data_use_case(
    repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
) -> GetCampaignSalesDataUseCase:
    return GetCampaignSalesDataUseCase(repo)


def get_create_order_use_case(
    campaign_repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
) -> CreateOrderUseCase:
    return CreateOrderUseCase(campaign_repo, order_repo)


def get_simulate_payment_use_case(
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
) -> SimulatePaymentUseCase:
    return SimulatePaymentUseCase(order_repo)


def get_order_status_use_case(
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
) -> GetOrderStatusUseCase:
    return GetOrderStatusUseCase(order_repo)


def get_handle_payment_webhook_use_case(
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
) -> HandlePaymentWebhookUseCase:
    return HandlePaymentWebhookUseCase(order_repo)


# Routes
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
async def get_campaign_sales_data(
    campaign_id: str,
    use_case: GetCampaignSalesDataUseCase = Depends(get_campaign_sales_data_use_case),
):
    """
    Returns public campaign details (copy, colors, pricing, scarcity)
    from PostgreSQL to render the creator's drop landing/checkout page.
    """
    try:
        campaign = use_case.execute(campaign_id)
        theme_raw = campaign.theme_config or {}
        copy_raw = campaign.copy_data or {}

        theme_config = ThemeConfig(
            primary=theme_raw.get("primary") or theme_raw.get("primary_color") or "#6366F1",
            background=theme_raw.get("background") or theme_raw.get("background_color") or "#0F172A",
            foto_url=theme_raw.get("foto_url") or theme_raw.get("avatar_url") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        )

        copy_data = CopyData(
            title=copy_raw.get("title") or "Masterclass Exclusiva",
            subtitle=copy_raw.get("subtitle") or "Aprenda a construir produtos digitais de alta conversão.",
            hooks=copy_raw.get("hooks") or ["Acesso imediato", "Vagas limitadas"],
            benefits=copy_raw.get("benefits") or ["Mentoria em grupo", "Templates prontos", "Comunidade VIP"],
        )

        price_val = float(campaign.price) if campaign.price is not None else 97.00
        created_at_val = campaign.created_at.isoformat() if campaign.created_at else "2026-08-29T16:00:00Z"
        expires_at_val = campaign.expires_at.isoformat() if campaign.expires_at else None

        return CampaignPublicResponse(
            id=str(campaign.id),
            handle=campaign.handle,
            description=campaign.description,
            status=campaign.status or "active",
            product_type=campaign.product_type or "digital",
            price=price_val,
            theme_config=theme_config,
            copy_data=copy_data,
            scarcity_limit=campaign.scarcity_limit,
            blueprint_content=campaign.blueprint_content,
            pdf_url=campaign.pdf_url,
            expires_at=expires_at_val,
            created_at=created_at_val,
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )


@app.post(
    "/api/sales/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Sales"],
    summary="Process checkout and generate PIX payment",
)
async def create_checkout(
    payload: CheckoutRequest,
    use_case: CreateOrderUseCase = Depends(get_create_order_use_case),
):
    """
    Registers a PENDING order in PostgreSQL and returns mock Pix payment details.
    """
    try:
        order = use_case.execute(
            payload.campaign_id,
            payload.buyer_name,
            payload.email,
            payload.cpf,
        )
        return CheckoutResponse(
            order_id=str(order.id),
            pix_qr_code="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            pix_copy_paste=f"00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913ByteMedia6009Sao Paulo62070503***6304{str(order.id)[:4].upper()}",
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.post(
    "/api/sales/order/{order_id}/simulate-pay",
    response_model=SimulatePaymentResponse,
    status_code=status.HTTP_200_OK,
    tags=["Sales"],
    summary="Simulate payment confirmation for testing checkout UX",
)
async def simulate_order_payment(
    order_id: str,
    use_case: SimulatePaymentUseCase = Depends(get_simulate_payment_use_case),
):
    """
    Simulates payment confirmation by updating the order status to PAID.
    """
    try:
        order = use_case.execute(order_id)
        return SimulatePaymentResponse(
            order_id=str(order.id),
            status="PAID",
            message="Payment confirmed successfully (simulated)",
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )


@app.get(
    "/api/sales/order/{order_id}/status",
    response_model=OrderStatusResponse,
    status_code=status.HTTP_200_OK,
    tags=["Sales"],
    summary="Get current payment status for an order",
)
async def get_order_status(
    order_id: str,
    use_case: GetOrderStatusUseCase = Depends(get_order_status_use_case),
):
    """
    Returns current status (PENDING, PAID, FAILED) of an order.
    """
    try:
        order = use_case.execute(order_id)
        return OrderStatusResponse(
            order_id=str(order.id),
            campaign_id=str(order.campaign_id),
            status=order.status,
            buyer_name=order.buyer_name,
            buyer_email=order.buyer_email,
            created_at=order.created_at.isoformat() if order.created_at else "2026-08-29T16:00:00Z",
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )


@app.post(
    "/webhooks/asaas",
    status_code=status.HTTP_200_OK,
    tags=["Webhooks"],
    summary="Handle Asaas payment webhooks",
)
async def asaas_webhook(
    payload: AsaasWebhookPayload,
    use_case: HandlePaymentWebhookUseCase = Depends(get_handle_payment_webhook_use_case),
):
    """
    Listens for payment notifications (e.g. PAYMENT_RECEIVED) from Asaas
    and updates order status in the database.
    """
    use_case.execute(payload.event, payload.payment)
    return {"status": "received", "event": payload.event}
