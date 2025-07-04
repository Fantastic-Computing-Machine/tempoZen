"use client";
import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Timer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Play, Pause, RotateCcw, TimerIcon as TimerIconLucide } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface TimerInstanceProps {
  timer: Timer;
  onUpdate: (updatedTimer: Timer) => void;
  onDelete: (id: string) => void;
}

const TimerInstance: React.FC<TimerInstanceProps> = ({ timer, onUpdate, onDelete }) => {
  useEffect(() => {
    if (timer.isRunning && timer.remaining > 0) {
      const intervalId = setInterval(() => {
        onUpdate({ ...timer, remaining: timer.remaining - 1 });
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timer.isRunning && timer.remaining <= 0) {
      // Timer finished
      onUpdate({ ...timer, isRunning: false, remaining: 0 });
      // Here you could play a sound or show a notification
      // For now, let's assume it stops.
    }
  }, [timer, onUpdate]);

  const handleTogglePlay = () => {
    if (timer.remaining <= 0) return; // Don't start if finished
    onUpdate({ ...timer, isRunning: !timer.isRunning });
  };

  const handleReset = () => {
    onUpdate({ ...timer, isRunning: false, remaining: timer.duration });
  };

  const progressPercentage = timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0;

  return (
    <Card className="w-full transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex justify-between items-center">
          {timer.label || 'Timer'}
          <Button variant="ghost" size="icon" onClick={() => onDelete(timer.id)} className="text-destructive hover:text-destructive/90">
            <Trash2 className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription>Original duration: {formatTime(timer.duration)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-5xl font-mono text-center text-primary">{formatTime(timer.remaining)}</p>
        <Progress value={progressPercentage} aria-label={`${Math.round(progressPercentage)}% complete`} />
        <div className="flex justify-center space-x-3">
          <Button onClick={handleTogglePlay} disabled={timer.remaining <= 0 && !timer.isRunning} variant="outline" size="lg">
            {timer.isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {timer.isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TimersPage() {
  const [timers, setTimers] = useLocalStorage<Timer[]>('timers', []);
  const { toast } = useToast();
  
  // State for new timer form
  const [newTimerHours, setNewTimerHours] = useState<string>('0');
  const [newTimerMinutes, setNewTimerMinutes] = useState<string>('5');
  const [newTimerSeconds, setNewTimerSeconds] = useState<string>('0');
  const [newTimerLabel, setNewTimerLabel] = useState<string>('');

  const addTimer = () => {
    const hours = parseInt(newTimerHours) || 0;
    const minutes = parseInt(newTimerMinutes) || 0;
    const seconds = parseInt(newTimerSeconds) || 0;
    const totalDuration = hours * 3600 + minutes * 60 + seconds;

    if (totalDuration <= 0) {
      toast({ title: "Invalid Duration", description: "Timer duration must be greater than 0 seconds.", variant: "destructive" });
      return;
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      duration: totalDuration,
      remaining: totalDuration,
      isRunning: false,
      label: newTimerLabel || `Timer ${timers.length + 1}`,
      createdAt: Date.now(),
    };
    setTimers(prevTimers => [...prevTimers, newTimer]);
    toast({ title: "Timer Added", description: `"${newTimer.label}" for ${formatTime(totalDuration)} created.` });
    
    // Reset form
    setNewTimerHours('0');
    setNewTimerMinutes('5');
    setNewTimerSeconds('0');
    setNewTimerLabel('');
  };

  const updateTimer = (updatedTimer: Timer) => {
    setTimers(prevTimers => prevTimers.map(t => t.id === updatedTimer.id ? updatedTimer : t));
  };

  const deleteTimer = (id: string) => {
    const timerToDelete = timers.find(t => t.id === id);
    setTimers(prevTimers => prevTimers.filter(t => t.id !== id));
    if (timerToDelete) {
        toast({ title: "Timer Deleted", description: `Timer "${timerToDelete.label}" removed.`, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Timers</h1>
        <p className="text-muted-foreground text-lg">Create and manage your countdown timers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add New Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" type="number" value={newTimerHours} onChange={e => setNewTimerHours(e.target.value)} min="0" />
            </div>
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input id="minutes" type="number" value={newTimerMinutes} onChange={e => setNewTimerMinutes(e.target.value)} min="0" max="59" />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input id="seconds" type="number" value={newTimerSeconds} onChange={e => setNewTimerSeconds(e.target.value)} min="0" max="59" />
            </div>
          </div>
          <div>
            <Label htmlFor="label">Label (Optional)</Label>
            <Input id="label" type="text" value={newTimerLabel} onChange={e => setNewTimerLabel(e.target.value)} placeholder="e.g., Pomodoro Break" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addTimer} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Timer
          </Button>
        </CardFooter>
      </Card>

      {timers.length === 0 ? (
         <Card>
          <CardContent className="pt-6 text-center">
            <TimerIconLucide className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No active timers.</p>
            <p className="text-sm text-muted-foreground">Create a new timer using the form above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {timers.map(timer => (
            <TimerInstance key={timer.id} timer={timer} onUpdate={updateTimer} onDelete={deleteTimer} />
          ))}
        </div>
      )}
    </div>
  );
}
