import type { ChangeEvent, EventType, ChangeCategory, RiskLevel } from '@/types';
import { generateId } from '@/lib/utils';

export class TimelineService {
  private events: ChangeEvent[] = [];
  private listeners: Array<(events: ChangeEvent[]) => void> = [];

  getEvents(): ChangeEvent[] {
    return [...this.events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getEventsByPlan(planId: string): ChangeEvent[] {
    return this.events
      .filter((e) => e.planId === planId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addEvent(event: Omit<ChangeEvent, 'id' | 'timestamp'>): ChangeEvent {
    const newEvent: ChangeEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    this.events.push(newEvent);
    this.notify();
    return newEvent;
  }

  addEventRaw(event: ChangeEvent): void {
    this.events.push(event);
    this.notify();
  }

  searchEvents(query: string): ChangeEvent[] {
    const q = query.toLowerCase();
    return this.getEvents().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
    );
  }

  filterEvents(options: {
    types?: EventType[];
    categories?: ChangeCategory[];
    riskLevels?: RiskLevel[];
    startDate?: string;
    endDate?: string;
  }): ChangeEvent[] {
    return this.getEvents().filter((e) => {
      if (options.types?.length && !options.types.includes(e.type)) return false;
      if (options.categories?.length && !options.categories.includes(e.category!)) return false;
      if (options.riskLevels?.length && !options.riskLevels.includes(e.riskLevel!)) return false;
      if (options.startDate && new Date(e.timestamp) < new Date(options.startDate)) return false;
      if (options.endDate && new Date(e.timestamp) > new Date(options.endDate)) return false;
      return true;
    });
  }

  onChange(callback: (events: ChangeEvent[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    const events = this.getEvents();
    this.listeners.forEach((l) => l(events));
  }

  clear(): void {
    this.events = [];
    this.notify();
  }
}
