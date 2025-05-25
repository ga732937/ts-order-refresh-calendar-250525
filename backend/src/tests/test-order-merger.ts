// backend/src/tests/test-order-merger.ts
import { OrderMerger } from '../shared/utils/orderMerger';
import { Order, OrderStatus } from '../shared/types/Order';
import { CalendarEvent } from '../shared/types/Calendar';

async function testOrderMerger() {
  console.log('Starting testOrderMerger...');

  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const order1: Order = {
    orderId: 'ORD-001', memberInfo: '張三 / 0911111111', products: '蛋糕 x1',
    pickupTime: `${todayDateStr} 14:00`, status: OrderStatus.READY_TO_SHIP, changeCount: 0, lastUpdated: now.toISOString()
  };
  const order2: Order = {
    orderId: 'ORD-002', memberInfo: '張三 / 0911111111', products: '咖啡 x2',
    pickupTime: `${todayDateStr} 14:30`, status: OrderStatus.READY_TO_SHIP, changeCount: 0, lastUpdated: now.toISOString()
  };
  const order3: Order = {
    orderId: 'ORD-003', memberInfo: '李四 / 0922222222', products: '麵包 x3',
    pickupTime: `${todayDateStr} 14:00`, status: OrderStatus.READY_TO_SHIP, changeCount: 0, lastUpdated: now.toISOString()
  };
  const order4: Order = { // Different date
    orderId: 'ORD-004', memberInfo: '張三 / 0911111111', products: '餅乾 x1',
    pickupTime: `2099-12-31 10:00`, status: OrderStatus.READY_TO_SHIP, changeCount: 0, lastUpdated: now.toISOString()
  };

  // Test shouldMergeOrders
  console.log('\nTesting shouldMergeOrders:');
  console.log(`order1 & order2 (same member, same day): Expected true, Got: ${OrderMerger.shouldMergeOrders(order1, order2)}`);
  console.log(`order1 & order3 (different member, same day): Expected false, Got: ${OrderMerger.shouldMergeOrders(order1, order3)}`);
  console.log(`order1 & order4 (same member, different day): Expected false, Got: ${OrderMerger.shouldMergeOrders(order1, order4)}`);

  // Test groupOrdersByMemberAndDate
  console.log('\nTesting groupOrdersByMemberAndDate:');
  const allOrders: Order[] = [order1, order2, order3, order4];
  const groupedOrders = OrderMerger.groupOrdersByMemberAndDate(allOrders);
  console.log(`Number of groups: Expected 3, Got: ${groupedOrders.length}`);
  groupedOrders.forEach((group, index) => {
    console.log(`Group ${index + 1} (member ${group[0].memberInfo.split(' / ')[0]}, date ${group[0].pickupTime.split(' ')[0]}): ${group.length} orders`);
    if (group[0].memberInfo.startsWith('張三') && group[0].pickupTime.startsWith(todayDateStr) && group.length !== 2) {
        console.error("Validation Error: Group for 張三 today should have 2 orders.");
    }
  });


  // Test mergeOrders
  console.log('\nTesting mergeOrders:');
  // Find the group belonging to '張三' for merging test
  const ordersToMerge = groupedOrders.find(group => 
    group.length > 1 && group[0].memberInfo.startsWith('張三')
  );
  if (ordersToMerge) {
    const mergedEvent: CalendarEvent = OrderMerger.mergeOrders(ordersToMerge);
    console.log('Merged Event Summary:', mergedEvent.summary);
    console.log('Merged Event Description (contains product list):\n', mergedEvent.description);
    console.log('Merged Event Start:', mergedEvent.start); // Should be order1's time
    console.log('Merged Event End:', mergedEvent.end);

    if (!mergedEvent.summary.includes('共2筆訂單') || !mergedEvent.summary.includes('張三')) {
        console.error("Validation Error: Merged summary is incorrect.");
    }
    if (!mergedEvent.description.includes(order1.products) || !mergedEvent.description.includes(order2.products)) {
        console.error("Validation Error: Merged description missing product info.");
    }
    const expectedStartTime = new Date(`${todayDateStr} 14:00`).toISOString();
    if (mergedEvent.start !== expectedStartTime) {
        console.error(`Validation Error: Merged start time is incorrect. Expected ${expectedStartTime}, Got ${mergedEvent.start}`);
    }

  } else {
    console.error('Could not find group for 張三 to test mergeOrders.');
  }
  
  console.log('\nTest an empty list for mergeOrders (expect throw):');
  try {
    OrderMerger.mergeOrders([]);
  } catch (e: any) {
    console.log('Caught expected error for empty list:', e.message);
  }

  console.log('\nTest an empty list for groupOrdersByMemberAndDate:');
  const emptyGroups = OrderMerger.groupOrdersByMemberAndDate([]);
  console.log(`Number of groups for empty list: Expected 0, Got: ${emptyGroups.length}`);


}

testOrderMerger()
  .then(() => console.log('\ntestOrderMerger finished.'))
  .catch(e => console.error('Unhandled error in testOrderMerger:', e));
