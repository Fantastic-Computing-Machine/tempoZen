"use client";
import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Settings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, User, KeyRound, Clock, Sun, Moon, Laptop } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { timezones } from '@/lib/timezones';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


const DEFAULT_SETTINGS: Settings = {
  username: 'User',
  theme: 'system',
  geminiApiKey: '',
  defaultTimezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
};

function TimezoneCombobox({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{value ? timezones.find((tz) => tz === value) || "Select timezone..." : "Select timezone..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandEmpty>No timezone found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {timezones.map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={(currentValue) => {
                    const selectedTimezone = timezones.find(t => t.toLowerCase() === currentValue);
                    if (selectedTimezone) {
                      onChange(value === selectedTimezone ? "" : selectedTimezone);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tz ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tz}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
  // Separate state for theme to trigger AppShell re-render immediately
  const [, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [formState, setFormState] = useState<Settings>(DEFAULT_SETTINGS);
  const { toast } = useToast();

  useEffect(() => {
    // Sync local form state with localStorage on component mount
    setFormState(settings);
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setFormState(prev => ({ ...prev, theme: newTheme }));
  };

  const handleSave = () => {
    setSettings(formState);
    setTheme(formState.theme); // Update the separate theme value
    toast({
      title: "Settings Saved",
      description: "Your new preferences have been saved.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your application preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
          <CardDescription>Customize your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center"><User className="mr-2 h-4 w-4" />Username</Label>
            <Input id="username" name="username" value={formState.username} onChange={handleInputChange} placeholder="Your name" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Appearance</CardTitle>
          <CardDescription>Adjust how the application looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Tabs value={formState.theme} onValueChange={(value) => handleThemeChange(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="light"><Sun className="mr-2 h-4 w-4" />Light</TabsTrigger>
                <TabsTrigger value="dark"><Moon className="mr-2 h-4 w-4" />Dark</TabsTrigger>
                <TabsTrigger value="system"><Laptop className="mr-2 h-4 w-4" />System</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Configuration</CardTitle>
          <CardDescription>Set up integrations and default values.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTimezone" className="flex items-center"><Clock className="mr-2 h-4 w-4" />Default Timezone</Label>
             <TimezoneCombobox value={formState.defaultTimezone} onChange={(tz) => setFormState(prev => ({ ...prev, defaultTimezone: tz}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geminiApiKey" className="flex items-center"><KeyRound className="mr-2 h-4 w-4" />Gemini API Key</Label>
            <Input id="geminiApiKey" name="geminiApiKey" type="password" value={formState.geminiApiKey} onChange={handleInputChange} placeholder="Enter your API key" />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser. For AI features to work, you must also set this key as the `GOOGLE_API_KEY` in an `.env` file in the project root.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-5 w-5" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
