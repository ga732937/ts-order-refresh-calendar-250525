// backend/src/shared/types/Calendar.ts
export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: string; // Expected to be ISO 8601 string
  end: string;   // Expected to be ISO 8601 string
  colorId?: string;
}
