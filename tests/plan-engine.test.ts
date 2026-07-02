import { describe, it, expect, beforeEach } from 'vitest';
import { PlanEngine } from '@/services/plan-engine';

describe('PlanEngine', () => {
  let engine: PlanEngine;

  beforeEach(() => {
    engine = new PlanEngine();
  });

  it('should generate a plan for a given goal', () => {
    const plan = engine.generatePlan('Process a customer order');
    expect(plan).toBeDefined();
    expect(plan.goal).toBe('Process a customer order');
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.status).toBe('draft');
    expect(plan.version).toBe(1);
  });

  it('should generate order-specific steps for checkout goals', () => {
    const plan = engine.generatePlan('Process a customer order for checkout');
    const stepNames = plan.steps.map((s) => s.name);
    expect(stepNames).toContain('Validate Cart');
    expect(stepNames).toContain('Process Payment');
    expect(stepNames).toContain('Initiate Shipping');
  });

  it('should generate report-specific steps for report goals', () => {
    const plan = engine.generatePlan('Generate a monthly report');
    const stepNames = plan.steps.map((s) => s.name);
    expect(stepNames).toContain('Gather Data Sources');
    expect(stepNames).toContain('Generate Report');
  });

  it('should calculate confidence based on goal complexity', () => {
    const simple = engine.generatePlan('Hi');
    const complex = engine.generatePlan('Process a very complex customer order that requires multiple approvals and external verification');
    expect(simple.confidence).toBeGreaterThan(complex.confidence);
  });

  it('should resolve dependencies correctly', () => {
    const plan = engine.generatePlan('Process order');
    const step = plan.steps[4]; // Should have dependencies
    const deps = engine.getStepDependencies(plan, step.id);
    expect(deps.length).toBeGreaterThan(0);
  });

  it('should validate dependencies', () => {
    const plan = engine.generatePlan('Process order');
    expect(engine.validateDependencies(plan, plan.steps[0].id)).toBe(true);
    expect(engine.validateDependencies(plan, plan.steps[1].id)).toBe(false); // Depends on step-0 which is pending
  });
});
