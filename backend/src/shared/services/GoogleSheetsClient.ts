// backend/src/shared/services/GoogleSheetsClient.ts
import { google, sheets_v4 } from 'googleapis';
import { Order, OrderStatus } from '../types/Order'; // Adjust path as needed

// Placeholder for credentials type, or use 'any' for now
// import { Credentials } from 'google-auth-library'; 

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  private googleAuth: any; // Placeholder for GoogleAuth type

  constructor(credentials: any) { // Replace 'any' with actual credentials type later
    // Initialize Google Sheets client
    // const auth = new google.auth.GoogleAuth({
    //   credentials,
    //   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    // });
    // this.googleAuth = auth; // Store auth client if needed for other operations
    // this.sheets = google.sheets({ version: 'v4', auth });
    
    // For now, as per tasks.md, just the structure. Implementation in later tasks.
    // tasks.md shows `private sheets: sheets_v4.Sheets;`
    // tasks.md shows `constructor(credentials: any)`
    // tasks.md implies initialization happens here.
    // Actual initialization will be part of a later task.
    // For this task, focus on the class and method structure.
    
    // To make the constructor and class definition valid with the private member:
    const auth = new google.auth.GoogleAuth({
      // Scopes are essential for Google Sheets API
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      // Credentials will be passed in, actual loading/passing mechanism TBD by later tasks or config
      // For placeholder, an empty credentials object might be needed if not allowing undefined
      credentials: credentials || { client_email: 'test@example.com', private_key: 'test_key' } // Example placeholder
    });
    this.sheets = google.sheets({ version: 'v4', auth: auth }); // Initialize with auth
    console.log('GoogleSheetsClient initialized (structure only for now)');
  }

  async readOrderData(sheetId: string, range: string): Promise<Order[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in sheet.');
        return [];
      }

      // Assume header row is present and skip it, or adjust if no header
      const orders: Order[] = [];
      // Start from row 1 if there's a header, 0 otherwise. tasks.md implies A1:G100, so header is likely.
      for (let i = 1; i < rows.length; i++) { 
        const row = rows[i];
        if (!row || row.length < 7) { // Expect at least 7 columns as per Order interface
          console.warn(`Skipping row ${i + 1}: insufficient data or empty row.`);
          continue;
        }

        // Validate and transform data
        const orderId = row[0];
        const memberInfo = row[1];
        const products = row[2];
        const pickupTime = row[3]; // Assuming string format, validation might be needed
        const statusString = row[4];
        const changeCountStr = row[5];
        const lastUpdated = row[6];

        if (!orderId || !memberInfo || !products || !pickupTime || !statusString || !changeCountStr || !lastUpdated) {
          console.warn(`Skipping row ${i + 1}: missing essential data.`);
          continue;
        }
        
        let status: OrderStatus;
        switch (statusString) {
          case OrderStatus.PENDING:
            status = OrderStatus.PENDING;
            break;
          case OrderStatus.READY_TO_SHIP:
            status = OrderStatus.READY_TO_SHIP;
            break;
          case OrderStatus.SHIPPED:
            status = OrderStatus.SHIPPED;
            break;
          default:
            console.warn(`Skipping row ${i + 1}: Invalid order status "${statusString}"`);
            continue;
        }

        const changeCount = parseInt(changeCountStr, 10);
        if (isNaN(changeCount)) {
          console.warn(`Skipping row ${i + 1}: Invalid change count "${changeCountStr}"`);
          continue;
        }

        orders.push({
          orderId,
          memberInfo,
          products,
          pickupTime,
          status,
          changeCount,
          lastUpdated,
        });
      }
      console.log(`Successfully read and parsed ${orders.length} orders.`);
      return orders;
    } catch (error) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error reading order data from Google Sheets:', errorMessage, error);
      // Consider re-throwing or returning a specific error object
      throw new Error(`Failed to read order data: ${errorMessage}`);
    }
  }

  async updateOrderStatus(sheetId: string, orderIdToUpdate: string, newStatus: OrderStatus): Promise<void> {
    console.log(`Attempting to update status for orderId: ${orderIdToUpdate} to ${newStatus}`);
    try {
      // 1. Read existing data to find the row and existing changeCount
      const rangeToRead = 'Orders!A:G'; // Read all relevant columns
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: rangeToRead,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found in sheet to update.');
      }

      let rowIndex = -1;
      let currentChangeCount = 0;

      // Assuming the first row is headers
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === orderIdToUpdate) { // OrderID is in the first column (A)
          rowIndex = i + 1; // Sheet rows are 1-indexed
          currentChangeCount = parseInt(rows[i][5], 10) || 0; // Change count in 6th column (F)
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Order ID "${orderIdToUpdate}" not found in sheet.`);
      }

      // 2. Prepare data for update (Status, Change Count, Last Updated)
      // Status is in column E (5th column), Change Count in F (6th), Last Updated in G (7th)
      const newChangeCount = currentChangeCount + 1;
      const lastUpdatedTimestamp = new Date().toISOString();
      
      const valuesToUpdate = [
        [newStatus, newChangeCount, lastUpdatedTimestamp]
      ];

      // Range for update: e.g., 'Orders!E[rowIndex]:G[rowIndex]'
      const rangeToUpdate = `Orders!E${rowIndex}:G${rowIndex}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: rangeToUpdate,
        valueInputOption: 'USER_ENTERED', // or 'RAW'
        requestBody: {
          values: valuesToUpdate,
        },
      });
      console.log(`Order ID "${orderIdToUpdate}" status updated to "${newStatus}", change count to ${newChangeCount}.`);
    } catch (error) {
      console.error(`Error updating order status for ${orderIdToUpdate}:`, error);
      if (error instanceof Error) {
          throw new Error(`Failed to update order status: ${error.message}`);
      }
      throw new Error('Failed to update order status due to an unknown error.');
    }
  }

  async logSystemAction(sheetId: string, action: string, result: string, details: string = ''): Promise<void> {
    console.log(`Logging system action: Action=${action}, Result=${result}, Details=${details}`);
    try {
      const rangeToAppend = 'SystemLogs!A:D'; // Assuming logs have Timestamp, Action, Result, Details
      const timestamp = new Date().toISOString();
      const valuesToAppend = [
        [timestamp, action, result, details]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: rangeToAppend, // Sheet name and columns
        valueInputOption: 'USER_ENTERED', // Or 'RAW'
        insertDataOption: 'INSERT_ROWS', // Append as new rows
        requestBody: {
          values: valuesToAppend,
        },
      });
      console.log('System action logged successfully.');
    } catch (error) {
      console.error('Error logging system action:', error);
      if (error instanceof Error) {
          throw new Error(`Failed to log system action: ${error.message}`);
      }
      throw new Error('Failed to log system action due to an unknown error.');
    }
  }
}
