'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCheck, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { agentStore } from '@/services/agent-service';
import type { Notification } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = agentStore.getNotifications().onChange((n) => setNotifications(n));
    return unsub;
  }, []);

  const handleMarkAllRead = useCallback(() => {
    agentStore.getNotifications().markAllRead();
  }, []);

  const handleRemove = useCallback((id: string) => {
    agentStore.getNotifications().remove(id);
  }, []);

  const typeStyles = {
    info: 'border-l-blue-500 bg-blue-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    error: 'border-l-red-500 bg-red-500/5',
    success: 'border-l-emerald-500 bg-emerald-500/5',
  };

  const typeIcons = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    success: 'text-emerald-500',
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div
        className={cn(
          'fixed right-4 top-16 z-50 w-full max-w-sm rounded-xl border bg-background shadow-2xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Notifications</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'group relative border-l-2 px-4 py-3 transition-colors',
                typeStyles[n.type],
                !n.read && 'bg-muted/30'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(n.id)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove notification"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
