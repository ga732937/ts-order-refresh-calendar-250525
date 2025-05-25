// backend/src/shared/types/Order.ts
export interface Order {
  orderId: string;
  memberInfo: string;
  products: string;
  pickupTime: string;
  status: OrderStatus;
  changeCount: number;
  lastUpdated: string;
}

export enum OrderStatus {
  PENDING = '待處理',
  READY_TO_SHIP = '準備出貨',
  SHIPPED = '已出貨'
}
