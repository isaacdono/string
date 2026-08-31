import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Infrastructure
from infrastructure.database import get_db, init_db
from infrastructure.models import Order


# Adapters
from adapters.repositories import SQLAlchemyCampaignRepository, SQLAlchemyOrderRepository

# UseCases
from usecases.get_campaign import GetCampaignSalesDataUseCase
from usecases.create_order import CreateOrderUseCase
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
    paid_orders_count: int = 0



class CheckoutRequest(BaseModel):
    campaign_id: str = Field(..., description="Campaign UUID")


class CheckoutResponse(BaseModel):
    order_id: str = Field(..., description="ID do pedido")
    checkout_url: str = Field(..., description="URL de checkout do Mercado Pago")


class OrderStatusResponse(BaseModel):
    order_id: str
    campaign_id: str
    status: str
    buyer_name: str
    buyer_email: str
    created_at: str



class AsaasWebhookPayload(BaseModel):
    event: Optional[str] = None
    payment: Optional[Dict[str, Any]] = None


class MercadoPagoWebhookPayload(BaseModel):
    id: Optional[Any] = None
    live_mode: Optional[bool] = None
    type: Optional[str] = None
    date_created: Optional[str] = None
    user_id: Optional[str] = None
    api_version: Optional[str] = None
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


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
    db: Session = Depends(get_db),
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

        paid_orders_count = db.query(Order).filter(Order.campaign_id == campaign.id, Order.status == "PAID").count()

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
            paid_orders_count=paid_orders_count,
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
    summary="Process checkout and generate Mercado Pago payment",
)
async def create_checkout(
    payload: CheckoutRequest,
    use_case: CreateOrderUseCase = Depends(get_create_order_use_case),
    campaign_repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
):
    """
    Registers a PENDING order in PostgreSQL and returns Mercado Pago Checkout Pro URL.
    """
    try:
        campaign = campaign_repo.get_by_id(payload.campaign_id)
        if not campaign:
            raise KeyError("Campaign not found")

        order = use_case.execute(
            payload.campaign_id,
            "Pendente MP",
            "pendente@mercadopago.com",
            "00000000000",
        )

        token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
        if not token:
            logger.error("MERCADO_PAGO_ACCESS_TOKEN not configured in environment.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Chave do Mercado Pago (MERCADO_PAGO_ACCESS_TOKEN) ausente no ambiente."
            )

        url = "https://api.mercadopago.com/v1/checkout/preferences"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        title = (campaign.copy_data or {}).get("title") or "Masterclass Exclusiva"
        price_val = float(campaign.price) if campaign.price is not None else 97.00
        back_url = f"http://localhost:3001/d/{payload.campaign_id}?status=success&order_id={order.id}"

        data = {
            "items": [
                {
                    "title": title,
                    "quantity": 1,
                    "unit_price": price_val,
                    "currency_id": "BRL"
                }
            ],
            "back_urls": {
                "success": back_url,
                "failure": back_url,
                "pending": back_url
            },
            "auto_return": "approved",
            "external_reference": str(order.id)
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            if response.status_code >= 400:
                logger.error(f"Mercado Pago preference creation failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Mercado Pago API error: {response.text}"
                )
            res_json = response.json()

        checkout_url = res_json.get("sandbox_init_point") or res_json.get("init_point")
        if not checkout_url:
            logger.error(f"Mercado Pago response missing init_point fields: {res_json}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Mercado Pago API returned response without init points."
            )

        preference_id = res_json.get("id")
        if preference_id:
            order.asaas_payment_id = preference_id
            order_repo.save(order)

        return CheckoutResponse(
            order_id=str(order.id),
            checkout_url=checkout_url,
        )
    except HTTPException:
        raise
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
    except Exception as e:
        logger.exception("Unexpected error during checkout creation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
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


@app.post(
    "/webhooks/mercadopago",
    status_code=status.HTTP_200_OK,
    tags=["Webhooks"],
    summary="Handle Mercado Pago payment webhooks",
)
async def mercadopago_webhook(
    payload: MercadoPagoWebhookPayload,
    order_repo: SQLAlchemyOrderRepository = Depends(get_order_repository),
):
    """
    Listens for payment notifications from Mercado Pago,
    fetches payment status, and updates the order status to PAID.
    """
    if payload.type == "payment":
        payment_id = None
        if payload.data and "id" in payload.data:
            payment_id = payload.data["id"]
        elif payload.id:
            payment_id = payload.id

        if not payment_id:
            logger.warning("Mercado Pago webhook received payment type but no payment ID was found.")
            return {"status": "ignored", "detail": "No payment ID found"}

        token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
        if not token:
            logger.warning("Mercado Pago Access Token not configured. Cannot verify webhook payment.")
            return {"status": "ignored", "detail": "Token not configured"}

        url = f"https://api.mercadopago.com/v1/payments/{payment_id}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code != 200:
                    logger.error(f"Failed to fetch payment details from Mercado Pago: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Failed to fetch payment from gateway"
                    )
                payment_data = response.json()
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Error calling Mercado Pago payments API in webhook")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error connecting to Mercado Pago API: {str(e)}"
            )

        status_val = payment_data.get("status")
        external_reference = payment_data.get("external_reference")

        if status_val == "approved" and external_reference:
            order = order_repo.get_by_id(external_reference)
            if order:
                order.status = "PAID"
                order_repo.save(order)
                logger.info(f"Order {external_reference} marked as PAID via Mercado Pago webhook.")
                return {"status": "updated", "order_id": external_reference}
            else:
                logger.warning(f"Order {external_reference} not found in database.")
                return {"status": "ignored", "detail": "Order not found"}
        else:
            return {"status": "ignored", "detail": f"Status is {status_val} or no external_reference"}

    return {"status": "ignored", "detail": f"Type is {payload.type}, not payment"}
