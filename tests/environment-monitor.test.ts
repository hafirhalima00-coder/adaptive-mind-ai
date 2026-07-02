import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentMonitor } from '@/services/environment-monitor';

describe('EnvironmentMonitor', () => {
  let monitor: EnvironmentMonitor;

  beforeEach(() => {
    monitor = new EnvironmentMonitor();
  });

  it('should initialize with default state', () => {
    const state = monitor.getState();
    expect(state.apiStatus).toBeDefined();
    expect(state.inventory).toBeDefined();
    expect(state.userPermissions).toBeDefined();
    expect(state.apiStatus['payment-api']).toBe('healthy');
  });

  it('should simulate API failure', () => {
    const event = monitor.simulateApiFailure('payment-api');
    expect(event.category).toBe('api_failure');
    expect(event.riskLevel).toBe('high');
    expect(monitor.getState().apiStatus['payment-api']).toBe('down');
  });

  it('should simulate inventory changes', () => {
    const event = monitor.simulateInventoryChange('product-A', { product: 'product-A', delta: -30 });
    expect(event.category).toBe('inventory_change');
    expect(monitor.getState().inventory['product-A']).toBe(120);
  });

  it('should simulate permission changes', () => {
    const event = monitor.simulatePermissionChange('user-1', { user: 'user-1', revoked: ['admin'] });
    expect(event.category).toBe('permission_change');
    expect(event.riskLevel).toBe('critical');
    expect(monitor.getState().userPermissions['user-1']).not.toContain('admin');
  });

  it('should simulate timeouts', () => {
    const event = monitor.simulateTimeout('database-query');
    expect(event.category).toBe('timeout');
    expect(event.riskLevel).toBe('medium');
  });

  it('should emit events to listeners', () => {
    const events: any[] = [];
    const unsub = monitor.onChange((e) => events.push(e));
    monitor.simulateApiFailure('test-api');
    expect(events.length).toBe(1);
    unsub();
    monitor.simulateApiFailure('another-api');
    expect(events.length).toBe(1);
  });

  it('should destroy and clean up', () => {
    const events: any[] = [];
    monitor.onChange((e) => events.push(e));
    monitor.destroy();
    monitor.simulateApiFailure('test');
    expect(events.length).toBe(0);
  });
});
