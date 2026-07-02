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
  private intervals: ReturnType<typeof setInterval>[] = [];

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
        return this.simulateApiFailure(simEvent.target, simEvent.payload as { service?: string });
      case 'inventory_change':
        return this.simulateInventoryChange(simEvent.target, simEvent.payload as { product?: string; delta?: number });
      case 'user_request_change':
        return this.simulateUserRequestChange(simEvent.target, simEvent.payload as { requestId?: string; change?: string });
      case 'permission_change':
        return this.simulatePermissionChange(simEvent.target, simEvent.payload as { user?: string; revoked?: string[] });
      case 'timeout':
        return this.simulateTimeout(simEvent.target, simEvent.payload as { operation?: string });
      default:
        return null;
    }
  }

  simulateApiFailure(service?: string, payload?: { service?: string }): ChangeEvent {
    const target = service || payload?.service || 'payment-api';
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
      impact: `Blocking all operations dependent on ${target}. Affected: checkout, payment processing.`,
      planId: '',
      stepId: null,
    });
  }

  simulateInventoryChange(product?: string, payload?: { product?: string; delta?: number }): ChangeEvent {
    const target = product || payload?.product || 'product-A';
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
      impact: delta < 0
        ? `Low stock alert for ${target}. May affect order fulfillment.`
        : `Inventory updated for ${target}.`,
      planId: '',
      stepId: null,
    });
  }

  simulateUserRequestChange(requestId?: string, payload?: { requestId?: string; change?: string }): ChangeEvent {
    const target = requestId || payload?.requestId || 'req-001';
    const change = payload?.change || 'User cancelled the order.';
    return this.emit({
      type: 'change_detected',
      category: 'user_request_change',
      title: `Request Changed: ${target}`,
      description: change,
      previousState: null,
      newState: { requestChange: { id: target, change } },
      riskLevel: 'medium',
      impact: 'Workflow must adapt to new user intent.',
      planId: '',
      stepId: null,
    });
  }

  simulatePermissionChange(user?: string, payload?: { user?: string; revoked?: string[] }): ChangeEvent {
    const target = user || payload?.user || 'user-1';
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
      impact: 'Critical operations may be blocked. Admin access revoked.',
      planId: '',
      stepId: null,
    });
  }

  simulateTimeout(operation?: string, payload?: { operation?: string }): ChangeEvent {
    const target = operation || payload?.operation || 'database-query';
    return this.emit({
      type: 'change_detected',
      category: 'timeout',
      title: `Timeout: ${target}`,
      description: `${target} exceeded 30s timeout threshold. Operation aborted.`,
      previousState: null,
      newState: { timeout: { operation: target, timeout: 30000 } },
      riskLevel: 'medium',
      impact: `${target} may need retry with exponential backoff.`,
      planId: '',
      stepId: null,
    });
  }

  startRandomSimulation(intervalMs = 8000): () => void {
    const categories: ChangeCategory[] = [
      'api_failure', 'inventory_change', 'user_request_change',
      'permission_change', 'timeout',
    ];
    const id = setInterval(() => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      switch (category) {
        case 'api_failure':
          this.simulateApiFailure();
          break;
        case 'inventory_change':
          this.simulateInventoryChange();
          break;
        case 'user_request_change':
          this.simulateUserRequestChange();
          break;
        case 'permission_change':
          this.simulatePermissionChange();
          break;
        case 'timeout':
          this.simulateTimeout();
          break;
      }
    }, intervalMs);
    this.intervals.push(id);
    return () => clearInterval(id);
  }

  destroy(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.listeners = [];
  }
}
