"use client";
import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { CalendarEvent, Alarm, Note, Settings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict, addDays } from 'date-fns';
import { AlarmClock, CalendarDays, NotebookText, ChevronRight, Info, TimerIcon } from 'lucide-react';

const UpcomingEventsClient = () => {
  const [events] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const today = new Date();
    const endOfTomorrow = addDays(today, 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const filtered = events
      .map(event => ({ ...event, start: parseISO(event.start), end: parseISO(event.end) }))
      .filter(event => {
        const eventEnd = event.end;
        return eventEnd >= today && event.start <= endOfTomorrow;
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    setUpcomingEvents(filtered.slice(0, 5)); // Show up to 5
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-xl">
          <CalendarDays className="mr-2 h-6 w-6 text-primary" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Today & Tomorrow's Schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <ul className="space-y-3">
            {upcomingEvents.map(event => (
              <li key={event.id} className="p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                <Link href="/calendar" className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-base">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isToday(event.start) ? 'Today' : isTomorrow(event.start) ? 'Tomorrow' : format(event.start, 'EEE, MMM d')}
                      {', '}
                      {event.allDay ? 'All Day' : `${format(event.start, 'p')} - ${format(event.end, 'p')}`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">No upcoming events for today or tomorrow.</p>
        )}
        <Button variant="link" asChild className="mt-4 px-0">
          <Link href="/calendar">View Full Calendar <ChevronRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const ActiveAlarmsClient = () => {
  const [alarms] = useLocalStorage<Alarm[]>('alarms', []);
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }) as Alarm['days'][number];
    
    const filtered = alarms.filter(alarm => {
      if (!alarm.isEnabled) return false;
      if (alarm.days.length > 0 && !alarm.days.includes(currentDay)) return false;
      return true; 
    }).sort((a,b) => {
        const timeA = parseInt(a.time.replace(':',''));
        const timeB = parseInt(b.time.replace(':',''));
        return timeA - timeB;
    });
    setActiveAlarms(filtered.slice(0,3)); // Show up to 3
  }, [alarms]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-xl">
          <AlarmClock className="mr-2 h-6 w-6 text-primary" />
          Active Alarms
        </CardTitle>
        <CardDescription>Your enabled alarms</CardDescription>
      </CardHeader>
      <CardContent>
        {activeAlarms.length > 0 ? (
          <ul className="space-y-3">
            {activeAlarms.map(alarm => (
              <li key={alarm.id} className="p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                <Link href="/alarms" className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-base">{alarm.label || 'Alarm'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {alarm.time} {alarm.days.length > 0 ? `(${alarm.days.join(', ')})` : '(Once)'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">No active alarms set.</p>
        )}
        <Button variant="link" asChild className="mt-4 px-0">
          <Link href="/alarms">Manage Alarms <ChevronRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const RecentNotesClient = () => {
  const [notes] = useLocalStorage<Note[]>('notes', []);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  useEffect(() => {
    const sorted = [...notes].sort((a,b) => b.updatedAt - a.updatedAt);
    setRecentNotes(sorted.slice(0,3)); // Show up to 3 recent notes
  }, [notes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-xl">
          <NotebookText className="mr-2 h-6 w-6 text-primary" />
          Recent Notes
        </CardTitle>
        <CardDescription>Your latest jottings</CardDescription>
      </CardHeader>
      <CardContent>
        {recentNotes.length > 0 ? (
          <ul className="space-y-3">
            {recentNotes.map(note => (
              <li key={note.id} className="p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                <Link href="/notes" className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-base truncate max-w-xs">{note.title || 'Untitled Note'}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {formatDistanceToNowStrict(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">No notes available.</p>
        )}
        <Button variant="link" asChild className="mt-4 px-0">
          <Link href="/notes">View All Notes <ChevronRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const DEFAULT_SETTINGS: Settings = {
  username: 'User',
  theme: 'system',
  geminiApiKey: '',
  defaultTimezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
};

export default function DashboardPage() {
  const [settings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">{greeting}, {settings.username}!</h1>
        <p className="text-muted-foreground text-lg">Here's your overview for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingEventsClient />
        <ActiveAlarmsClient />
        <RecentNotesClient />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center text-xl">
            <Info className="mr-2 h-6 w-6 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" asChild className="py-6 text-base">
            <Link href="/calendar#new-event">
              <CalendarDays className="mr-2 h-5 w-5" /> New Event
            </Link>
          </Button>
          <Button variant="outline" asChild className="py-6 text-base">
            <Link href="/alarms#new-alarm">
              <AlarmClock className="mr-2 h-5 w-5" /> New Alarm
            </Link>
          </Button>
          <Button variant="outline" asChild className="py-6 text-base">
            <Link href="/notes#new-note">
              <NotebookText className="mr-2 h-5 w-5" /> New Note
            </Link>
          </Button>
          <Button variant="outline" asChild className="py-6 text-base">
            <Link href="/timers">
              <TimerIcon className="mr-2 h-5 w-5" /> Start Timer
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
