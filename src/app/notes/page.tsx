"use client";
import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Note, CalendarEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit3, Trash2, Save, NotebookText, CalendarDays, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const NoteForm: React.FC<{
  note?: Note | null;
  events: CalendarEvent[];
  onSave: (note: Note) => void;
  onClose: () => void;
}> = ({ note, events, onSave, onClose }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [calendarEventId, setCalendarEventId] = useState(note?.calendarEventId || '');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!title && !content) {
        toast({ title: "Error", description: "Note must have a title or content.", variant: "destructive" });
        return;
    }
    const now = Date.now();
    const newNote: Note = {
      id: note?.id || Date.now().toString(),
      title,
      content,
      calendarEventId: calendarEventId || undefined,
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    onSave(newNote);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{note ? 'Edit Note' : 'Add New Note'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" placeholder="Note title" />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="mt-1 min-h-[150px]" placeholder="Jot down your thoughts..." />
        </div>
        <div>
          <Label htmlFor="calendarEventId">Associate with Event (Optional)</Label>
          <Select value={calendarEventId} onValueChange={setCalendarEventId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {events.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.title} ({format(parseISO(e.start), 'MMM d')})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
            {note ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {note ? 'Save Changes' : 'Add Note'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => { // Handle URL hash for direct note access
    if (window.location.hash) {
      const noteId = window.location.hash.substring(1);
      const noteToEdit = notes.find(n => n.id === noteId);
      if (noteToEdit) {
        openNoteForm(noteToEdit);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]); // Rerun if notes load after initial mount

  const openNoteForm = (note?: Note) => {
    setEditingNote(note || null);
    setIsFormOpen(true);
  };

  const closeNoteForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    if (window.location.hash) { // Clear hash if form is closed
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const saveNote = (noteData: Note) => {
    let newNotes;
    if (editingNote) {
      newNotes = notes.map(n => n.id === noteData.id ? noteData : n);
      setNotes(newNotes);
      toast({ title: "Note Updated", description: `Note "${noteData.title || 'Untitled'}" has been updated.` });
    } else {
      newNotes = [...notes, noteData];
      setNotes(newNotes.sort((a,b) => b.updatedAt - a.updatedAt));
      toast({ title: "Note Created", description: `New note "${noteData.title || 'Untitled'}" added.` });
    }
    
    // Update associated event if calendarEventId changed
    if (noteData.calendarEventId && (!editingNote || editingNote.calendarEventId !== noteData.calendarEventId)) {
      setEvents(prevEvents => prevEvents.map(e => 
        e.id === noteData.calendarEventId ? { ...e, noteId: noteData.id } : e
      ));
    } else if (editingNote && editingNote.calendarEventId && !noteData.calendarEventId) {
      // If note was unlinked from event
      setEvents(prevEvents => prevEvents.map(e => 
        e.id === editingNote.calendarEventId ? { ...e, noteId: undefined } : e
      ));
    }
    
    closeNoteForm();
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    
    if (noteToDelete) {
      toast({ title: "Note Deleted", description: `Note "${noteToDelete.title || 'Untitled'}" removed.`, variant: "destructive" });
      // If note was associated with an event, unlink it
      if (noteToDelete.calendarEventId) {
        setEvents(prevEvents => prevEvents.map(e => 
          e.id === noteToDelete.calendarEventId ? { ...e, noteId: undefined } : e
        ));
      }
    }
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">Notes</h1>
          <p className="text-muted-foreground text-lg">Capture your thoughts, ideas, and reminders.</p>
        </div>
        <div className="flex gap-2">
        <Input 
            type="search" 
            placeholder="Search notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openNoteForm()} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Note
            </Button>
          </DialogTrigger>
          {isFormOpen && <NoteForm note={editingNote} events={events} onSave={saveNote} onClose={closeNoteForm} />}
        </Dialog>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
         <Card>
          <CardContent className="pt-6 text-center">
            <NotebookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm ? "No notes match your search." : "You have no notes."}
            </p>
            {!searchTerm && <p className="text-sm text-muted-foreground">Click "Add Note" to create your first one.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map(note => {
            const associatedEvent = note.calendarEventId ? events.find(e => e.id === note.calendarEventId) : null;
            return (
              <Card key={note.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-headline text-xl truncate">{note.title || 'Untitled Note'}</CardTitle>
                  <CardDescription>Last updated: {format(new Date(note.updatedAt), 'PPp')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm line-clamp-4 text-muted-foreground">{note.content || 'No content.'}</p>
                  {associatedEvent && (
                    <Link href={`/calendar`} className="mt-2 text-xs text-primary hover:underline flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" /> Linked to: {associatedEvent.title}
                    </Link>
                  )}
                </CardContent>
                <CardContent className="border-t pt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openNoteForm(note)}>
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
