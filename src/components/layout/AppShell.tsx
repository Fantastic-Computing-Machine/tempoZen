"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  AlarmClock,
  TimerIcon,
  CalendarDays,
  NotebookText,
  BrainCircuit,
  Zap,
  Menu,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/alarms', label: 'Alarms', icon: AlarmClock },
  { href: '/timers', label: 'Timers', icon: TimerIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: NotebookText },
  { href: '/scheduler', label: 'AI Scheduler', icon: BrainCircuit },
  { href: '/world-clock', label: 'World Clock', icon: Globe },
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: NotebookText },
  { href: '/world-clock', label: 'Clock', icon: Globe },
];

const fabItem = { href: '/scheduler', label: 'AI Scheduler', icon: BrainCircuit };

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center px-4" role="navigation">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 rounded-full p-2 shadow-lg"
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.75)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} passHref>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-full transition-all duration-300 ease-in-out',
                    isActive ? 'bg-white text-black px-4 py-2' : 'text-white p-2'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isActive && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </div>
        <Link href={fabItem.href} passHref>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <fabItem.icon className="h-6 w-6" />
            <span className="sr-only">{fabItem.label}</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

const DesktopDock = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void; }) => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" role="navigation">
      <TooltipProvider>
        <div className="flex h-16 items-end gap-3 rounded-2xl p-3 shadow-lg"
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href} passHref>
                  <div className={cn(
                    "flex flex-col items-center gap-1 transition-all duration-200 ease-in-out hover:scale-110 hover:-translate-y-1",
                    isActive ? "-translate-y-1" : ""
                  )}>
                    {isActive && <div className="h-1 w-1 rounded-full bg-white" />}
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-lg p-2 text-white transition-colors',
                        isActive ? 'bg-white/10' : ''
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="mb-2">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )})}
          <Separator orientation="vertical" className="h-10 self-center bg-white/10 mx-2" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-12 w-12 rounded-lg text-white hover:bg-white/10 hover:text-white transition-all duration-200 ease-in-out hover:scale-110 hover:-translate-y-1">
                {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2">
              <p>Switch to {theme === 'light' ? 'Dark' : 'Light'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};


export default function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><Zap className="w-12 h-12 animate-pulse text-primary" /></div>;
  }
  
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 overflow-y-auto pb-28">
            <div className="w-full max-w-7xl mx-auto p-4">
              {children}
            </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-center border-b bg-background/80 backdrop-blur-md px-4 md:px-8">
            <div className="flex w-full max-w-7xl items-center justify-end">
                <div className="font-mono text-lg font-semibold">
                    {currentTime}
                </div>
            </div>
        </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
            {children}
        </div>
      </main>
      <DesktopDock theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
