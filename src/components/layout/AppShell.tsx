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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  AlarmClock,
  TimerIcon,
  CalendarDays,
  NotebookText,
  BrainCircuit,
  Zap,
  Settings,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists and works

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alarms', label: 'Alarms', icon: AlarmClock },
  { href: '/timers', label: 'Timers', icon: TimerIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: NotebookText },
  { href: '/scheduler', label: 'AI Scheduler', icon: BrainCircuit },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(isMobile ? false : true);
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
      setOpen(isMobile ? false : true);
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
                  onClick={() => isMobile && setOpen(false)}
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

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen={!isMobile}>
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] bg-sidebar text-sidebar-foreground border-sidebar-border">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          {sidebarContent}
        </Sidebar>
      )}
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {!isMobile && (
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
                <div className="flex items-center">
                   <SidebarTrigger className="hidden md:group-data-[collapsible=icon]/sidebar-wrapper:flex" />
                   {/* You can add breadcrumbs or page title here */}
                </div>
                {/* Other header content, e.g., user profile */}
            </header>
          )}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
