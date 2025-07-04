export interface Alarm {
  id: string;
  time: string; // HH:MM
  label: string;
  days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  isEnabled: boolean;
  createdAt: number;
}

export interface Timer {
  id: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
  label: string;
  createdAt: number;
  intervalId?: NodeJS.Timeout; 
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  calendarEventId?: string; 
  reminderAt?: number; 
  color?: string; // Optional color for the note
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string for Date
  end: string;   // ISO string for Date
  description?: string;
  noteId?: string; 
  color?: string; 
  createdAt: number;
  allDay?: boolean;
}

export interface WorldClock {
  id: string;
  timezone: string; // IANA timezone name e.g., "America/New_York"
  label: string; // e.g., "New York"
}
