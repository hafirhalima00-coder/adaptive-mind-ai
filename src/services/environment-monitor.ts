import type {
  EnvironmentState,
  ChangeEvent,
  ChangeCategory,
  SimulationEvent,
} from '@/types';
import { generateId } from '@/lib/utils';

export class EnvironmentMonitor {
  private state: EnvironmentState;
  private listeners: Array<(event: ChangeEvent) => void> = [];

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): EnvironmentState {
    return {
      apiStatus: {
        'payment-api': 'healthy',
        'auth-api': 'healthy',
        'inventory-api': 'healthy',
        'shipping-api': 'healthy',
      },
      inventory: {
        'product-A': 150,
        'product-B': 82,
        'product-C': 300,
        'product-D': 45,
      },
      userPermissions: {
        'user-1': ['read', 'write', 'admin'],
        'user-2': ['read'],
        'user-3': ['read', 'write'],
      },
      activeRequests: {},
      systemLoad: 0.3,
      lastUpdated: new Date().toISOString(),
    };
  }

  getState(): EnvironmentState {
    return { ...this.state, lastUpdated: new Date().toISOString() };
  }

  onChange(callback: (event: ChangeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private emit(event: Omit<ChangeEvent, 'id' | 'timestamp'>): ChangeEvent {
    const changeEvent: ChangeEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    this.state.lastUpdated = new Date().toISOString();
    this.listeners.forEach((l) => l(changeEvent));
    return changeEvent;
  }

  simulateEvent(simEvent: SimulationEvent): ChangeEvent | null {
    switch (simEvent.type) {
      case 'api_failure':
        return this.simulateApiFailure(simEvent.payload as { service?: string });
      case 'inventory_change':
        return this.simulateInventoryChange(simEvent.payload as { product?: string; delta?: number });
      case 'user_request_change':
        return this.simulateUserRequestChange(simEvent.payload as { requestId?: string; change?: string });
      case 'permission_change':
        return this.simulatePermissionChange(simEvent.payload as { user?: string; revoked?: string[] });
      case 'timeout':
        return this.simulateTimeout(simEvent.payload as { operation?: string });
      default:
        return null;
    }
  }

  simulateApiFailure(payload?: { service?: string }): ChangeEvent {
    const target = payload?.service || 'payment-api';
    const prev = { ...this.state.apiStatus };
    this.state.apiStatus[target] = 'down';
    return this.emit({
      type: 'change_detected',
      category: 'api_failure',
      title: `API Failure: ${target}`,
      description: `${target} is returning 503 errors. Retry attempts exhausted.`,
      previousState: { apiStatus: prev },
      newState: { apiStatus: { ...this.state.apiStatus } },
      riskLevel: 'high',
      impact: `Blocking all operations dependent on ${target}. A non-adaptive agent would continue attempting to call this API, resulting in silent failure or hung execution.`,
      planId: '',
      stepId: null,
    });
  }

  simulateInventoryChange(payload?: { product?: string; delta?: number }): ChangeEvent {
    const target = payload?.product || 'product-A';
    const delta = payload?.delta ?? -50;
    const prev = { ...this.state.inventory };
    this.state.inventory[target] = Math.max(0, (this.state.inventory[target] || 0) + delta);
    return this.emit({
      type: 'change_detected',
      category: 'inventory_change',
      title: `Inventory Change: ${target}`,
      description: `${target} stock changed by ${delta > 0 ? '+' : ''}${delta}. New level: ${this.state.inventory[target]}`,
      previousState: { inventory: prev },
      newState: { inventory: { ...this.state.inventory } },
      riskLevel: delta < 0 && this.state.inventory[target] < 20 ? 'high' : 'medium',
      impact: delta < 0 && this.state.inventory[target] < 20
        ? `CRITICAL: ${target} below safety threshold. A non-adaptive agent would proceed with fulfillment, causing stockout and customer failure.`
        : `Inventory updated for ${target}. Re-planning ensures correct quantities.`,
      planId: '',
      stepId: null,
    });
  }

  simulateUserRequestChange(payload?: { requestId?: string; change?: string }): ChangeEvent {
    const target = payload?.requestId || 'req-001';
    const change = payload?.change || 'User cancelled the order.';
    return this.emit({
      type: 'change_detected',
      category: 'user_request_change',
      title: `Request Changed: ${target}`,
      description: change,
      previousState: null,
      newState: { requestChange: { id: target, change } },
      riskLevel: 'medium',
      impact: 'A non-adaptive agent would continue processing a cancelled order, wasting resources and causing a refund loop.',
      planId: '',
      stepId: null,
    });
  }

  simulatePermissionChange(payload?: { user?: string; revoked?: string[] }): ChangeEvent {
    const target = payload?.user || 'user-1';
    const revoked = payload?.revoked || ['admin'];
    const prev = [...(this.state.userPermissions[target] || [])];
    this.state.userPermissions[target] = (this.state.userPermissions[target] || []).filter(
      (p) => !revoked.includes(p)
    );
    return this.emit({
      type: 'change_detected',
      category: 'permission_change',
      title: `Permission Change: ${target}`,
      description: `${target} lost permissions: ${revoked.join(', ')}`,
      previousState: { permissions: prev },
      newState: { permissions: [...this.state.userPermissions[target]] },
      riskLevel: 'critical',
      impact: 'A non-adaptive agent would attempt unauthorized operations, triggering security violations and potential data corruption.',
      planId: '',
      stepId: null,
    });
  }

  simulateTimeout(payload?: { operation?: string }): ChangeEvent {
    const target = payload?.operation || 'database-query';
    return this.emit({
      type: 'change_detected',
      category: 'timeout',
      title: `Timeout: ${target}`,
      description: `${target} exceeded 30s timeout threshold. Operation aborted.`,
      previousState: null,
      newState: { timeout: { operation: target, timeout: 30000 } },
      riskLevel: 'medium',
      impact: `A non-adaptive agent would hang or crash on timeout. Adaptive retry with circuit breaker prevents cascade failure.`,
      planId: '',
      stepId: null,
    });
  }

  simulateCascadeFailure(): ChangeEvent[] {
    const events: ChangeEvent[] = [];
    events.push(this.simulateApiFailure({ service: 'payment-api' }));
    events.push(this.simulateInventoryChange({ product: 'product-A', delta: -140 }));
    events.push(this.simulateTimeout({ operation: 'database-query' }));
    return events;
  }

  simulateAuthBreach(): ChangeEvent[] {
    const events: ChangeEvent[] = [];
    events.push(this.simulatePermissionChange({ user: 'user-1', revoked: ['admin', 'write'] }));
    events.push(this.simulateApiFailure({ service: 'auth-api' }));
    return events;
  }

  destroy(): void {
    this.listeners = [];
  }
}
