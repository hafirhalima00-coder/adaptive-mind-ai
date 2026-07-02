'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PanelLeft, Bell, Search, ChevronDown, Settings, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { agentStore } from '@/services/agent-service';

interface HeaderProps {
  onMenuToggle: () => void;
  onCommandPalette: () => void;
}

export function Header({ onMenuToggle, onCommandPalette }: HeaderProps) {
  const [notifications, setNotifications] = useState(agentStore.getNotifications().getUnread());
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = agentStore.getNotifications().onChange((n) => {
      setNotifications(n.filter((nn) => !nn.read));
    });
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsub();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDark = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  }, [isDark]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur transition-shadow lg:px-6',
        scrolled && 'shadow-sm'
      )}
    >
      <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden" aria-label="Toggle sidebar">
        <PanelLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCommandPalette}
          aria-label="Search"
          className="hidden sm:inline-flex"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle dark mode">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </Button>

        <Button variant="ghost" size="sm" className="gap-2 pl-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
            AM
          </span>
          <span className="hidden text-sm md:inline">Admin</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
