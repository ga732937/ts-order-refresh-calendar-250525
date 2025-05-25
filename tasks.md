# 訂單日曆自動化系統 MVP 開發計劃

## 專案概述
本計劃將指導您逐步建立訂單日曆自動化系統的最小可行產品 (MVP)。每個任務都設計得非常具體且可測試，確保可以交由工程 LLM 逐一完成。

## 開發原則
- ✅ 每個任務完成時間不超過 30 分鐘
- ✅ 任務之間有明確的測試點
- ✅ 專注於核心功能，避免過度設計
- ✅ 優先實現端到端的基本流程

---

## 階段 1: 環境設置與基礎配置

### 任務 1.1: 建立專案結構
**目標**: 建立完整的專案資料夾結構

**輸入條件**: 無

**任務內容**:
```bash
建立以下資料夾結構：
order-calendar-automation/
├── README.md
├── .gitignore
├── package.json
├── frontend/
├── backend/
├── config/
├── scripts/
└── docs/
```

**輸出結果**:
- 完整的資料夾結構
- 基本的 README.md 說明檔
- .gitignore 檔案 (包含 node_modules, .env, credentials)

**驗證方式**: 
```bash
ls -la order-calendar-automation/
tree order-calendar-automation/ -L 2
```

**預估時間**: 5 分鐘

---

### 任務 1.2: 設定 TypeScript 配置
**目標**: 建立共用的 TypeScript 配置檔

**輸入條件**: 任務 1.1 完成

**任務內容**:
1. 建立根目錄的 `tsconfig.json`
2. 建立後端的 `backend/tsconfig.json`
3. 建立前端的 `frontend/tsconfig.json`

**輸出結果**:
- 根目錄 tsconfig.json (基礎配置)
- 後端 tsconfig.json (Node.js 環境)
- 前端 tsconfig.json (React 環境)

**驗證方式**:
```bash
npx tsc --noEmit --project backend/
npx tsc --noEmit --project frontend/
```

**預估時間**: 10 分鐘

---

### 任務 1.3: 建立共用類型定義
**目標**: 定義系統中使用的核心資料類型

**輸入條件**: 任務 1.2 完成

**任務內容**:
建立 `backend/src/shared/types/` 中的類型檔案：
- `Order.ts` - 訂單相關類型
- `Calendar.ts` - 日曆事件類型
- `System.ts` - 系統配置類型

**輸出結果**:
```typescript
// Order.ts
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

// Calendar.ts
export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  colorId?: string;
}

// System.ts
export interface SystemConfig {
  google: {
    projectId: string;
    sheetsId: string;
    calendarId: string;
  };
  linebot: {
    channelAccessToken: string;
  };
}
```

**驗證方式**:
```bash
npx tsc --noEmit backend/src/shared/types/Order.ts
npx tsc --noEmit backend/src/shared/types/Calendar.ts
npx tsc --noEmit backend/src/shared/types/System.ts
```

**預估時間**: 15 分鐘

---

## 階段 2: Google Sheets 整合

### 任務 2.1: 建立 Google Sheets 客戶端
**目標**: 建立連接 Google Sheets 的基礎服務

**輸入條件**: 任務 1.3 完成

**任務內容**:
建立 `backend/src/shared/services/GoogleSheetsClient.ts`

**輸出結果**:
```typescript
export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  
  constructor(credentials: any) {
    // 初始化 Google Sheets 客戶端
  }
  
  async readOrderData(sheetId: string, range: string): Promise<Order[]> {
    // 讀取訂單資料並轉換為 Order 物件陣列
  }
  
  async updateOrderStatus(sheetId: string, orderId: string, status: OrderStatus): Promise<void> {
    // 更新特定訂單的狀態
  }
  
  async logSystemAction(sheetId: string, action: string, result: string): Promise<void> {
    // 記錄系統操作日誌
  }
}
```

**驗證方式**:
```bash
# 建立簡單的測試檔案來驗證類別可以正確實例化
node -e "require('./backend/dist/shared/services/GoogleSheetsClient.js')"
```

**預估時間**: 25 分鐘

---

### 任務 2.2: 實作 Google Sheets 讀取功能
**目標**: 實作從 Google Sheets 讀取訂單資料的功能

**輸入條件**: 任務 2.1 完成，需要有效的 Google Sheets ID 和憑證

**任務內容**:
完成 `GoogleSheetsClient.readOrderData()` 方法的實作

**輸出結果**:
- 能夠連接到指定的 Google Sheets
- 解析 A1:G100 範圍的訂單資料
- 將原始資料轉換為 Order 物件陣列
- 處理空白列和無效資料

**驗證方式**:
建立測試腳本 `backend/src/tests/test-sheets-read.ts`:
```typescript
async function testSheetsRead() {
  const client = new GoogleSheetsClient(credentials);
  const orders = await client.readOrderData(SHEET_ID, 'Orders!A1:G100');
  console.log(`讀取到 ${orders.length} 筆訂單`);
  console.log('第一筆訂單:', orders[0]);
}
```

**預估時間**: 30 分鐘

---

### 任務 2.3: 實作 Google Sheets 寫入功能
**目標**: 實作更新訂單狀態和記錄日誌的功能

**輸入條件**: 任務 2.2 完成且測試通過

**任務內容**:
完成 `GoogleSheetsClient` 的寫入方法：
- `updateOrderStatus()` - 更新訂單狀態
- `logSystemAction()` - 記錄系統日誌

**輸出結果**:
- 能夠更新指定訂單的狀態欄位
- 能夠在日誌工作表中新增記錄
- 包含錯誤處理和重試機制

**驗證方式**:
建立測試腳本 `backend/src/tests/test-sheets-write.ts`:
```typescript
async function testSheetsWrite() {
  const client = new GoogleSheetsClient(credentials);
  
  // 測試更新訂單狀態
  await client.updateOrderStatus(SHEET_ID, 'ORD-001', OrderStatus.READY_TO_SHIP);
  
  // 測試記錄日誌
  await client.logSystemAction(SHEET_ID, 'TEST', '測試寫入功能成功');
  
  console.log('寫入測試完成');
}
```

**預估時間**: 25 分鐘

---

## 階段 3: Google Calendar 整合

### 任務 3.1: 建立 Google Calendar 客戶端
**目標**: 建立連接 Google Calendar 的基礎服務

**輸入條件**: 任務 2.3 完成

**任務內容**:
建立 `backend/src/shared/services/GoogleCalendarClient.ts`

**輸出結果**:
```typescript
export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  
  constructor(credentials: any) {
    // 初始化 Google Calendar 客戶端
  }
  
  async createEvent(calendarId: string, event: CalendarEvent): Promise<string> {
    // 建立新的日曆事件，回傳事件 ID
  }
  
  async updateEvent(calendarId: string, eventId: string, event: CalendarEvent): Promise<void> {
    // 更新現有日曆事件
  }
  
  async getEventsByDate(calendarId: string, date: string): Promise<CalendarEvent[]> {
    // 取得指定日期的所有事件
  }
  
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    // 刪除日曆事件
  }
}
```

**驗證方式**:
```bash
npx tsc backend/src/shared/services/GoogleCalendarClient.ts
```

**預估時間**: 20 分鐘

---

### 任務 3.2: 實作日曆事件建立功能
**目標**: 實作建立和更新 Google Calendar 事件的功能

**輸入條件**: 任務 3.1 完成，需要有效的 Calendar ID 和憑證

**任務內容**:
完成 `GoogleCalendarClient` 的事件操作方法

**輸出結果**:
- 能夠建立新的日曆事件
- 設定正確的開始和結束時間
- 設定事件顏色 (預設藍色)
- 包含訂單資訊在事件描述中

**驗證方式**:
建立測試腳本 `backend/src/tests/test-calendar.ts`:
```typescript
async function testCalendarCreate() {
  const client = new GoogleCalendarClient(credentials);
  
  const testEvent: CalendarEvent = {
    summary: '張三 - 訂單領取',
    description: '商品: 蛋糕 x2\n訂單ID: ORD-001',
    start: '2024-01-15T14:00:00+08:00',
    end: '2024-01-15T14:30:00+08:00',
    colorId: '1' // 藍色
  };
  
  const eventId = await client.createEvent(CALENDAR_ID, testEvent);
  console.log('建立事件成功，ID:', eventId);
}
```

**預估時間**: 30 分鐘

---

### 任務 3.3: 實作訂單合併邏輯
**目標**: 實作同一天同一會員的訂單合併功能

**輸入條件**: 任務 3.2 完成且測試通過

**任務內容**:
建立 `backend/src/shared/utils/orderMerger.ts`

**輸出結果**:
```typescript
export class OrderMerger {
  static shouldMergeOrders(order1: Order, order2: Order): boolean {
    // 判斷兩個訂單是否應該合併 (同一天 + 同一會員)
  }
  
  static mergeOrders(orders: Order[]): CalendarEvent {
    // 將多個訂單合併為單一日曆事件
    // 標題: "會員姓名 - 領取 (共X筆訂單)"
    // 內容: 列出所有商品清單
    // 時間: 使用最早的領取時間
  }
  
  static groupOrdersByMemberAndDate(orders: Order[]): Order[][] {
    // 將訂單按會員和日期分組
  }
}
```

**驗證方式**:
建立測試腳本 `backend/src/tests/test-order-merger.ts`:
```typescript
async function testOrderMerger() {
  const orders = [
    { /* 張三 2024-01-15 的訂單1 */ },
    { /* 張三 2024-01-15 的訂單2 */ },
    { /* 李四 2024-01-15 的訂單1 */ }
  ];
  
  const groups = OrderMerger.groupOrdersByMemberAndDate(orders);
  console.log('分組結果:', groups.length);
  
  const mergedEvent = OrderMerger.mergeOrders(groups[0]);
  console.log('合併事件:', mergedEvent.summary);
}
```

**預估時間**: 25 分鐘

---

## 階段 4: Line Bot 整合

### 任務 4.1: 建立 Line Bot 客戶端
**目標**: 建立 Line Bot 訊息發送服務

**輸入條件**: 任務 3.3 完成

**任務內容**:
建立 `backend/src/shared/services/LineBotClient.ts`

**輸出結果**:
```typescript
export class LineBotClient {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  async sendTextMessage(userId: string, message: string): Promise<void> {
    // 發送純文字訊息
  }
  
  async sendOrderNotification(userId: string, order: Order): Promise<void> {
    // 發送格式化的訂單通知訊息
  }
  
  async broadcastMessage(message: string): Promise<void> {
    // 群發訊息給所有使用者
  }
}
```

**驗證方式**:
```bash
npx tsc backend/src/shared/services/LineBotClient.ts
```

**預估時間**: 15 分鐘

---

### 任務 4.2: 實作 Line Bot 訊息發送功能
**目標**: 實作發送 Line 通知訊息的功能

**輸入條件**: 任務 4.1 完成，需要有效的 Line Bot Token

**任務內容**:
完成 `LineBotClient` 的訊息發送方法

**輸出結果**:
- 能夠發送純文字訊息
- 能夠發送格式化的訂單通知
- 包含錯誤處理和重試機制

**驗證方式**:
建立測試腳本 `backend/src/tests/test-linebot.ts`:
```typescript
async function testLineBot() {
  const client = new LineBotClient(LINE_ACCESS_TOKEN);
  
  // 測試發送訂單通知
  const testOrder: Order = {
    orderId: 'ORD-001',
    memberInfo: '張三 / 0912345678',
    products: '蛋糕 x2, 咖啡 x1',
    pickupTime: '2024-01-15 14:00',
    status: OrderStatus.PENDING,
    changeCount: 0,
    lastUpdated: new Date().toISOString()
  };
  
  await client.sendOrderNotification('USER_ID', testOrder);
  console.log('Line 通知發送成功');
}
```

**預估時間**: 20 分鐘

---

## 階段 5: 雲端函數開發

### 任務 5.1: 建立訂單監控雲端函數
**目標**: 建立定時執行的訂單監控函數

**輸入條件**: 任務 4.2 完成

**任務內容**:
建立 `backend/src/functions/order-monitor/index.ts`

**輸出結果**:
```typescript
import { GoogleSheetsClient } from '../../shared/services/GoogleSheetsClient';
import { OrderStatus } from '../../shared/types/Order';

export const orderMonitor = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    console.log('開始執行訂單監控...');
    
    try {
      // 1. 初始化服務
      const sheetsClient = new GoogleSheetsClient(credentials);
      
      // 2. 讀取訂單資料
      const orders = await sheetsClient.readOrderData(SHEET_ID, 'Orders!A1:G100');
      
      // 3. 處理不同狀態的訂單
      for (const order of orders) {
        if (order.status === OrderStatus.PENDING) {
          // 觸發 Line Bot 通知
          await functions.https.onCall(linebotNotify)({ orderId: order.orderId });
        } else if (order.status === OrderStatus.READY_TO_SHIP) {
          // 觸發日曆更新
          await functions.https.onCall(calendarUpdater)({ orderId: order.orderId });
        }
      }
      
      // 4. 記錄執行日誌
      await sheetsClient.logSystemAction(SHEET_ID, 'ORDER_MONITOR', `處理 ${orders.length} 筆訂單`);
      
    } catch (error) {
      console.error('訂單監控執行失敗:', error);
    }
  });
```

**驗證方式**:
```bash
# 編譯檢查
npx tsc backend/src/functions/order-monitor/index.ts

# 本地測試 (模擬定時觸發)
npm run test:order-monitor
```

**預估時間**: 30 分鐘

---

### 任務 5.2: 建立日曆更新雲端函數
**目標**: 建立處理日曆更新的雲端函數

**輸入條件**: 任務 5.1 完成

**任務內容**:
建立 `backend/src/functions/calendar-updater/index.ts`

**輸出結果**:
```typescript
export const calendarUpdater = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  
  try {
    // 1. 初始化服務
    const sheetsClient = new GoogleSheetsClient(credentials);
    const calendarClient = new GoogleCalendarClient(credentials);
    
    // 2. 讀取指定訂單
    const orders = await sheetsClient.readOrderData(SHEET_ID, 'Orders!A1:G100');
    const targetOrder = orders.find(o => o.orderId === orderId);
    
    if (!targetOrder || targetOrder.status !== OrderStatus.READY_TO_SHIP) {
      throw new Error('訂單不存在或狀態不正確');
    }
    
    // 3. 檢查是否需要合併
    const sameDate = orders.filter(o => 
      o.pickupTime.split(' ')[0] === targetOrder.pickupTime.split(' ')[0] &&
      o.memberInfo.split(' / ')[0] === targetOrder.memberInfo.split(' / ')[0] &&
      o.status === OrderStatus.READY_TO_SHIP
    );
    
    // 4. 建立或更新日曆事件
    let calendarEvent;
    if (sameDate.length > 1) {
      calendarEvent = OrderMerger.mergeOrders(sameDate);
    } else {
      calendarEvent = {
        summary: `${targetOrder.memberInfo.split(' / ')[0]} - 訂單領取`,
        description: `商品: ${targetOrder.products}\n訂單ID: ${targetOrder.orderId}`,
        start: new Date(targetOrder.pickupTime).toISOString(),
        end: new Date(new Date(targetOrder.pickupTime).getTime() + 30*60*1000).toISOString(),
        colorId: '1' // 藍色
      };
    }
    
    const eventId = await calendarClient.createEvent(CALENDAR_ID, calendarEvent);
    
    // 5. 更新更改次數
    await sheetsClient.updateOrderStatus(SHEET_ID, orderId, targetOrder.status);
    
    // 6. 記錄日誌
    await sheetsClient.logSystemAction(SHEET_ID, 'CALENDAR_UPDATE', `建立事件 ${eventId}`);
    
    return { success: true, eventId };
    
  } catch (error) {
    console.error('日曆更新失敗:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

**驗證方式**:
建立測試腳本來模擬函數呼叫：
```typescript
async function testCalendarUpdater() {
  const result = await calendarUpdater({ orderId: 'ORD-001' }, {} as any);
  console.log('日曆更新結果:', result);
}
```

**預估時間**: 30 分鐘

---

### 任務 5.3: 建立 Line Bot 通知雲端函數
**目標**: 建立處理 Line Bot 通知的雲端函數

**輸入條件**: 任務 5.2 完成

**任務內容**:
建立 `backend/src/functions/linebot-notify/index.ts`

**輸出結果**:
```typescript
export const linebotNotify = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  
  try {
    // 1. 初始化服務
    const sheetsClient = new GoogleSheetsClient(credentials);
    const lineBotClient = new LineBotClient(LINE_ACCESS_TOKEN);
    
    // 2. 讀取指定訂單
    const orders = await sheetsClient.readOrderData(SHEET_ID, 'Orders!A1:G100');
    const targetOrder = orders.find(o => o.orderId === orderId);
    
    if (!targetOrder || targetOrder.status !== OrderStatus.PENDING) {
      throw new Error('訂單不存在或狀態不正確');
    }
    
    // 3. 發送 Line 通知
    await lineBotClient.sendOrderNotification('ADMIN_USER_ID', targetOrder);
    
    // 4. 記錄日誌
    await sheetsClient.logSystemAction(SHEET_ID, 'LINE_NOTIFY', `通知訂單 ${orderId}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('Line 通知失敗:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

**驗證方式**:
建立測試腳本來模擬函數呼叫：
```typescript
async function testLineBotNotify() {
  const result = await linebotNotify({ orderId: 'ORD-002' }, {} as any);
  console.log('Line 通知結果:', result);
}
```

**預估時間**: 20 分鐘

---

## 階段 6: 前端基礎開發

### 任務 6.1: 建立 React 應用程式基礎結構
**目標**: 建立基本的 React + TypeScript 應用程式

**輸入條件**: 任務 5.3 完成

**任務內容**:
1. 初始化 React 應用程式 (`frontend/`)
2. 安裝必要的依賴套件
3. 設定 TypeScript 配置
4. 建立基本的資料夾結構

**輸出結果**:
```
frontend/
├── src/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── store/
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── tsconfig.json
```

**驗證方式**:
```bash
cd frontend
npm start
# 應用程式應該能在 localhost:3000 正常啟動
```

**預估時間**: 15 分鐘

---

### 任務 6.2: 建立狀態管理 (Zustand)
**目標**: 設定應用程式的狀態管理系統

**輸入條件**: 任務 6.1 完成

**任務內容**:
建立 Zustand stores：
- `frontend/src/store/orderStore.ts`
- `frontend/src/store/systemStore.ts`

**輸出結果**:
```typescript
// orderStore.ts
interface OrderStore {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  fetchOrders: async () => {
    set({ loading: true });
    try {
      // 呼叫 API 取得訂單資料
      const orders = await orderAPI.getOrders();
      set({ orders, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  updateOrderStatus: async (orderId, status) => {
    // 更新訂單狀態的邏輯
  }
}));

// systemStore.ts  
interface SystemStore {
  logs: SystemLog[];
  systemStatus: 'healthy' | 'warning' | 'error';
  fetchSystemLogs: () => Promise<void>;
}
```

**驗證方式**:
建立簡單的測試組件來驗證狀態管理：
```typescript
function TestComponent() {
  const { orders, fetchOrders } = useOrderStore();
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  return <div>訂單數量: {orders.length}</div>;
}
```

**預估時間**: 20 分鐘

---

### 任務 6.3: 建立 API 服務層
**目標**: 建立前端與後端 API 的通訊層

**輸入條件**: 任務 6.2 完成

**任務內容**:
建立 `frontend/src/services/` 中的 API 服務：
- `cloudFunctionsAPI.ts` - 雲端函數 API 呼叫
- `googleSheetsAPI.ts` - Google Sheets API (供前端直接讀取)

**輸出結果**:
```typescript
// cloudFunctionsAPI.ts
export class CloudFunctionsAPI {
  static async triggerOrderMonitor(): Promise<void> {
    // 手動觸發訂單監控
  }
  
  static async updateCalendar(orderId: string): Promise<{ eventId: string }> {
    // 觸發日曆更新
  }
  
  static async sendLineNotification(orderId: string): Promise<void> {
    // 觸發 Line 通知
  }
}

// googleSheetsAPI.ts
export class GoogleSheetsAPI {
  static async getOrders(): Promise<Order[]> {
    // 直接從 Google Sheets 讀取訂單資料 (供前端顯示)
  }
  
  static async getSystemLogs(): Promise<SystemLog[]> {
    // 讀取系統日誌
  }
}
```

**驗證方式**:
建立測試腳本驗證 API 呼叫：
```typescript
async function testAPI() {
  try {
    const orders = await GoogleSheetsAPI.getOrders();
    console.log('取得訂單:', orders.length);
    
    await CloudFunctionsAPI.triggerOrderMonitor();
    console.log('觸發監控成功');
  } catch (error) {
    console.error('API 測試失敗:', error);
  }
}
```

**預估時間**: 25 分鐘

---

### 任務 6.4: 建立訂單列表組件
**目標**: 建立顯示訂單列表的 React 組件

**輸入條件**: 任務 6.3 完成

**任務內容**:
建立 `frontend/src/components/Dashboard/OrderList.tsx`

**輸出結果**:
```typescript
interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onStatusChange }) => {
  return (
    <div className="order-list">
      <h2>訂單列表</h2>
      <table>
        <thead>
          <tr>
            <th>訂單ID</th>
            <th>會員資訊</th>
            <th>商品</th>
            <th>領取時間</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.memberInfo}</td>
              <td>{order.products}</td>
              <td>{order.pickupTime}</td>
              <td>
                <span className={`status-${order.status}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <select 
                  value={order.status} 
                  onChange={(e) => onStatusChange(order.orderId, e.target.value as OrderStatus)}
                >
                  <option value={OrderStatus.PENDING}>待處理</option>
                  <option value={OrderStatus.READY_TO_SHIP}>準備出貨</option>
                  <option value={OrderStatus.SHIPPED}>已出貨</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**驗證方式**:
建立測試頁面驗證組件渲染：
```typescript
function TestOrderList() {
  const mockOrders: Order[] = [
    {
      orderId: 'ORD-001',
      memberInfo: '張三 / 0912345678',
      products: '蛋糕 x2',
      pickupTime: '2024-01-15 14:00',
      status: OrderStatus.PENDING,
      changeCount: 0,
      lastUpdated: '2024-01-14 16:30'
    }
  ];
  
  return <OrderList orders={mockOrders} onStatusChange={() => {}} />;
}
```

**預估時間**: 20 分鐘

---

### 任務 6.5: 建立系統控制面板組件
**目標**: 建立顯示系統狀態和控制功能的面板

**輸入條件**: 任務 6.4 完成

**任務內容**:
建立 `frontend/src/components/Dashboard/StatusPanel.tsx`

**輸出結果**:
```typescript
export const StatusPanel: React.FC = () => {
  const { logs, systemStatus } = useSystemStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const handleManualTrigger = async () => {
    try {
      setIsMonitoring(true);
      await CloudFunctionsAPI.triggerOrderMonitor();
      alert('手動監控執行完成');
    } catch (error) {
      alert('執行失敗: ' + error.message);
    } finally {
      setIsMonitoring(false);
    }
  };
  
  return (
    <div className="status-panel">
      <h2>系統狀態</h2>
      
      <div className="system-status">
        <div className={`status-indicator ${systemStatus}`}>
          {systemStatus === 'healthy' ? '正常' : systemStatus === 'warning' ? '警告' : '錯誤'}
        </div>
      </div>
      
      <div className="controls">
        <button 
          onClick={handleManualTrigger}
          disabled={isMonitoring}
        >
          {isMonitoring ? '執行中...' : '手動執行監控'}
        </button>
      </div>
      
      <div className="recent-logs">
        <h3>最近日誌</h3>
        <ul>
          {logs.slice(0, 10).map((log, index) => (
            <li key={index}>
              <span className="timestamp">{log.timestamp}</span>
              <span className="action">{log.action}</span>
              <span className="result">{log.result}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

**驗證方式**:
在主 App 組件中整合並測試：
```typescript
function App() {
  return (
    <div className="app">
      <StatusPanel />
    </div>
  );
}
```

**預估時間**: 25 分鐘

---

## 階段 7: 系統整合與測試

### 任務 7.1: 建立端到端測試腳本
**目標**: 建立完整的系統測試流程

**輸入條件**: 任務 6.5 完成

**任務內容**:
建立 `scripts/test-e2e.sh` 和 `backend/src/tests/e2e-test.ts`

**輸出結果**:
```typescript
// e2e-test.ts
async function runE2ETest() {
  console.log('=== 開始端到端測試 ===');
  
  try {
    // 1. 測試 Google Sheets 連接
    console.log('1. 測試 Google Sheets 連接...');
    const sheetsClient = new GoogleSheetsClient(credentials);
    const orders = await sheetsClient.readOrderData(SHEET_ID, 'Orders!A1:G100');
    console.log(`✓ 成功讀取 ${orders.length} 筆訂單`);
    
    // 2. 測試建立測試訂單
    console.log('2. 建立測試訂單...');
    const testOrder: Order = {
      orderId: 'TEST-' + Date.now(),
      memberInfo: '測試用戶 / 0900000000',
      products: '測試商品 x1',
      pickupTime: new Date(Date.now() + 24*60*60*1000).toISOString(),
      status: OrderStatus.PENDING,
      changeCount: 0,
      lastUpdated: new Date().toISOString()
    };
    
    // 3. 測試 Line Bot 通知
    console.log('3. 測試 Line Bot 通知...');
    const lineBotResult = await linebotNotify({ orderId: testOrder.orderId }, {} as any);
    console.log('✓ Line Bot 通知成功:', lineBotResult);
    
    // 4. 更新訂單狀態為準備出貨
    console.log('4. 更新訂單狀態...');
    await sheetsClient.updateOrderStatus(SHEET_ID, testOrder.orderId, OrderStatus.READY_TO_SHIP);
    console.log('✓ 訂單狀態更新成功');
    
    // 5. 測試日曆更新
    console.log('5. 測試日曆更新...');
    const calendarResult = await calendarUpdater({ orderId: testOrder.orderId }, {} as any);
    console.log('✓ 日曆更新成功:', calendarResult);
    
    // 6. 清理測試資料
    console.log('6. 清理測試資料...');
    const calendarClient = new GoogleCalendarClient(credentials);
    await calendarClient.deleteEvent(CALENDAR_ID, calendarResult.eventId);
    console.log('✓ 測試資料清理完成');
    
    console.log('=== 端到端測試全部通過 ===');
    
  } catch (error) {
    console.error('❌ 端到端測試失敗:', error);
    process.exit(1);
  }
}
```

**驗證方式**:
```bash
./scripts/test-e2e.sh
# 應該看到所有測試步驟都顯示 "✓" 且最後顯示 "端到端測試全部通過"
```

**預估時間**: 30 分鐘

---

### 任務 7.2: 建立配置檔案和環境變數管理
**目標**: 建立完整的配置管理系統

**輸入條件**: 任務 7.1 完成

**任務內容**:
建立配置檔案和環境變數範本

**輸出結果**:
```json
// config/development.json
{
  "google": {
    "projectId": "your-project-id",
    "sheetsId": "your-sheets-id",
    "calendarId": "your-calendar-id",
    "credentialsPath": "./config/google-credentials.json"
  },
  "linebot": {
    "channelAccessToken": "your-line-access-token",
    "adminUserId": "your-admin-user-id"
  },
  "system": {
    "monitorInterval": 30,
    "retryAttempts": 3,
    "logRetentionDays": 30,
    "environment": "development"
  }
}

// config/production.json
{
  "google": {
    "projectId": "${GOOGLE_PROJECT_ID}",
    "sheetsId": "${GOOGLE_SHEETS_ID}",
    "calendarId": "${GOOGLE_CALENDAR_ID}",
    "credentialsPath": "${GOOGLE_CREDENTIALS_PATH}"
  },
  "linebot": {
    "channelAccessToken": "${LINE_ACCESS_TOKEN}",
    "adminUserId": "${LINE_ADMIN_USER_ID}"
  },
  "system": {
    "monitorInterval": 30,
    "retryAttempts": 3,
    "logRetentionDays": 30,
    "environment": "production"
  }
}
```

建立配置載入器 `backend/src/shared/utils/configLoader.ts`:
```typescript
export class ConfigLoader {
  static loadConfig(environment: string = 'development') {
    const configPath = `./config/${environment}.json`;
    const config = require(configPath);
    
    // 替換環境變數
    return this.replaceEnvVars(config);
  }
  
  private static replaceEnvVars(obj: any): any {
    // 遞迴替換 ${VAR_NAME} 格式的環境變數
  }
}
```

**驗證方式**:
```typescript
// 測試配置載入
const config = ConfigLoader.loadConfig('development');
console.log('配置載入成功:', config.google.projectId);
```

**預估時間**: 20 分鐘

---

### 任務 7.3: 建立錯誤處理和重試機制
**目標**: 為所有 API 呼叫添加錯誤處理和重試邏輯

**輸入條件**: 任務 7.2 完成

**任務內容**:
建立 `backend/src/shared/utils/retryUtils.ts`

**輸出結果**:
```typescript
export class RetryUtils {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // 指數退避
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`嘗試 ${attempt} 失敗，${delay}ms 後重試:`, error.message);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 錯誤類型定義
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

更新所有服務類別以使用重試機制：
```typescript
// 在 GoogleSheetsClient 中應用
async readOrderData(sheetId: string, range: string): Promise<Order[]> {
  return RetryUtils.withRetry(async () => {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });
    
    return this.parseOrderData(response.data.values || []);
  });
}
```

**驗證方式**:
建立測試來驗證重試機制：
```typescript
async function testRetryMechanism() {
  let attempts = 0;
  
  try {
    await RetryUtils.withRetry(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('模擬失敗');
      }
      return '成功';
    });
    
    console.log('重試機制測試通過，總嘗試次數:', attempts);
  } catch (error) {
    console.error('重試機制測試失敗:', error);
  }
}
```

**預估時間**: 25 分鐘

---

## 階段 8: 部署準備

### 任務 8.1: 建立部署腳本
**目標**: 建立自動化部署腳本

**輸入條件**: 任務 7.3 完成

**任務內容**:
建立 `scripts/deploy.sh`

**輸出結果**:
```bash
#!/bin/bash

set -e

ENVIRONMENT=${1:-development}
echo "開始部署到 $ENVIRONMENT 環境..."

# 1. 檢查必要的環境變數
echo "1. 檢查環境配置..."
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$GOOGLE_PROJECT_ID" ]; then
        echo "錯誤: 缺少 GOOGLE_PROJECT_ID 環境變數"
        exit 1
    fi
    
    if [ -z "$LINE_ACCESS_TOKEN" ]; then
        echo "錯誤: 缺少 LINE_ACCESS_TOKEN 環境變數"
        exit 1
    fi
fi

# 2. 編譯 TypeScript
echo "2. 編譯後端程式碼..."
cd backend
npm run build
cd ..

# 3. 部署雲端函數
echo "3. 部署雲端函數..."
gcloud functions deploy order-monitor \
    --source=backend/dist/functions/order-monitor \
    --entry-point=orderMonitor \
    --runtime=nodejs18 \
    --trigger-topic=order-monitor-topic \
    --region=asia-east1

gcloud functions deploy calendar-updater \
    --source=backend/dist/functions/calendar-updater \
    --entry-point=calendarUpdater \
    --runtime=nodejs18 \
    --trigger-http \
    --allow-unauthenticated \
    --region=asia-east1

gcloud functions deploy linebot-notify \
    --source=backend/dist/functions/linebot-notify \
    --entry-point=linebotNotify \
    --runtime=nodejs18 \
    --trigger-http \
    --allow-unauthenticated \
    --region=asia-east1

# 4. 設定定時觸發器
echo "4. 設定定時觸發器..."
gcloud scheduler jobs create pubsub order-monitor-job \
    --schedule="*/30 * * * *" \
    --topic=order-monitor-topic \
    --message-body="{}" \
    --time-zone="Asia/Taipei" \
    --location=asia-east1 \
    || echo "定時任務已存在，跳過建立"

# 5. 建置前端
echo "5. 建置前端應用程式..."
cd frontend
npm run build
cd ..

# 6. 部署前端到 Firebase Hosting (可選)
if command -v firebase &> /dev/null; then
    echo "6. 部署前端到 Firebase Hosting..."
    firebase deploy --only hosting
else
    echo "6. 跳過前端部署 (未安裝 Firebase CLI)"
fi

echo "部署完成！"
```

**驗證方式**:
```bash
# 執行部署腳本 (開發環境)
./scripts/deploy.sh development

# 檢查部署狀態
gcloud functions list --filter="name:order-monitor OR name:calendar-updater OR name:linebot-notify"
```

**預估時間**: 25 分鐘

---

### 任務 8.2: 建立 Google Sheets 範本
**目標**: 建立標準的 Google Sheets 範本供使用者複製

**輸入條件**: 任務 8.1 完成

**任務內容**:
建立範本建置腳本 `scripts/setup-sheets-template.ts`

**輸出結果**:
```typescript
import { GoogleSheetsClient } from '../backend/src/shared/services/GoogleSheetsClient';

async function setupSheetsTemplate() {
  console.log('建立 Google Sheets 範本...');
  
  const sheetsClient = new GoogleSheetsClient(credentials);
  
  // 1. 建立 Orders 工作表標題列
  const orderHeaders = [
    '訂單ID',
    '會員資訊', 
    '商品',
    '領取時間',
    '訂單狀態',
    '更改次數',
    '最後更新時間'
  ];
  
  // 2. 建立 SystemLogs 工作表標題列
  const logHeaders = [
    '時間戳記',
    '功能模組',
    '動作類型',
    '訂單ID',
    '執行結果',
    '錯誤訊息'
  ];
  
  // 3. 建立範例資料
  const sampleOrders = [
    [
      'ORD-001',
      '張三 / 0912345678',
      '蛋糕 x2, 咖啡 x1',
      '2024-01-15 14:00',
      '待處理',
      '0',
      '2024-01-14 16:30'
    ],
    [
      'ORD-002', 
      '李四 / 0987654321',
      '麵包 x3',
      '2024-01-15 15:30',
      '準備出貨',
      '1',
      '2024-01-14 17:00'
    ]
  ];
  
  try {
    // 設定 Orders 工作表
    await sheetsClient.sheets.spreadsheets.values.update({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: 'Orders!A1:G1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [orderHeaders]
      }
    });
    
    await sheetsClient.sheets.spreadsheets.values.update({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: 'Orders!A2:G3',
      valueInputOption: 'RAW',
      requestBody: {
        values: sampleOrders
      }
    });
    
    // 設定 SystemLogs 工作表
    await sheetsClient.sheets.spreadsheets.values.update({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: 'SystemLogs!A1:F1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [logHeaders]
      }
    });
    
    console.log('✓ Google Sheets 範本建立完成');
    console.log(`範本連結: https://docs.google.com/spreadsheets/d/${TEMPLATE_SHEET_ID}`);
    
  } catch (error) {
    console.error('❌ 範本建立失敗:', error);
  }
}

if (require.main === module) {
  setupSheetsTemplate();
}
```

**驗證方式**:
```bash
# 執行範本建置
npx ts-node scripts/setup-sheets-template.ts

# 手動檢查產生的 Google Sheets 是否包含正確的標題列和範例資料
```

**預估時間**: 20 分鐘

---

### 任務 8.3: 建立使用者文件
**目標**: 建立完整的使用者操作手冊

**輸入條件**: 任務 8.2 完成

**任務內容**:
建立 `docs/user-manual.md`

**輸出結果**:
```markdown
# 訂單日曆自動化系統使用手冊

## 快速開始

### 1. 準備 Google Sheets
1. 複製範本：[Google Sheets 範本連結]
2. 記錄您的 Sheets ID (URL 中的長字串)
3. 確保工作表包含 "Orders" 和 "SystemLogs" 兩個分頁

### 2. 準備 Google Calendar
1. 建立一個專用的 Google Calendar
2. 記錄 Calendar ID (在日曆設定中找到)
3. 確保系統服務帳號有編輯權限

### 3. 設定 Line Bot (可選)
1. 在 Line Developers 建立 Bot
2. 取得 Channel Access Token
3. 記錄管理員的 User ID

### 4. 部署系統
```bash
# 設定環境變數
export GOOGLE_PROJECT_ID="your-project-id"
export GOOGLE_SHEETS_ID="your-sheets-id" 
export GOOGLE_CALENDAR_ID="your-calendar-id"
export LINE_ACCESS_TOKEN="your-line-token"

# 執行部署
./scripts/deploy.sh production
```

## 日常操作

### 訂單管理
1. **新增訂單**: 直接在 Google Sheets 的 "Orders" 分頁新增列
2. **更新狀態**: 修改 "訂單狀態" 欄位
   - `待處理`: 系統會發送 Line 通知
   - `準備出貨`: 系統會更新到日曆
   - `已出貨`: 系統會忽略

### 系統監控
1. **檢查日誌**: 查看 "SystemLogs" 分頁
2. **手動觸發**: 使用前端控制面板的手動執行按鈕
3. **查看日曆**: 檢查 Google Calendar 中的預約事件

### 常見問題處理
1. **訂單未更新到日曆**
   - 檢查訂單狀態是否為 "準備出貨"
   - 檢查領取時間格式是否正確 (YYYY-MM-DD HH:mm)
   - 查看 SystemLogs 中的錯誤訊息

2. **Line 通知未收到**
   - 檢查 Line Bot Token 是否正確
   - 確認管理員 User ID 設定正確
   - 檢查訂單狀態是否為 "待處理"

3. **系統停止運作**
   - 檢查 Google Cloud Functions 的執行日誌
   - 確認定時觸發器是否正常運作
   - 檢查 API 配額是否用盡
```

**驗證方式**:
請其他人員閱讀文件並嘗試操作，確保步驟清晰易懂

**預估時間**: 30 分鐘

---

## 階段 9: 最終整合測試

### 任務 9.1: 完整系統測試
**目標**: 執行完整的系統整合測試

**輸入條件**: 任務 8.3 完成，系統已部署

**任務內容**:
建立 `scripts/full-system-test.sh`

**輸出結果**:
```bash
#!/bin/bash

echo "=== 開始完整系統測試 ==="

# 1. 測試訂單監控觸發
echo "1. 測試定時觸發器..."
gcloud scheduler jobs run order-monitor-job --location=asia-east1
sleep 10

# 2. 建立測試訂單
echo "2. 建立測試訂單..."
TIMESTAMP=$(date +%s)
TEST_ORDER_ID="TEST-$TIMESTAMP"

# 3. 手動呼叫 Line Bot 通知
echo "3. 測試 Line Bot 通知..."
gcloud functions call linebot-notify \
    --region=asia-east1 \
    --data='{"orderId":"'$TEST_ORDER_ID'"}'

# 4. 手動呼叫日曆更新
echo "4. 測試日曆更新..."
gcloud functions call calendar-updater \
    --region=asia-east1 \
    --data='{"orderId":"'$TEST_ORDER_ID'"}'

# 5. 檢查前端應用程式
echo "5. 測試前端應用程式..."
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✓ 前端應用程式運行正常"
else
    echo "❌ 前端應用程式無回應"
fi

# 6. 檢查所有雲端函數狀態
echo "6. 檢查雲端函數狀態..."
gcloud functions describe order-monitor --region=asia-east1 --format="value(status)"
gcloud functions describe calendar-updater --region=asia-east1 --format="value(status)"
gcloud functions describe linebot-notify --region=asia-east1 --format="value(status)"

echo "=== 完整系統測試結束 ==="
```

**驗證方式**:
```bash
./scripts/full-system-test.sh
# 所有測試項目都應該顯示 "✓" 或 "ACTIVE" 狀態
```

**預估時間**: 20 分鐘

---

### 任務 9.2: 效能和負載測試
**目標**: 測試系統在多筆訂單下的效能表現

**輸入條件**: 任務 9.1 完成且通過

**任務內容**:
建立 `backend/src/tests/load-test.ts`

**輸出結果**:
```typescript
async function loadTest() {
  console.log('開始負載測試...');
  
  const testOrders: Order[] = [];
  const testCount = 50; // 50 筆測試訂單
  
  // 1. 產生測試資料
  for (let i = 1; i <= testCount; i++) {
    testOrders.push({
      orderId: `LOAD-TEST-${i.toString().padStart(3, '0')}`,
      memberInfo: `測試用戶${i} / 090000${i.toString().padStart(4, '0')}`,
      products: `測試商品${i} x${Math.floor(Math.random() * 3) + 1}`,
      pickupTime: new Date(Date.now() + (i * 60 * 60 * 1000)).toISOString(),
      status: Math.random() > 0.5 ? OrderStatus.PENDING : OrderStatus.READY_TO_SHIP,
      changeCount: 0,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // 2. 批次處理測試
  console.log(`處理 ${testCount} 筆訂單...`);
  const startTime = Date.now();
  
  const results = await Promise.allSettled(
    testOrders.map(async (order) => {
      if (order.status === OrderStatus.PENDING) {
        return await linebotNotify({ orderId: order.orderId }, {} as any);
      } else {
        return await calendarUpdater({ orderId: order.orderId }, {} as any);
      }
    })
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 3. 分析結果
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`負載測試結果:`);
  console.log(`- 總處理時間: ${duration}ms`);
  console.log(`- 平均處理時間: ${duration / testCount}ms per order`);
  console.log(`- 成功處理: ${successful} 筆`);
  console.log(`- 處理失敗: ${failed} 筆`);
  console.log(`- 成功率: ${(successful / testCount * 100).toFixed(2)}%`);
  
  // 4. 效能基準檢查
  const avgProcessingTime = duration / testCount;
  if (avgProcessingTime > 5000) { // 超過 5 秒視為效能問題
    console.warn(`⚠️ 警告: 平均處理時間過長 (${avgProcessingTime}ms)`);
  } else {
    console.log(`✓ 效能表現良好`);
  }
  
  if (successful / testCount < 0.95) { // 成功率低於 95% 視為不穩定
    console.error(`❌ 錯誤: 成功率過低 (${(successful / testCount * 100).toFixed(2)}%)`);
  } else {
    console.log(`✓ 系統穩定性良好`);
  }
  
  // 5. 清理測試資料
  console.log('清理測試資料...');
  // 這裡應該清理建立的測試日曆事件和 Sheets 記錄
  
  console.log('負載測試完成');
}
```

**驗證方式**:
```bash
npx ts-node backend/src/tests/load-test.ts
# 檢查輸出的效能指標和成功率
```

**預估時間**: 30 分鐘

---

### 任務 9.3: 建立監控和告警設定
**目標**: 設定系統監控和自動告警機制

**輸入條件**: 任務 9.2 完成

**任務內容**:
建立 `monitoring/alerts.yaml` 和監控設定腳本

**輸出結果**:
```yaml
# monitoring/alerts.yaml
displayName: "訂單系統監控"
conditions:
  - displayName: "雲端函數執行失敗"
    conditionThreshold:
      filter: 'resource.type="cloud_function" AND severity="ERROR"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 5
      duration: 300s
    notificationChannels:
      - "projects/[PROJECT_ID]/notificationChannels/[CHANNEL_ID]"
      
  - displayName: "API 配額即將用盡"
    conditionThreshold:
      filter: 'metric.type="serviceruntime.googleapis.com/api/request_count"'
      comparison: COMPARISON_GREATER_THAN  
      thresholdValue: 900 # 假設配額為 1000
      duration: 60s
      
  - displayName: "系統回應時間過慢"
    conditionThreshold:
      filter: 'resource.type="cloud_function" AND metric.type="cloudfunctions.googleapis.com/function/execution_time"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 30000 # 30 秒
      duration: 300s
```

建立監控設定腳本 `scripts/setup-monitoring.sh`:
```bash
#!/bin/bash

echo "設定系統監控..."

# 1. 建立通知頻道 (Email)
gcloud alpha monitoring channels create \
    --display-name="系統管理員" \
    --type=email \
    --channel-labels=email_address="admin@example.com"

# 2. 建立告警政策
gcloud alpha monitoring policies create \
    --policy-from-file=monitoring/alerts.yaml

# 3. 建立自訂指標
gcloud logging metrics create order_processing_errors \
    --description="訂單處理錯誤計數" \
    --log-filter='resource.type="cloud_function" AND severity="ERROR" AND jsonPayload.module="order-processing"'

gcloud logging metrics create order_processing_success \
    --description="訂單處理成功計數" \
    --log-filter='resource.type="cloud_function" AND severity="INFO" AND jsonPayload.module="order-processing" AND jsonPayload.status="success"'

echo "監控設定完成"
```

建立健康檢查函數 `backend/src/functions/health-check/index.ts`:
```typescript
export const healthCheck = functions.https.onRequest(async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    googleSheets: false,
    googleCalendar: false,
    lineBot: false,
    overall: false
  };
  
  try {
    // 1. 測試 Google Sheets 連接
    const sheetsClient = new GoogleSheetsClient(credentials);
    await sheetsClient.readOrderData(SHEET_ID, 'Orders!A1:A1');
    checks.googleSheets = true;
  } catch (error) {
    console.error('Google Sheets 健康檢查失敗:', error);
  }
  
  try {
    // 2. 測試 Google Calendar 連接
    const calendarClient = new GoogleCalendarClient(credentials);
    await calendarClient.getEventsByDate(CALENDAR_ID, new Date().toISOString().split('T')[0]);
    checks.googleCalendar = true;
  } catch (error) {
    console.error('Google Calendar 健康檢查失敗:', error);
  }
  
  try {
    // 3. 測試 Line Bot 連接 (發送測試訊息到測試頻道)
    const lineBotClient = new LineBotClient(LINE_ACCESS_TOKEN);
    // 這裡可以實作一個簡單的 token 驗證
    checks.lineBot = true;
  } catch (error) {
    console.error('Line Bot 健康檢查失敗:', error);
  }
  
  checks.overall = checks.googleSheets && checks.googleCalendar && checks.lineBot;
  
  res.status(checks.overall ? 200 : 503).json(checks);
});
```

**驗證方式**:
```bash
./scripts/setup-monitoring.sh

# 測試健康檢查端點
curl https://[REGION]-[PROJECT_ID].cloudfunctions.net/health-check
```

**預估時間**: 25 分鐘

---

## 階段 10: 文件完善和交付

### 任務 10.1: 建立 API 文件
**目標**: 建立完整的 API 文件

**輸入條件**: 任務 9.3 完成

**任務內容**:
建立 `docs/api-documentation.md`

**輸出結果**:
```markdown
# API 文件

## 雲端函數 API

### 1. 訂單監控 (order-monitor)
**觸發方式**: 定時觸發 (每30分鐘)
**功能**: 自動檢查訂單狀態變化並執行相應動作

**處理邏輯**:
- 待處理訂單 → 發送 Line 通知
- 準備出貨訂單 → 更新到日曆
- 已出貨訂單 → 忽略

### 2. 日曆更新 (calendar-updater)
**端點**: `POST /calendar-updater`
**觸發方式**: HTTP 呼叫

**請求參數**:
```json
{
  "orderId": "ORD-001"
}
```

**回應格式**:
```json
{
  "success": true,
  "eventId": "calendar_event_id"
}
```

**錯誤回應**:
```json
{
  "error": {
    "code": "INVALID_ORDER",
    "message": "訂單不存在或狀態不正確"
  }
}
```

### 3. Line Bot 通知 (linebot-notify)
**端點**: `POST /linebot-notify`
**觸發方式**: HTTP 呼叫

**請求參數**:
```json
{
  "orderId": "ORD-001"
}
```

**回應格式**:
```json
{
  "success": true
}
```

### 4. 健康檢查 (health-check)
**端點**: `GET /health-check`
**功能**: 檢查所有服務的健康狀態

**回應格式**:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "googleSheets": true,
  "googleCalendar": true,
  "lineBot": true,
  "overall": true
}
```

## 資料格式

### Order 物件
```typescript
interface Order {
  orderId: string;          // 訂單唯一識別碼
  memberInfo: string;       // "姓名 / 電話" 格式
  products: string;         // 商品列表
  pickupTime: string;       // 領取時間 "YYYY-MM-DD HH:mm"
  status: OrderStatus;      // 訂單狀態
  changeCount: number;      // 更改次數
  lastUpdated: string;      // 最後更新時間
}
```

### CalendarEvent 物件
```typescript
interface CalendarEvent {
  id?: string;              // 事件 ID (由系統產生)
  summary: string;          // 事件標題
  description: string;      // 事件描述
  start: string;           // 開始時間 ISO 8601 格式
  end: string;             // 結束時間 ISO 8601 格式
  colorId?: string;        // 顏色代碼 (1=藍色, 10=綠色, 11=紅色)
}
```

## 錯誤代碼

| 錯誤代碼 | 說明 | 解決方式 |
|---------|------|---------|
| INVALID_ORDER | 訂單不存在或狀態不正確 | 檢查訂單 ID 和狀態 |
| SHEETS_ACCESS_ERROR | Google Sheets 存取失敗 | 檢查權限設定和網路連線 |
| CALENDAR_ACCESS_ERROR | Google Calendar 存取失敗 | 檢查 Calendar ID 和權限 |
| LINEBOT_ERROR | Line Bot 發送失敗 | 檢查 Access Token 和 User ID |
| QUOTA_EXCEEDED | API 配額用盡 | 等待配額重置或升級方案 |
```

**驗證方式**:
測試文件中提到的所有 API 端點和錯誤情況

**預估時間**: 25 分鐘

---

### 任務 10.2: 建立疑難排解指南
**目標**: 建立常見問題的疑難排解指南

**輸入條件**: 任務 10.1 完成

**任務內容**:
建立 `docs/troubleshooting.md`

**輸出結果**:
```markdown
# 疑難排解指南

## 常見問題

### 1. 訂單未自動更新到日曆

**症狀**: 訂單狀態改為「準備出貨」但日曆中沒有出現事件

**可能原因**:
- 訂單狀態格式不正確
- 領取時間格式錯誤
- Google Calendar 權限問題
- 系統定時器未運作

**排解步驟**:
```bash
# 1. 檢查訂單資料格式
# 確保狀態欄位內容完全符合: "準備出貨"
# 確保時間格式為: "YYYY-MM-DD HH:mm"

# 2. 手動觸發日曆更新
gcloud functions call calendar-updater \
    --data='{"orderId":"你的訂單ID"}'

# 3. 檢查函數執行日誌
gcloud functions logs read calendar-updater --limit=10

# 4. 檢查定時器狀態
gcloud scheduler jobs describe order-monitor-job --location=asia-east1
```

### 2. Line 通知未收到

**症狀**: 訂單狀態為「待處理」但沒有收到 Line 通知

**可能原因**:
- Line Bot Token 過期或錯誤
- 管理員 User ID 設定錯誤
- Line Bot 未加好友

**排解步驟**:
```bash
# 1. 測試 Line Bot 連線
curl -X POST https://api.line.me/v2/bot/message/push \
-H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "to": "YOUR_USER_ID",
  "messages": [{"type": "text", "text": "測試訊息"}]
}'

# 2. 檢查環境變數
echo $LINE_ACCESS_TOKEN
echo $LINE_ADMIN_USER_ID

# 3. 手動觸發通知
gcloud functions call linebot-notify \
    --data='{"orderId":"你的訂單ID"}'
```

### 3. 系統完全停止運作

**症狀**: 沒有任何自動化功能在運作

**排解步驟**:
```bash
# 1. 檢查健康狀態
curl https://[REGION]-[PROJECT_ID].cloudfunctions.net/health-check

# 2. 檢查所有函數狀態
gcloud functions list

# 3. 檢查定時器狀態
gcloud scheduler jobs list --location=asia-east1

# 4. 查看錯誤日誌
gcloud functions logs read order-monitor --limit=20
gcloud functions logs read calendar-updater --limit=20
gcloud functions logs read linebot-notify --limit=20

# 5. 重新部署系統
./scripts/deploy.sh production
```

### 4. Google Sheets 連線失敗

**症狀**: 系統無法讀取或寫入 Google Sheets

**可能原因**:
- 服務帳號權限不足
- Sheets ID 錯誤
- API 配額用盡

**排解步驟**:
```bash
# 1. 檢查服務帳號權限
# 確保服務帳號有 Google Sheets 的編輯權限

# 2. 驗證 Sheets ID
echo $GOOGLE_SHEETS_ID
# 確認 ID 與實際 Google Sheets URL 中的 ID 相符

# 3. 檢查 API 配額
gcloud logging read 'resource.type="consumed_api" AND protoPayload.methodName="google.sheets.v4.*"' --limit=10

# 4. 測試手動讀取
npx ts-node backend/src/tests/test-sheets-read.ts
```

### 5. 前端應用程式無法連線

**症狀**: 前端頁面無法載入或功能異常

**排解步驟**:
```bash
# 1. 檢查前端建置
cd frontend
npm run build

# 2. 檢查 API 端點設定
# 確認 .env 檔案中的 API URL 正確

# 3. 檢查瀏覽器控制台錯誤
# 開啟開發者工具檢查 Console 和 Network 標籤

# 4. 重新啟動開發伺服器
npm start
```

## 日誌分析

### 查看特定時間範圍的日誌
```bash
gcloud functions logs read order-monitor \
    --start-time="2024-01-15T00:00:00Z" \
    --end-time="2024-01-15T23:59:59Z"
```

### 搜尋錯誤日誌
```bash
gcloud functions logs read order-monitor \
    --filter="severity=ERROR" \
    --limit=50
```

### 監控 API 使用量
```bash
gcloud logging read 'resource.type="consumed_api"' \
    --filter="timestamp>=\"2024-01-15T00:00:00Z\"" \
    --format="table(timestamp, protoPayload.methodName, protoPayload.resourceName)"
```

## 緊急聯絡資訊

- **系統管理員**: admin@example.com
- **技術支援**: support@example.com
- **Google Cloud 支援**: [Google Cloud Console](https://console.cloud.google.com/support)
```

**驗證方式**:
模擬各種錯誤情況並按照指南進行排解

**預估時間**: 30 分鐘

---

### 任務 10.3: 建立專案 README 和最終檢查清單
**目標**: 完成專案主要說明文件和交付檢查清單

**輸入條件**: 任務 10.2 完成

**任務內容**:
建立 `README.md` 和 `DEPLOYMENT_CHECKLIST.md`

**輸出結果**:
```markdown
# 訂單日曆自動化系統

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Functions-orange.svg)](https://cloud.google.com/functions)

## 專案概述

訂單日曆自動化系統是一個基於 Google Cloud Functions 的自動化解決方案，能夠：
- 監控 Google Sheets 中的訂單狀態變化
- 自動發送 Line Bot 通知給管理員
- 將準備出貨的訂單同步到 Google Calendar
- 提供 Web 介面進行系統監控和管理

## 快速開始

### 系統需求
- Node.js 18+
- Google Cloud CLI
- Firebase CLI (可選，用於前端部署)
- Google Cloud 專案 (已啟用相關 API)

### 1. 克隆專案
```bash
git clone https://github.com/your-org/order-calendar-automation.git
cd order-calendar-automation
```

### 2. 環境設定
```bash
# 複製配置範本
cp config/development.json.example config/development.json
cp config/production.json.example config/production.json

# 編輯配置檔案，填入您的 API 金鑰和 ID
```

### 3. 安裝依賴
```bash
# 後端依賴
cd backend && npm install && cd ..

# 前端依賴
cd frontend && npm install && cd ..
```

### 4. 部署系統
```bash
# 設定 Google Cloud 專案
gcloud config set project YOUR_PROJECT_ID

# 部署到生產環境
./scripts/deploy.sh production
```

### 5. 設定 Google Sheets
1. 複製 [Google Sheets 範本](TEMPLATE_SHEET_URL)
2. 將 Sheets ID 更新到配置檔案中
3. 確保服務帳號有編輯權限

## 系統架構

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   React     │    │ Google       │    │ Google      │
│   前端      │    │ Sheets       │    │ Calendar    │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │ Google Cloud Functions     │
              │ ┌─────────────────────────┐│
              │ │ order-monitor (定時)     ││
              │ │ calendar-updater (HTTP) ││
              │ │ linebot-notify (HTTP)   ││
              │ │ health-check (HTTP)     ││
              │ └─────────────────────────┘│
              └────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │        Line Bot API        │
              └────────────────────────────┘
```

## 主要功能

### 🔄 自動化流程
- **定時監控**: 每30分鐘自動檢查訂單狀態
- **智慧通知**: 待處理訂單自動發送 Line 通知
- **日曆同步**: 準備出貨訂單自動新增到 Google Calendar
- **訂單合併**: 同一天同一會員的多筆訂單自動合併

### 📊 前端管理介面
- **訂單總覽**: 即時顯示所有訂單狀態
- **系統控制**: 手動觸發監控和更新功能
- **日誌查看**: 檢視系統執行日誌
- **狀態監控**: 即時系統健康狀態

### 🛡️ 可靠性設計
- **錯誤重試**: API 呼叫失敗自動重試
- **健康檢查**: 定期檢查所有服務狀態
- **詳細日誌**: 完整的操作記錄和錯誤追蹤
- **監控告警**: 異常狀況自動通知

## 使用指南

### 基本操作
1. **新增訂單**: 在 Google Sheets 中新增訂單資料
2. **更新狀態**: 修改訂單狀態觸發自動化流程
3. **查看結果**: 在 Google Calendar 或 Line 中確認結果

### 狀態流程
```
待處理 → [Line 通知] → 準備出貨 → [更新日曆] → 已出貨
```

## 開發指南

### 本地開發
```bash
# 啟動前端開發伺服器
cd frontend && npm start

# 本地測試雲端函數
cd backend && npm run serve

# 執行測試
npm run test
```

### 新增功能
1. 建立功能分支: `git checkout -b feature/new-feature`
2. 開發和測試功能
3. 更新文件
4. 提交 Pull Request

## 疑難排解

常見問題請參考 [疑難排解指南](docs/troubleshooting.md)

## API 文件

詳細的 API 說明請參考 [API 文件](docs/api-documentation.md)

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 貢獻

歡迎提交 Issue 和 Pull Request！請先閱讀 [貢獻指南](CONTRIBUTING.md)

## 更新日誌

請參考 [CHANGELOG.md](CHANGELOG.md) 查看版本更新記錄

---

**技術支援**: support@example.com  
**文件更新**: 2024-01-15
```

建立 `DEPLOYMENT_CHECKLIST.md`:
```markdown
# 部署檢查清單

## 部署前準備

### 🔧 環境設定
- [ ] Google Cloud 專案已建立並啟用計費
- [ ] 已啟用必要的 API:
  - [ ] Google Sheets API
  - [ ] Google Calendar API
  - [ ] Cloud Functions API
  - [ ] Cloud Scheduler API
  - [ ] Cloud Logging API
- [ ] 已建立服務帳號並下載金鑰檔案
- [ ] Google Sheets 已建立並設定正確權限
- [ ] Google Calendar 已建立並設定正確權限
- [ ] Line Bot 已建立並取得 Access Token (可選)

### 📋 配置檔案
- [ ] `config/production.json` 已正確設定所有必要參數
- [ ] 環境變數已設定:
  - [ ] `GOOGLE_PROJECT_ID`
  - [ ] `GOOGLE_SHEETS_ID`
  - [ ] `GOOGLE_CALENDAR_ID`
  - [ ] `LINE_ACCESS_TOKEN` (可選)
  - [ ] `LINE_ADMIN_USER_ID` (可選)
- [ ] 服務帳號金鑰檔案路徑正確

## 部署執行

### 🚀 系統部署
- [ ] 執行 `./scripts/deploy.sh production`
- [ ] 確認所有雲端函數部署成功:
  - [ ] order-monitor
  - [ ] calendar-updater
  - [ ] linebot-notify
  - [ ] health-check
- [ ] 確認定時觸發器建立成功
- [ ] 前端應用程式部署成功 (如適用)

### ✅ 功能測試
- [ ] 健康檢查端點回應正常
- [ ] Google Sheets 讀寫功能正常
- [ ] Google Calendar 建立事件功能正常
- [ ] Line Bot 發送訊息功能正常 (如適用)
- [ ] 定時觸發器正常執行
- [ ] 端到端測試通過

## 部署後驗證

### 🧪 整合測試
- [ ] 建立測試訂單並驗證完整流程:
  - [ ] 訂單狀態為「待處理」→ 收到 Line 通知
  - [ ] 訂單狀態為「準備出貨」→ 日曆事件建立
  - [ ] 同一天同一會員多筆訂單正確合併
- [ ] 前端介面功能正常:
  - [ ] 訂單列表正常顯示
  - [ ] 手動觸發功能正常
  - [ ] 系統狀態顯示正確

### 📊 監控設定
- [ ] 系統監控和告警已設定
- [ ] 日誌記錄正常運作
- [ ] 效能指標在合理範圍內
- [ ] 錯誤率在可接受範圍內

## 交付文件

### 📚 使用者文件
- [ ] 使用者操作手冊已提供
- [ ] API 文件已更新
- [ ] 疑難排解指南已準備
- [ ] 系統架構圖已更新

### 🔐 安全資訊
- [ ] 管理員帳號資訊已安全交付
- [ ] API 金鑰和密碼已安全儲存
- [ ] 存取權限已正確設定
- [ ] 備份和還原程序已建立

## 維護資訊

### 📅 定期維護
- [ ] 系統監控檢查頻率: 每日
- [ ] 日誌清理週期: 每月
- [ ] 效能評估週期: 每季
- [ ] 安全更新檢查: 每月

### 🆘 緊急聯絡
- [ ] 系統管理員聯絡資訊
- [ ] 技術支援聯絡資訊
- [ ] 服務商客服資訊

---

**部署負責人**: _______________  
**驗收負責人**: _______________  
**部署日期**: _______________  
**驗收日期**: _______________
```

**驗證方式**:
按照檢查清單逐項驗證所有功能和文件

**預估時間**: 30 分鐘

---

## MVP 開發總結

### 📊 專案統計
- **總任務數**: 30 個任務
- **預估總時間**: 約 680 分鐘 (11.3 小時)
- **開發階段**: 10 個主要階段
- **核心功能**: 4 個雲端函數 + 1 個前端應用程式

### 🎯 MVP 核心功能
1. ✅ **訂單監控**: 自動檢測 Google Sheets 訂單狀態變化
2. ✅ **Line 通知**: 待處理訂單自動發送通知
3. ✅ **日曆同步**: 準備出貨訂單自動新增到 Google Calendar
4. ✅ **訂單合併**: 智慧合併同日同會員的多筆訂單
5. ✅ **Web 管理介面**: 提供訂單管理和系統監控功能
6. ✅ **錯誤處理**: 完整的重試機制和錯誤記錄
7. ✅ **系統監控**: 健康檢查和效能監控

### 🚀 部署架構
- **後端**: Google Cloud Functions (無伺服器架構)
- **前端**: React + TypeScript (可部署到 Firebase Hosting)
- **資料儲存**: Google Sheets (無需額外資料庫)
- **通知系統**: Line Bot API
- **日曆系統**: Google Calendar API

### 📈 擴展性考量
MVP 設計已考慮未來擴展需求：
- **模組化架構**: 每個功能獨立的雲端函數
- **配置驅動**: 透過配置檔案輕鬆調整參數
- **API 優先**: 所有功能都有對應的 API 端點
- **監控完整**: 具備完整的日誌和監控機制

### 🔄 後續開發建議
1. **使用者權限管理**: 實作多使用者權限控制
2. **訂單範本**: 支援不同商品類型的訂單範本
3. **報表功能**: 新增營運分析和報表功能
4. **行動應用**: 開發 Line LIFF 或原生 App
5. **庫存整合**: 整合庫存管理系統
6. **支付整合**: 整合線上支付功能

---

## 最終交付物清單

### 📁 程式碼
```
order-calendar-automation/
├── backend/                 # 後端雲端函數
├── frontend/               # 前端 React 應用程式
├── config/                 # 配置檔案範本
├── scripts/                # 部署和測試腳本
├── docs/                   # 技術文件
├── monitoring/             # 監控配置
└── tasks.md               # 本開發計劃
```

### 📚 技術文件
- ✅ **使用者手冊** (`docs/user-manual.md`)
- ✅ **API 文件** (`docs/api-documentation.md`)
- ✅ **疑難排解指南** (`docs/troubleshooting.md`)
- ✅ **部署檢查清單** (`DEPLOYMENT_CHECKLIST.md`)
- ✅ **專案說明** (`README.md`)

### 🛠️ 部署工具
- ✅ **自動部署腳本** (`scripts/deploy.sh`)
- ✅ **環境設定腳本** (`scripts/setup-monitoring.sh`)
- ✅ **測試腳本** (`scripts/test-e2e.sh`, `scripts/full-system-test.sh`)
- ✅ **Google Sheets 範本建置** (`scripts/setup-sheets-template.ts`)

### 🔧 配置範本
- ✅ **開發環境配置** (`config/development.json`)
- ✅ **生產環境配置** (`config/production.json`)
- ✅ **監控告警配置** (`monitoring/alerts.yaml`)
- ✅ **TypeScript 配置** (`tsconfig.json`)

---

## 開發建議

### 👨‍💻 給工程 LLM 的指示
1. **嚴格按順序執行**: 每個任務都有明確的輸入條件，必須按順序完成
2. **完整測試**: 每個任務完成後都要執行驗證步驟
3. **錯誤處理**: 如果任務失敗，請提供詳細的錯誤訊息和建議
4. **程式碼品質**: 保持程式碼整潔、有適當的註解和錯誤處理
5. **安全考量**: 確保 API 金鑰等敏感資訊不會暴露在程式碼中

### 🔍 測試策略
- **單元測試**: 每個服務類別都要有對應的測試
- **整合測試**: 測試各服務之間的整合
- **端到端測試**: 完整的業務流程測試
- **負載測試**: 確保系統可以處理預期的訂單量
- **錯誤測試**: 測試各種異常情況的處理

### 📊 成功指標
- ✅ 所有自動化測試通過
- ✅ 手動測試完整業務流程成功
- ✅ 系統效能符合預期（平均處理時間 < 5 秒）
- ✅ 錯誤率 < 5%
- ✅ 文件完整且易於理解
- ✅ 部署流程順暢無誤

---

**專案完成條件**: 
當所有 30 個任務都完成並通過驗證時，即表示 MVP 開發完成，可以交付給使用者進行實際測試和使用。

**預估開發時間**: 11-15 小時（依開發者經驗而定）

---

*本開發計劃最後更新日期: 2025-01-15*
*計劃版本: v1.0*