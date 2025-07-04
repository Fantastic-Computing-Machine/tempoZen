"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
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
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: NotebookText },
];

const fabItem = { href: '/scheduler', label: 'AI Scheduler', icon: BrainCircuit };

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center px-4" role="navigation">
      <div className="flex items-center gap-3">
        {/* Main Nav Group */}
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
        {/* Floating Action Button */}
        <Link href={fabItem.href} passHref>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <fabItem.icon className="h-6 w-6" />
            <span className="sr-only">{fabItem.label}</span>
          </div>
        </Link>
      </div>
    </div>
  );
};


export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  useEffect(() => {
    if (mounted) {
      setOpen(!isMobile);
    }
  }, [isMobile, mounted]);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const sidebarContent = (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          <h1 className="font-headline text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            TempoZen
          </h1>
        </Link>
      </SidebarHeader>
      <Separator className="bg-sidebar-border group-data-[collapsible=icon]:hidden" />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="justify-start"
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="bg-sidebar-border group-data-[collapsible=icon]:hidden" />
      <SidebarFooter className="p-4 mt-auto">
        <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="group-data-[collapsible=icon]:hidden">
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </span>
        </Button>
      </SidebarFooter>
    </>
  );

  if (!mounted) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><Zap className="w-12 h-12 animate-pulse text-primary" /></div>; // Or a proper skeleton loader
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 overflow-y-auto pb-28">
            {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen={!isMobile}>
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          {sidebarContent}
        </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
                <div className="flex items-center">
                   <SidebarTrigger className="hidden md:group-data-[collapsible=icon]/sidebar-wrapper:flex" />
                </div>
            </header>
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
