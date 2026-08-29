from typing import Any
from domain.interfaces import IOrderRepository


class SimulatePaymentUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    def execute(self, order_id: str) -> Any:
        """Simulates payment completion by transitioning order status to PAID."""
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise KeyError("Order not found")

        order.status = "PAID"
        return self.order_repo.save(order)
