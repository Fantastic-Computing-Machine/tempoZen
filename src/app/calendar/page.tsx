"use client";
import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { CalendarEvent, Note } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit3, Trash2, Save, CalendarDays, ListChecks, NotebookTextIcon } from 'lucide-react';
import { format, parseISO, startOfDay, isEqual, isBefore, addMinutes } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const EventForm: React.FC<{
  event?: CalendarEvent | null;
  notes: Note[];
  selectedDate: Date;
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}> = ({ event, notes, selectedDate, onSave, onClose }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState(event ? format(parseISO(event.start), "yyyy-MM-dd") : format(selectedDate, "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(event ? format(parseISO(event.start), "HH:mm") : "09:00");
  const [endDate, setEndDate] = useState(event ? format(parseISO(event.end), "yyyy-MM-dd") : format(selectedDate, "yyyy-MM-dd"));
  const [endTime, setEndTime] = useState(event ? format(parseISO(event.end), "HH:mm") : "10:00");
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [description, setDescription] = useState(event?.description || '');
  const [noteId, setNoteId] = useState(event?.noteId || '');
  const { toast } = useToast();

  useEffect(() => { // Auto-update end date if start date changes and was same as end date
    if (!event && !allDay) { // Only for new events or when not all-day
        const currentStartDate = parseISO(`${startDate}T${startTime}`);
        const currentEndDate = parseISO(`${endDate}T${endTime}`);
        if (isBefore(currentEndDate, currentStartDate)) {
            setEndDate(startDate);
            setEndTime(format(addMinutes(currentStartDate, 60), "HH:mm")); // Default to 1 hour duration
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, startTime]);


  const handleSubmit = () => {
    if (!title) {
        toast({ title: "Error", description: "Event title is required.", variant: "destructive" });
        return;
    }
    
    const startDateTime = allDay ? startOfDay(parseISO(startDate)) : parseISO(`${startDate}T${startTime}`);
    let endDateTime = allDay ? startOfDay(parseISO(endDate)) : parseISO(`${endDate}T${endTime}`);

    if (isBefore(endDateTime, startDateTime) && !allDay) {
      toast({ title: "Error", description: "End time cannot be before start time.", variant: "destructive" });
      return;
    }
    if (isEqual(endDateTime, startDateTime) && !allDay) { // Ensure minimum duration if not all day
        endDateTime = addMinutes(startDateTime, 30); // Min 30 mins duration
    }


    const newEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      allDay,
      description,
      noteId: noteId || undefined,
      createdAt: event?.createdAt || Date.now(),
    };
    onSave(newEvent);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{event ? 'Edit Event' : 'Add New Event'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
        </div>
        <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="allDay" checked={allDay} onCheckedChange={(checked) => setAllDay(Boolean(checked))} />
            <Label htmlFor="allDay">All day event</Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
          </div>
          {!allDay && (
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" 
              min={allDay ? startDate : undefined} // Ensure end date is not before start date for all-day events
            />
          </div>
          {!allDay && (
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1" />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="noteId">Associate Note (Optional)</Label>
          <Select value={noteId} onValueChange={setNoteId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a note" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {notes.map(n => (
                <SelectItem key={n.id} value={n.id}>{n.title || `Note created ${format(new Date(n.createdAt), 'PPp')}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
            {event ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {event ? 'Save Changes' : 'Add Event'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function CalendarPage() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [notes] = useLocalStorage<Note[]>('notes', []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  const handleDateSelect = (date?: Date) => {
    setSelectedDate(date);
  };
  
  const handleDayDoubleClick = (day: Date) => {
    setSelectedDate(day);
    openEventForm();
  };

  const openEventForm = (event?: CalendarEvent) => {
    setEditingEvent(event || null);
    if (!event && selectedDate) {
      // If creating new event, prefill date from calendar selection
    }
    setIsFormOpen(true);
  };

  const closeEventForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const saveEvent = (eventData: CalendarEvent) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      toast({ title: "Event Updated", description: `Event "${eventData.title}" has been updated.` });
    } else {
      setEvents(prev => [...prev, eventData].sort((a,b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()));
      toast({ title: "Event Created", description: `New event "${eventData.title}" added.` });
    }
    closeEventForm();
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    if (eventToDelete) {
      toast({ title: "Event Deleted", description: `Event "${eventToDelete.title}" removed.`, variant: "destructive" });
    }
  };

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .map(e => ({ ...e, start: parseISO(e.start), end: parseISO(e.end) })) // Parse dates for comparison
      .filter(event => {
        const eventStartDate = startOfDay(event.start);
        const selDate = startOfDay(selectedDate);
        return isEqual(eventStartDate, selDate) || (event.allDay && isBefore(eventStartDate, selDate) && isBefore(selDate, startOfDay(event.end)));
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);
  
  const eventDays = useMemo(() => {
    return events.map(event => parseISO(event.start));
  }, [events]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">Calendar</h1>
          <p className="text-muted-foreground text-lg">Manage your events and schedule.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEventForm()} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Event
            </Button>
          </DialogTrigger>
          {isFormOpen && <EventForm event={editingEvent} notes={notes} selectedDate={selectedDate || new Date()} onSave={saveEvent} onClose={closeEventForm} />}
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex justify-center">
          <ShadCalendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            onDayDoubleClick={handleDayDoubleClick}
            numberOfMonths={3}
            modifiers={{ events: eventDays }}
            modifiersClassNames={{ events: 'bg-primary/20 rounded-full' }}
          />
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">
                <ListChecks className="inline-block mr-2 h-6 w-6 text-primary" />
                Events on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {eventsOnSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {eventsOnSelectedDate.map(event => (
                  <li key={event.id} className="p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.allDay ? 'All Day' : `${format(event.start, 'p')} - ${format(event.end, 'p')}`}
                        </p>
                        {event.description && <p className="text-xs mt-1 text-muted-foreground/80 truncate">{event.description}</p>}
                        {event.noteId && notes.find(n=>n.id === event.noteId) && 
                          <Link href={`/notes#${event.noteId}`} className="text-xs text-primary hover:underline mt-1 flex items-center">
                            <NotebookTextIcon className="h-3 w-3 mr-1"/> Associated Note: {notes.find(n=>n.id === event.noteId)?.title || 'Untitled'}
                          </Link>
                        }
                      </div>
                      <div className="flex space-x-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEventForm(event)} className="h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} className="h-8 w-8 text-destructive hover:text-destructive/90">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">No events for this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
