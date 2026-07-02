import { describe, it, expect, beforeEach } from 'vitest';
import { TimelineService } from '@/services/timeline-service';

describe('TimelineService', () => {
  let timeline: TimelineService;

  beforeEach(() => {
    timeline = new TimelineService();
  });

  it('should start empty', () => {
    expect(timeline.getEvents()).toHaveLength(0);
  });

  it('should add events', () => {
    const event = timeline.addEvent({
      type: 'plan_created',
      category: null,
      title: 'Test Event',
      description: 'Test description',
      previousState: null,
      newState: null,
      riskLevel: null,
      impact: null,
      planId: 'plan-1',
      stepId: null,
    });
    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(timeline.getEvents()).toHaveLength(1);
  });

  it('should return events in reverse chronological order', async () => {
    const e1 = timeline.addEvent({
      type: 'plan_created', category: null, title: 'First', description: '', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    await new Promise(r => setTimeout(r, 10));
    const e2 = timeline.addEvent({
      type: 'step_completed', category: null, title: 'Second', description: '', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    const events = timeline.getEvents();
    expect(events[0].id).toBe(e2.id);
    expect(events[1].id).toBe(e1.id);
  });

  it('should filter events by type', () => {
    timeline.addEvent({
      type: 'plan_created', category: null, title: '', description: '', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    timeline.addEvent({
      type: 'step_completed', category: null, title: '', description: '', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    const filtered = timeline.filterEvents({ types: ['plan_created'] });
    expect(filtered).toHaveLength(1);
  });

  it('should search events by keyword', () => {
    timeline.addEvent({
      type: 'plan_created', category: null, title: 'Payment Gateway Failure', description: 'API is down', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    timeline.addEvent({
      type: 'step_completed', category: null, title: 'Order Confirmed', description: 'All good', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    const results = timeline.searchEvents('payment');
    expect(results).toHaveLength(1);
  });

  it('should notify listeners on change', () => {
    let count = 0;
    const unsub = timeline.onChange(() => count++);
    timeline.addEvent({
      type: 'plan_created', category: null, title: '', description: '', previousState: null, newState: null, riskLevel: null, impact: null, planId: 'p1', stepId: null,
    });
    expect(count).toBe(1);
    unsub();
  });
});
