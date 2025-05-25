// backend/src/tests/test-calendar.ts
import { GoogleCalendarClient } from '../shared/services/GoogleCalendarClient';
import { CalendarEvent } from '../shared/types/Calendar';

const MOCK_CREDENTIALS = { client_email: 'test@example.com', private_key: 'test_key_for_initialization_only' };
const MOCK_CALENDAR_ID = 'test-calendar-id';
const MOCK_EVENT_ID = 'mock-event-id-from-create';

async function testCalendarCreateAndUpdate() {
  console.log('Starting testCalendarCreateAndUpdate...');
  const client = new GoogleCalendarClient(MOCK_CREDENTIALS);

  let insertCalledWith: any = null;
  let updateCalledWith: any = null;

  // Mock Calendar API methods
  client['calendar'] = {
    events: {
      insert: async (params: any) => {
        console.log('Mocked calendar.events.insert called with:', params);
        insertCalledWith = params;
        return { data: { id: MOCK_EVENT_ID, summary: params.requestBody.summary } }; // Simulate response
      },
      update: async (params: any) => {
        console.log('Mocked calendar.events.update called with:', params);
        updateCalledWith = params;
        return { data: { id: params.eventId, summary: params.requestBody.summary } }; // Simulate response
      },
    },
  } as any;

  const testEvent: CalendarEvent = {
    summary: '張三 - 訂單領取 (Test)',
    description: '商品: 蛋糕 x2\n訂單ID: ORD-001-TEST',
    start: '2024-01-25T14:00:00+08:00',
    end: '2024-01-25T14:30:00+08:00',
    colorId: '1', // Blue
  };

  try {
    // Test createEvent
    console.log('Testing createEvent...');
    const createdEventId = await client.createEvent(MOCK_CALENDAR_ID, testEvent);
    if (insertCalledWith && createdEventId === MOCK_EVENT_ID) {
      console.log('testCalendarCreateAndUpdate: createEvent mock was called successfully and returned mock ID.');
      if (insertCalledWith.calendarId !== MOCK_CALENDAR_ID || 
          insertCalledWith.requestBody.summary !== testEvent.summary ||
          insertCalledWith.requestBody.start.dateTime !== testEvent.start) {
        console.error('Validation Error: Parameters for insert call are incorrect.');
      }
    } else {
      console.error('testCalendarCreateAndUpdate: createEvent mock was NOT called or did not return mock ID.');
    }

    // Test updateEvent
    console.log('\nTesting updateEvent...');
    const updatedEventData: CalendarEvent = { ...testEvent, summary: '張三 - 訂單領取 (Updated Test)' };
    if (createdEventId) { // Ensure createdEventId is valid before using
        await client.updateEvent(MOCK_CALENDAR_ID, createdEventId, updatedEventData);
        if (updateCalledWith) {
            console.log('testCalendarCreateAndUpdate: updateEvent mock was called successfully.');
            if (updateCalledWith.calendarId !== MOCK_CALENDAR_ID ||
                updateCalledWith.eventId !== createdEventId ||
                updateCalledWith.requestBody.summary !== updatedEventData.summary) {
                console.error('Validation Error: Parameters for update call are incorrect.');
            }
        } else {
            console.error('testCalendarCreateAndUpdate: updateEvent mock was NOT called.');
        }
    } else {
        console.error('Skipping updateEvent test as createdEventId is not valid.');
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('testCalendarCreateAndUpdate failed:', message);
  }
}

testCalendarCreateAndUpdate()
    .then(() => console.log('\ntestCalendarCreateAndUpdate finished.'))
    .catch(e => console.error('Unhandled error in testCalendarCreateAndUpdate:', e));
