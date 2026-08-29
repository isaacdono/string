from typing import Any, Dict, Optional
from domain.interfaces import IOrderRepository


class HandlePaymentWebhookUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    def execute(self, event: Optional[str], payment: Optional[Dict[str, Any]]) -> None:
        """Processes payment gateway webhook payloads to set order status to PAID."""
        if payment and "id" in payment:
            asaas_payment_id = payment["id"]
            order = self.order_repo.get_by_asaas_payment_id(asaas_payment_id)
            if order and event == "PAYMENT_RECEIVED":
                order.status = "PAID"
                self.order_repo.save(order)
