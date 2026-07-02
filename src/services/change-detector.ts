import type { ChangeEvent } from '@/types';
import { generateId } from '@/lib/utils';

interface RawChange {
  path: string;
  oldVal: unknown;
  newVal: unknown;
}

export class ChangeDetector {
  private baselineState: Record<string, unknown> = {};

  setBaseline(state: Record<string, unknown>): void {
    this.baselineState = JSON.parse(JSON.stringify(state));
  }

  detectChanges(currentState: Record<string, unknown>): ChangeEvent[] {
    const rawChanges = this.findChanges(this.baselineState, currentState, '');
    return rawChanges.map((change) => this.toChangeEvent(change));
  }

  private findChanges(
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>,
    path: string
  ): RawChange[] {
    const changes: RawChange[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      if (key === 'lastUpdated') continue;
      const currentPath = path ? `${path}.${key}` : key;
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (!(key in oldObj)) {
        changes.push({ path: currentPath, oldVal: undefined, newVal });
      } else if (!(key in newObj)) {
        changes.push({ path: currentPath, oldVal, newVal: undefined });
      } else if (
        typeof oldVal === 'object' && typeof newVal === 'object' &&
        oldVal !== null && newVal !== null &&
        !Array.isArray(oldVal) && !Array.isArray(newVal)
      ) {
        changes.push(
          ...this.findChanges(
            oldVal as Record<string, unknown>,
            newVal as Record<string, unknown>,
            currentPath
          )
        );
      } else if (oldVal !== newVal) {
        changes.push({ path: currentPath, oldVal, newVal });
      }
    }
    return changes;
  }

  private toChangeEvent(change: RawChange): ChangeEvent {
    const categorized = this.categorizeChange(change.path, change.oldVal, change.newVal);
    return {
      id: generateId(),
      type: 'change_detected',
      category: categorized.category,
      title: categorized.title,
      description: categorized.description,
      previousState: { [change.path]: change.oldVal },
      newState: { [change.path]: change.newVal },
      riskLevel: categorized.risk,
      impact: `Change detected in ${change.path}`,
      timestamp: new Date().toISOString(),
      planId: '',
      stepId: null,
    };
  }

  private categorizeChange(
    path: string,
    oldVal: unknown,
    newVal: unknown
  ): {
    category: 'api_failure' | 'inventory_change' | 'user_request_change' | 'permission_change' | 'timeout';
    title: string;
    description: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
  } {
    if (path.startsWith('apiStatus')) {
      const service = path.split('.')[1];
      return {
        category: 'api_failure',
        title: `API Status Change: ${service}`,
        description: `${service} changed from ${String(oldVal)} to ${String(newVal)}`,
        risk: newVal === 'down' ? 'high' : 'medium',
      };
    }
    if (path.startsWith('inventory')) {
      const product = path.split('.')[1];
      const newQty = Number(newVal);
      return {
        category: 'inventory_change',
        title: `Inventory Change: ${product}`,
        description: `${product}: ${String(oldVal)} → ${String(newVal)}`,
        risk: newQty < 20 ? 'high' : 'medium',
      };
    }
    if (path.startsWith('userPermissions')) {
      const user = path.split('.')[1];
      return {
        category: 'permission_change',
        title: `Permission Change: ${user}`,
        description: `${user} permissions changed`,
        risk: 'critical',
      };
    }
    if (path.startsWith('activeRequests')) {
      return {
        category: 'user_request_change',
        title: 'Request Change Detected',
        description: `Request ${path.split('.')[1]} was modified`,
        risk: 'medium',
      };
    }
    return {
      category: 'timeout',
      title: 'System Change Detected',
      description: `${path}: ${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)}`,
      risk: 'low',
    };
  }
}
