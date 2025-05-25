// backend/src/shared/utils/orderMerger.ts
import { Order, OrderStatus } from '../types/Order'; // Adjust path as needed
import { CalendarEvent } from '../types/Calendar';   // Adjust path as needed

export class OrderMerger {
  // Helper to get just the date part of a pickupTime string
  private static getPickupDate(pickupTime: string): string {
    return pickupTime.split(' ')[0];
  }

  // Helper to get member name (assuming "姓名 / 電話" format)
  private static getMemberName(memberInfo: string): string {
    return memberInfo.split(' / ')[0];
  }

  static shouldMergeOrders(order1: Order, order2: Order): boolean {
    if (!order1 || !order2) return false;
    
    const date1 = OrderMerger.getPickupDate(order1.pickupTime);
    const date2 = OrderMerger.getPickupDate(order2.pickupTime);
    const member1 = OrderMerger.getMemberName(order1.memberInfo);
    const member2 = OrderMerger.getMemberName(order2.memberInfo);

    return date1 === date2 && member1 === member2;
  }

  static mergeOrders(ordersToMerge: Order[]): CalendarEvent {
    if (!ordersToMerge || ordersToMerge.length === 0) {
      throw new Error('Cannot merge an empty list of orders.');
    }

    // Sort orders by pickup time to ensure the earliest is used for the event start
    const sortedOrders = [...ordersToMerge].sort((a, b) => 
      new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime()
    );

    const firstOrder = sortedOrders[0];
    const memberName = OrderMerger.getMemberName(firstOrder.memberInfo);
    
    const summary = `${memberName} - 領取 (共${sortedOrders.length}筆訂單)`;
    
    const productList = sortedOrders.map(order => 
      `  - 訂單 ${order.orderId}: ${order.products}`
    ).join('\n');
    const description = `合併訂單詳情:\n${productList}`;

    // Use the earliest pickup time for the event start
    // Assuming pickupTime is like "YYYY-MM-DD HH:mm"
    // For simplicity, event duration is 30 mins from the earliest pickup time.
    // This could be made more sophisticated if needed.
    const startTime = new Date(firstOrder.pickupTime);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

    return {
      summary: summary,
      description: description,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      // Consider a default color for merged events, or make it configurable
      colorId: '1', // Default to blue, as per tasks.md for new events
    };
  }

  static groupOrdersByMemberAndDate(orders: Order[]): Order[][] {
    if (!orders || orders.length === 0) {
      return [];
    }

    const groups: { [key: string]: Order[] } = {};

    for (const order of orders) {
      // Only group orders that are eligible for calendar events (e.g., READY_TO_SHIP)
      // Task 5.2 (calendarUpdater) filters for READY_TO_SHIP before potentially merging.
      // So, this grouping function can assume input orders are already filtered if needed,
      // or it can be generic. Let's keep it generic for now.
      const date = OrderMerger.getPickupDate(order.pickupTime);
      const memberName = OrderMerger.getMemberName(order.memberInfo);
      const key = `${date}_${memberName}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
    }
    
    return Object.values(groups);
  }
}
