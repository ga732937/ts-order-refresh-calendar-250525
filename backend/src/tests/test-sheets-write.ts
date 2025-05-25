// backend/src/tests/test-sheets-write.ts
import { GoogleSheetsClient } from '../shared/services/GoogleSheetsClient';
import { OrderStatus } from '../shared/types/Order';

const MOCK_CREDENTIALS = { client_email: 'test@example.com', private_key: 'test_key_for_initialization_only' };
const MOCK_SHEET_ID = 'test-sheet-id';

async function testSheetsWrite() {
  console.log('Starting testSheetsWrite...');
  const client = new GoogleSheetsClient(MOCK_CREDENTIALS);

      let updateCalledWith: any = null; // Explicitly type as any for the mock
      let appendCalledWith: any = null; // Explicitly type as any for the mock
  let getCalledForUpdate = false;

  // Mock Sheets API methods
  client['sheets'] = {
    spreadsheets: {
      values: {
        get: async (params: any) => { // Mock for finding row in updateOrderStatus
          getCalledForUpdate = true;
          console.log('Mocked sheets.get called with:', params);
          if (params.range === 'Orders!A:G' && params.spreadsheetId === MOCK_SHEET_ID) {
            return {
              data: {
                values: [
                  ['訂單ID', '會員資訊', '商品', '領取時間', '訂單狀態', '更改次數', '最後更新時間'],
                  ['ORD-001', '張三', '蛋糕', '2024-01-15', OrderStatus.PENDING, '0', '2024-01-14'],
                  ['ORD-002', '李四', '咖啡', '2024-01-16', OrderStatus.PENDING, '1', '2024-01-15'],
                ],
              },
            };
          }
          return { data: { values: [] } };
        },
        update: async (params: any) => {
          console.log('Mocked sheets.update called with:', params);
          updateCalledWith = params;
          return { data: {} }; // Mock successful update
        },
        append: async (params: any) => {
          console.log('Mocked sheets.append called with:', params);
          appendCalledWith = params;
          return { data: {} }; // Mock successful append
        },
      },
    },
  } as any;

  try {
    // Test updateOrderStatus
    const orderIdToUpdate = 'ORD-001';
    const newStatus = OrderStatus.READY_TO_SHIP;
    await client.updateOrderStatus(MOCK_SHEET_ID, orderIdToUpdate, newStatus);

    if (getCalledForUpdate && updateCalledWith) {
      console.log('testSheetsWrite: updateOrderStatus mock was called successfully.');
      // Add more specific assertions for params if needed
      if (updateCalledWith.requestBody.values[0][0] !== newStatus) {
         console.error("Validation Error: New status not set correctly in update call.");
      }
      if (parseInt(updateCalledWith.requestBody.values[0][1],10) !== 1) { // 0 existing + 1
         console.error("Validation Error: Change count not incremented correctly.");
      }
    } else {
      console.error('testSheetsWrite: updateOrderStatus mock was NOT called or get was not called.');
    }

    // Test logSystemAction
    await client.logSystemAction(MOCK_SHEET_ID, 'TEST_ACTION', 'SUCCESS', 'Test details');
    if (appendCalledWith) {
      console.log('testSheetsWrite: logSystemAction mock was called successfully.');
      if (appendCalledWith.requestBody.values[0][1] !== 'TEST_ACTION') {
        console.error("Validation Error: Action not set correctly in append call.");
      }
    } else {
      console.error('testSheetsWrite: logSystemAction mock was NOT called.');
    }

  } catch (error) {
    console.error('testSheetsWrite failed:', error instanceof Error ? error.message : String(error));
  }
}

testSheetsWrite().then(() => console.log('testSheetsWrite finished.')).catch(e => console.error('Unhandled error in testSheetsWrite:', e));
