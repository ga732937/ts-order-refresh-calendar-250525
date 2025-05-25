// backend/src/shared/types/System.ts
export interface SystemConfig {
  google: {
    projectId: string;
    sheetsId: string;
    calendarId: string;
  };
  linebot: {
    channelAccessToken: string;
    // Self-correction: tasks.md shows channelSecret in architecture.md but not in SystemConfig for tasks.md.
    // For now, sticking to tasks.md for System.ts. If channelSecret is needed by LineBotClient, it can be added later or handled via env vars.
  };
}
