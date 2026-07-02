import type { ExecutionPlan, PlanStep, ChangeEvent, RiskLevel, AgentState } from '@/types';
import { generateId, randomBetween } from '@/lib/utils';

export interface AdaptationResult {
  originalPlan: ExecutionPlan;
  adaptedPlan: ExecutionPlan;
  changes: AdaptationChange[];
  reasoning: string;
  duration: number;
}

export interface AdaptationChange {
  type: 'removed' | 'added' | 'modified' | 'reordered' | 'skipped';
  stepId: string;
  stepName: string;
  reason: string;
}

export class AdaptivePlanner {
  adapt(
    plan: ExecutionPlan,
    changeEvent: ChangeEvent,
    agentState: AgentState
  ): AdaptationResult {
    const startTime = performance.now();
    const adaptedSteps = JSON.parse(JSON.stringify(plan.steps)) as PlanStep[];
    const changes: AdaptationChange[] = [];
    const explanations: string[] = [];

    const currentStepIndex = agentState.currentStepIndex;
    const remainingSteps = adaptedSteps.slice(currentStepIndex);
    const completedSteps = adaptedSteps.slice(0, currentStepIndex);

    const reasoning = this.generateReasoning(changeEvent, plan);

    switch (changeEvent.category) {
      case 'api_failure': {
        const blockedSteps = remainingSteps.filter(
          (s) => s.name.toLowerCase().includes('payment') ||
                 s.name.toLowerCase().includes(changeEvent.title.split(':')[1]?.trim()?.toLowerCase() || '')
        );
        for (const step of blockedSteps) {
          const depSteps = adaptedSteps.filter((s) => s.dependsOn.includes(step.id));
          changes.push({
            type: 'modified',
            stepId: step.id,
            stepName: step.name,
            reason: `API unavailable. Adding retry with exponential backoff and fallback route.`,
          });
          step.metadata = {
            ...step.metadata,
            retryStrategy: 'exponential_backoff',
            maxRetries: 3,
            fallbackRoute: `queue-${step.id}`,
          };

          for (const dep of depSteps) {
            changes.push({
              type: 'modified',
              stepId: dep.id,
              stepName: dep.name,
              reason: `Dependency ${step.name} is degraded. Adding contingency.`,
            });
            dep.metadata = { ...dep.metadata, contingency: 'manual_review_required' };
          }
        }
        break;
      }

      case 'inventory_change': {
        const invSteps = remainingSteps.filter(
          (s) => s.name.toLowerCase().includes('inventory') || s.name.toLowerCase().includes('order')
        );
        for (const step of invSteps) {
          changes.push({
            type: 'modified',
            stepId: step.id,
            stepName: step.name,
            reason: 'Inventory levels changed. Recalculating availability and adjusting order quantities.',
          });
          step.metadata = { ...step.metadata, inventoryRecalculation: true };
        }
        break;
      }

      case 'user_request_change': {
        const nonEssentialSteps = remainingSteps.filter(
          (s) => !['Validate Cart', 'Authenticate User'].includes(s.name)
        );
        for (const step of nonEssentialSteps) {
          changes.push({
            type: 'skipped',
            stepId: step.id,
            stepName: step.name,
            reason: `User request changed. Step ${step.name} is no longer relevant to new intent.`,
          });
          step.status = 'skipped';
        }
        const finalSteps = adaptedSteps.filter(
          (s) => s.name === 'Complete Order' || s.name === 'Complete'
        );
        for (const step of finalSteps) {
          changes.push({
            type: 'modified',
            stepId: step.id,
            stepName: step.name,
            reason: 'Updating completion criteria to match new user request.',
          });
          step.metadata = { ...step.metadata, completionCriteria: 'user_request_updated' };
        }
        break;
      }

      case 'permission_change': {
        const blockedSteps = remainingSteps.filter(
          (s) => s.name.toLowerCase().includes('admin') ||
                 s.name.toLowerCase().includes('authorize') ||
                 s.name.toLowerCase().includes('payment')
        );
        for (const step of blockedSteps) {
          changes.push({
            type: 'modified',
            stepId: step.id,
            stepName: step.name,
            reason: 'Permission denied. Routing through elevated privilege service or requesting re-auth.',
          });
          step.metadata = {
            ...step.metadata,
            authorizationOverride: true,
            requiresElevation: true,
          };
        }
        break;
      }

      case 'timeout': {
        const timeoutSteps = remainingSteps.filter(
          (s) => s.metadata?.retryStrategy
        );
        if (timeoutSteps.length === 0 && remainingSteps.length > 0) {
          const step = remainingSteps[0];
          changes.push({
            type: 'modified',
            stepId: step.id,
            stepName: step.name,
            reason: 'Timeout detected. Implementing retry with exponential backoff and circuit breaker.',
          });
          step.metadata = {
            ...step.metadata,
            retryStrategy: 'exponential_backoff',
            maxRetries: 5,
            circuitBreaker: true,
            timeout: 60000,
          };
        }
        break;
      }
    }

    const adaptedPlan: ExecutionPlan = {
      ...plan,
      steps: [...completedSteps, ...remainingSteps],
      status: 'adapted',
      confidence: Math.max(0.1, plan.confidence - changes.length * 0.05),
      updatedAt: new Date().toISOString(),
      version: plan.version + 1,
      parentPlanId: plan.id,
    };

    const duration = performance.now() - startTime;

    return {
      originalPlan: plan,
      adaptedPlan,
      changes,
      reasoning,
      duration,
    };
  }

  private generateReasoning(event: ChangeEvent, plan: ExecutionPlan): string {
    const parts: string[] = [];

    parts.push(`Change detected: ${event.title}`);
    parts.push(`Impact assessment: ${event.impact || 'Unknown impact'}`);

    if (event.riskLevel === 'critical') {
      parts.push('Critical risk detected. Immediate adaptation required.');
    } else if (event.riskLevel === 'high') {
      parts.push('High risk detected. Proactive adaptation initiated.');
    } else {
      parts.push('Medium risk detected. Adapting remaining workflow.');
    }

    parts.push(`Affected plan: "${plan.name}" (v${plan.version})`);
    parts.push(`Adaptation strategy: Preserve completed steps (${plan.steps.filter(s => s.status === 'completed' || s.status === 'in_progress').length} complete), recalculate remaining ${plan.steps.filter(s => s.status === 'pending').length} steps.`);

    return parts.join('\n');
  }

  generateExplanation(result: AdaptationResult): string {
    const lines: string[] = [
      `# Adaptation Report (v${result.originalPlan.version} → v${result.adaptedPlan.version})`,
      '',
      `Reasoning:`,
      ...result.reasoning.split('\n').map((l) => `  ${l}`),
      '',
      `Changes made:`,
    ];

    for (const change of result.changes) {
      lines.push(`  - [${change.type.toUpperCase()}] ${change.stepName} (${change.stepId})`);
      lines.push(`    Reason: ${change.reason}`);
    }

    lines.push('');
    lines.push(`Original confidence: ${(result.originalPlan.confidence * 100).toFixed(0)}%`);
    lines.push(`New confidence: ${(result.adaptedPlan.confidence * 100).toFixed(0)}%`);
    lines.push(`Adaptation time: ${result.duration.toFixed(0)}ms`);

    return lines.join('\n');
  }
}
