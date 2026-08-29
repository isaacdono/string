from typing import Any
from domain.interfaces import IOrderRepository


class GetOrderStatusUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    def execute(self, order_id: str) -> Any:
        """Retrieves payment order status details."""
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise KeyError("Order not found")
        return order
