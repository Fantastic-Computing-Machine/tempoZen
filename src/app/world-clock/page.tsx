"use client";
import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { WorldClock } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Sun, Moon, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WorldClockCardProps {
  clock: WorldClock;
  onDelete: (id: string) => void;
}

const WorldClockCard: React.FC<WorldClockCardProps> = ({ clock, onDelete }) => {
  const [time, setTime] = useState('');
  const [isDay, setIsDay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateClock = useCallback(() => {
    try {
      const date = new Date();
      // Check if timezone is valid before using it
      new Intl.DateTimeFormat('en-US', { timeZone: clock.timezone }).format(date);
      
      const timeString = date.toLocaleTimeString('en-US', {
        timeZone: clock.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const hour = parseInt(date.toLocaleString('en-US', {
        timeZone: clock.timezone,
        hour: '2-digit',
        hourCycle: 'h23'
      }));

      setTime(timeString);
      setIsDay(hour >= 6 && hour < 18);
      setError(null);
    } catch (e) {
      setError('Invalid Timezone');
      setTime('--:--:--');
    }
  }, [clock.timezone]);

  useEffect(() => {
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, [updateClock]);

  return (
    <Card className={`transition-shadow ${error ? 'border-destructive' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-headline text-xl">{clock.label}</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => onDelete(clock.id)} className="text-destructive hover:text-destructive/90">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-4xl font-mono text-primary">{time}</p>
          {isDay && !error ? <Sun className="h-8 w-8 text-yellow-500" /> : <Moon className="h-8 w-8 text-slate-400" />}
        </div>
        <p className="text-sm text-muted-foreground mt-2 truncate">{error ? error : clock.timezone}</p>
      </CardContent>
    </Card>
  );
};

export default function WorldClockPage() {
  const [clocks, setClocks] = useLocalStorage<WorldClock[]>('world-clocks', []);
  const [newLabel, setNewLabel] = useState('');
  const [newTimezone, setNewTimezone] = useState('');
  const { toast } = useToast();

  const addClock = () => {
    if (!newLabel.trim() || !newTimezone.trim()) {
      toast({ title: "Missing Fields", description: "Please provide both a label and a timezone.", variant: "destructive" });
      return;
    }

    try {
      // Test the timezone validity
      new Intl.DateTimeFormat('en-US', { timeZone: newTimezone }).format();
    } catch (e) {
      toast({ title: "Invalid Timezone", description: "Please enter a valid IANA timezone name (e.g., America/New_York).", variant: "destructive" });
      return;
    }

    const newClock: WorldClock = {
      id: Date.now().toString(),
      label: newLabel,
      timezone: newTimezone,
    };
    setClocks(prev => [...prev, newClock]);
    toast({ title: "Clock Added", description: `Added clock for ${newLabel}.` });
    setNewLabel('');
    setNewTimezone('');
  };

  const deleteClock = (id: string) => {
    const clockToDelete = clocks.find(c => c.id === id);
    setClocks(prev => prev.filter(c => c.id !== id));
    if (clockToDelete) {
      toast({ title: "Clock Removed", description: `Removed clock for ${clockToDelete.label}.`, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">World Clock</h1>
        <p className="text-muted-foreground text-lg">Keep track of time across the globe.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add a New Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g., New York, Tokyo" />
            </div>
            <div>
              <Label htmlFor="timezone">IANA Timezone</Label>
              <Input id="timezone" value={newTimezone} onChange={e => setNewTimezone(e.target.value)} placeholder="e.g., America/New_York" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addClock} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Clock
          </Button>
        </CardFooter>
      </Card>

      {clocks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No world clocks added yet.</p>
            <p className="text-sm text-muted-foreground">Use the form above to add your first clock.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clocks.map(clock => (
            <WorldClockCard key={clock.id} clock={clock} onDelete={deleteClock} />
          ))}
        </div>
      )}
    </div>
  );
}
