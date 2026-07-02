import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptivePlanner } from '@/services/adaptive-planner';
import { PlanEngine } from '@/services/plan-engine';
import type { ChangeEvent, AgentState } from '@/types';

describe('AdaptivePlanner', () => {
  let planner: AdaptivePlanner;
  let engine: PlanEngine;

  beforeEach(() => {
    planner = new AdaptivePlanner();
    engine = new PlanEngine();
  });

  it('should adapt plan on API failure', () => {
    const plan = engine.generatePlan('Process a customer order');
    const event: ChangeEvent = {
      id: 'test-1',
      type: 'change_detected',
      category: 'api_failure',
      title: 'API Failure: payment-api',
      description: 'payment-api is down',
      previousState: null,
      newState: null,
      riskLevel: 'high',
      impact: 'Payment processing blocked',
      timestamp: new Date().toISOString(),
      planId: plan.id,
      stepId: null,
    };
    const agentState: AgentState = {
      currentPlan: plan,
      environment: { apiStatus: { 'payment-api': 'down' }, inventory: {}, userPermissions: {}, activeRequests: {}, systemLoad: 0.5, lastUpdated: '' },
      isRunning: true,
      confidence: 0.85,
      activeRisks: [],
      recoveryStatus: 'idle',
      replanCount: 0,
      executionProgress: 30,
      currentStepIndex: 2,
    };

    const result = planner.adapt(plan, event, agentState);
    expect(result).toBeDefined();
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.adaptedPlan.version).toBe(plan.version + 1);
    expect(result.adaptedPlan.status).toBe('adapted');
  });

  it('should handle inventory changes', () => {
    const plan = engine.generatePlan('Process a customer order');
    const event: ChangeEvent = {
      id: 'test-2',
      type: 'change_detected',
      category: 'inventory_change',
      title: 'Inventory Change: product-A',
      description: 'Stock dropped to 10',
      previousState: null,
      newState: null,
      riskLevel: 'high',
      impact: 'Low stock alert',
      timestamp: new Date().toISOString(),
      planId: plan.id,
      stepId: null,
    };
    const agentState: AgentState = {
      currentPlan: plan,
      environment: { apiStatus: {}, inventory: { 'product-A': 10 }, userPermissions: {}, activeRequests: {}, systemLoad: 0.3, lastUpdated: '' },
      isRunning: true,
      confidence: 0.85,
      activeRisks: [],
      recoveryStatus: 'idle',
      replanCount: 0,
      executionProgress: 20,
      currentStepIndex: 1,
    };

    const result = planner.adapt(plan, event, agentState);
    expect(result.changes.some((c) => c.type === 'modified')).toBe(true);
  });

  it('should handle permission changes', () => {
    const plan = engine.generatePlan('Process a customer order');
    const event: ChangeEvent = {
      id: 'test-3',
      type: 'change_detected',
      category: 'permission_change',
      title: 'Permission Revoked',
      description: 'Admin access removed',
      previousState: null,
      newState: null,
      riskLevel: 'critical',
      impact: 'Critical operations blocked',
      timestamp: new Date().toISOString(),
      planId: plan.id,
      stepId: null,
    };
    const agentState: AgentState = {
      currentPlan: plan,
      environment: { apiStatus: {}, inventory: {}, userPermissions: {}, activeRequests: {}, systemLoad: 0.3, lastUpdated: '' },
      isRunning: true,
      confidence: 0.85,
      activeRisks: [],
      recoveryStatus: 'idle',
      replanCount: 0,
      executionProgress: 20,
      currentStepIndex: 1,
    };

    const result = planner.adapt(plan, event, agentState);
    expect(result.changes.some((c) => c.type === 'modified')).toBe(true);
  });

  it('should generate consistent reasoning', () => {
    const plan = engine.generatePlan('Test plan');
    const event: ChangeEvent = {
      id: 'test-4',
      type: 'change_detected',
      category: 'timeout',
      title: 'Timeout Detected',
      description: 'Operation timed out',
      previousState: null,
      newState: null,
      riskLevel: 'medium',
      impact: 'May need retry',
      timestamp: new Date().toISOString(),
      planId: plan.id,
      stepId: null,
    };
    const agentState: AgentState = {
      currentPlan: plan,
      environment: { apiStatus: {}, inventory: {}, userPermissions: {}, activeRequests: {}, systemLoad: 0.3, lastUpdated: '' },
      isRunning: true,
      confidence: 0.85,
      activeRisks: [],
      recoveryStatus: 'idle',
      replanCount: 0,
      executionProgress: 0,
      currentStepIndex: 0,
    };

    const result = planner.adapt(plan, event, agentState);
    expect(result.reasoning).toBeTruthy();
    expect(result.reasoning.length).toBeGreaterThan(20);
  });
});
