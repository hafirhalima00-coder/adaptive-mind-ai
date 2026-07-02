import type { Notification } from '@/types';
import { generateId } from '@/lib/utils';

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  getAll(): Notification[] {
    return [...this.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getUnread(): Notification[] {
    return this.getAll().filter((n) => !n.read);
  }

  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.push(newNotification);
    this.notify();
    return newNotification;
  }

  markRead(id: string): void {
    const n = this.notifications.find((n) => n.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  markAllRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  onChange(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.getAll()));
  }
}
