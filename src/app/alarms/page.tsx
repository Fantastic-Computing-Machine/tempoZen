"use client";
import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Alarm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit3, Save, XCircle, AlarmClock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK: Alarm['days'][number][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AlarmsPage() {
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>('alarms', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const { toast } = useToast();

  const [alarmForm, setAlarmForm] = useState<{
    time: string;
    label: string;
    days: Alarm['days'][number][];
    isEnabled: boolean;
  }>({ time: '07:00', label: '', days: [], isEnabled: true });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAlarmForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: Alarm['days'][number]) => {
    setAlarmForm(prev => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  const handleSubmit = () => {
    if (!alarmForm.time) {
        toast({ title: "Error", description: "Time is required for an alarm.", variant: "destructive" });
        return;
    }
    if (editingAlarm) {
      setAlarms(prevAlarms => prevAlarms.map(a => a.id === editingAlarm.id ? { ...editingAlarm, ...alarmForm } : a));
      toast({ title: "Alarm Updated", description: `Alarm "${alarmForm.label || alarmForm.time}" has been updated.` });
    } else {
      const newAlarm: Alarm = {
        id: Date.now().toString(),
        ...alarmForm,
        createdAt: Date.now(),
      };
      setAlarms(prevAlarms => [...prevAlarms, newAlarm].sort((a,b) => a.time.localeCompare(b.time)));
      toast({ title: "Alarm Created", description: `New alarm "${newAlarm.label || newAlarm.time}" set.` });
    }
    closeForm();
  };

  const openEditForm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setAlarmForm({ time: alarm.time, label: alarm.label, days: alarm.days, isEnabled: alarm.isEnabled });
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingAlarm(null);
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 5); // 5 minutes from now
    setAlarmForm({ time: `${String(defaultTime.getHours()).padStart(2, '0')}:${String(defaultTime.getMinutes()).padStart(2, '0')}`, label: '', days: [], isEnabled: true });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAlarm(null);
  };

  const deleteAlarm = (id: string) => {
    const alarmToDelete = alarms.find(a => a.id === id);
    setAlarms(prevAlarms => prevAlarms.filter(a => a.id !== id));
    if (alarmToDelete) {
      toast({ title: "Alarm Deleted", description: `Alarm "${alarmToDelete.label || alarmToDelete.time}" removed.`, variant: "destructive" });
    }
  };

  const toggleAlarm = (id: string, isEnabled: boolean) => {
    setAlarms(prevAlarms => prevAlarms.map(a => a.id === id ? { ...a, isEnabled } : a));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">Alarms</h1>
          <p className="text-muted-foreground text-lg">Set and manage your alarms.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewForm} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Alarm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{editingAlarm ? 'Edit Alarm' : 'Add New Alarm'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="time" className="text-base">Time</Label>
                <Input id="time" name="time" type="time" value={alarmForm.time} onChange={handleInputChange} className="mt-1 text-lg p-2" />
              </div>
              <div>
                <Label htmlFor="label" className="text-base">Label (Optional)</Label>
                <Input id="label" name="label" value={alarmForm.label} onChange={handleInputChange} placeholder="e.g., Morning Workout" className="mt-1" />
              </div>
              <div>
                <Label className="text-base block mb-2">Repeat</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day}
                      variant={alarmForm.days.includes(day) ? 'default' : 'outline'}
                      onClick={() => handleDayToggle(day)}
                      className="flex-1 min-w-[50px]"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isEnabled" className="text-base">Enable Alarm</Label>
                <Switch
                  id="isEnabled"
                  checked={alarmForm.isEnabled}
                  onCheckedChange={checked => setAlarmForm(prev => ({ ...prev, isEnabled: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={closeForm}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {editingAlarm ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {editingAlarm ? 'Save Changes' : 'Add Alarm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Current Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-mono text-primary">{currentTime || "Loading..."}</p>
        </CardContent>
      </Card>

      {alarms.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlarmClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">You have no alarms set.</p>
            <p className="text-sm text-muted-foreground">Click "Add Alarm" to create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alarms.map(alarm => (
            <Card key={alarm.id} className={`transition-opacity ${alarm.isEnabled ? 'opacity-100' : 'opacity-60 bg-muted/50'}`}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-medium">{alarm.time}</p>
                  <p className="text-sm text-muted-foreground">{alarm.label || 'Alarm'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alarm.days.length > 0 ? alarm.days.join(', ') : 'Once'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={alarm.isEnabled}
                    onCheckedChange={checked => toggleAlarm(alarm.id, checked)}
                    aria-label={alarm.isEnabled ? 'Disable alarm' : 'Enable alarm'}
                  />
                   <Button variant="ghost" size="icon" onClick={() => openEditForm(alarm)} aria-label="Edit alarm">
                    <Edit3 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteAlarm(alarm.id)} aria-label="Delete alarm" className="text-destructive hover:text-destructive/90">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
