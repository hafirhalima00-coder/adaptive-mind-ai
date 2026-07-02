import type { ExecutionPlan, PlanStep, StepStatus } from '@/types';
import { generateId } from '@/lib/utils';

export class PlanEngine {
  generatePlan(goal: string): ExecutionPlan {
    const planId = generateId();
    const steps = this.createSteps(goal, planId);
    return {
      id: planId,
      name: this.generatePlanName(goal),
      goal,
      steps,
      status: 'draft',
      confidence: this.calculateInitialConfidence(goal),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      parentPlanId: null,
    };
  }

  private createSteps(goal: string, planId: string): PlanStep[] {
    const templates: { name: string; description: string; dependsOn: string[] }[] = [];

    if (goal.toLowerCase().includes('order') || goal.toLowerCase().includes('checkout')) {
      templates.push(
        { name: 'Validate Cart', description: 'Verify cart contents and pricing', dependsOn: [] },
        { name: 'Check Inventory', description: 'Verify stock availability for all items', dependsOn: ['step-0'] },
        { name: 'Authenticate User', description: 'Verify user credentials and session', dependsOn: ['step-0'] },
        { name: 'Authorize Payment', description: 'Validate payment method and funds', dependsOn: ['step-2'] },
        { name: 'Process Payment', description: 'Execute payment transaction', dependsOn: ['step-3'] },
        { name: 'Update Inventory', description: 'Deduct purchased items from inventory', dependsOn: ['step-1', 'step-4'] },
        { name: 'Generate Invoice', description: 'Create and store invoice record', dependsOn: ['step-4'] },
        { name: 'Send Confirmation', description: 'Email/SMS order confirmation to user', dependsOn: ['step-5', 'step-6'] },
        { name: 'Initiate Shipping', description: 'Create shipping label and notify warehouse', dependsOn: ['step-5'] },
        { name: 'Complete Order', description: 'Finalize order and update dashboard', dependsOn: ['step-7', 'step-8'] }
      );
    } else if (goal.toLowerCase().includes('report') || goal.toLowerCase().includes('analyze')) {
      templates.push(
        { name: 'Gather Data Sources', description: 'Collect data from all configured sources', dependsOn: [] },
        { name: 'Validate Data', description: 'Check data integrity and completeness', dependsOn: ['step-0'] },
        { name: 'Process Data', description: 'Transform and normalize data', dependsOn: ['step-1'] },
        { name: 'Run Analysis', description: 'Execute analytical models', dependsOn: ['step-2'] },
        { name: 'Generate Report', description: 'Create formatted report output', dependsOn: ['step-3'] },
        { name: 'Review Results', description: 'QA check on generated report', dependsOn: ['step-4'] },
        { name: 'Distribute Report', description: 'Send to stakeholders', dependsOn: ['step-5'] }
      );
    } else {
      templates.push(
        { name: 'Initialize Context', description: 'Set up execution context and parameters', dependsOn: [] },
        { name: 'Validate Prerequisites', description: 'Check all required conditions', dependsOn: ['step-0'] },
        { name: 'Execute Primary Task', description: `Execute: ${goal}`, dependsOn: ['step-1'] },
        { name: 'Verify Output', description: 'Validate execution results', dependsOn: ['step-2'] },
        { name: 'Handle Post-processing', description: 'Process and store results', dependsOn: ['step-3'] },
        { name: 'Complete', description: 'Finalize and report', dependsOn: ['step-4'] }
      );
    }

    return templates.map((t, i) => ({
      id: `step-${i}`,
      planId,
      order: i,
      name: t.name,
      description: t.description,
      status: 'pending' as StepStatus,
      dependsOn: t.dependsOn,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  private generatePlanName(goal: string): string {
    const words = goal.split(' ').slice(0, 5);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private calculateInitialConfidence(goal: string): number {
    const base = 0.85;
    const complexityPenalty = Math.min(goal.split(' ').length * 0.02, 0.3);
    return Math.round((base - complexityPenalty) * 100) / 100;
  }

  getStepDependencies(plan: ExecutionPlan, stepId: string): PlanStep[] {
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) return [];
    return plan.steps.filter((s) => step.dependsOn.includes(s.id));
  }

  getDependentSteps(plan: ExecutionPlan, stepId: string): PlanStep[] {
    return plan.steps.filter((s) => s.dependsOn.includes(stepId));
  }

  validateDependencies(plan: ExecutionPlan, stepId: string): boolean {
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) return false;
    return step.dependsOn.every((depId) => {
      const dep = plan.steps.find((s) => s.id === depId);
      return dep?.status === 'completed';
    });
  }
}
