import type {
  ExecutionPlan,
  AgentState,
  ChangeEvent,
  EnvironmentState,
  AnalyticsMetric,
  SimulationScenario,
  SimulationEvent,
  Notification,
  ChangeCategory,
} from '@/types';
import { generateId, sleep, clamp, randomBetween } from '@/lib/utils';
import { PlanEngine } from './plan-engine';
import { EnvironmentMonitor } from './environment-monitor';
import { AdaptivePlanner, type AdaptationResult } from './adaptive-planner';
import { TimelineService } from './timeline-service';
import { NotificationService } from './notification-service';
import { OllamaClient } from './ollama-client';

class AgentStore {
  private state: AgentState;
  private timeline: TimelineService;
  private notifications: NotificationService;
  private monitor: EnvironmentMonitor;
  private planEngine: PlanEngine;
  private adaptivePlanner: AdaptivePlanner;
  private ollama: OllamaClient;
  private listeners: Array<() => void> = [];
  private metrics: AnalyticsMetric;
  private adaptationHistory: AdaptationResult[] = [];
  private abortController: AbortController | null = null;

  constructor() {
    this.timeline = new TimelineService();
    this.notifications = new NotificationService();
    this.monitor = new EnvironmentMonitor();
    this.planEngine = new PlanEngine();
    this.adaptivePlanner = new AdaptivePlanner();
    this.ollama = new OllamaClient();

    this.metrics = this.createInitialMetrics();
    this.state = this.createInitialState();

    this.monitor.onChange((event) => {
      this.timeline.addEventRaw(event);
      if (this.state.isRunning && this.state.currentPlan) {
        this.handleEnvironmentalChange(event);
      }
    });
  }

  private createInitialState(): AgentState {
    return {
      currentPlan: null,
      environment: this.monitor.getState(),
      isRunning: false,
      confidence: 1,
      activeRisks: [],
      recoveryStatus: 'idle',
      replanCount: 0,
      executionProgress: 0,
      currentStepIndex: 0,
    };
  }

  private createInitialMetrics(): AnalyticsMetric {
    return {
      adaptationFrequency: [],
      recoverySuccessRate: { total: 0, successful: 0, failed: 0 },
      failureTypes: [],
      averageReplanTime: { avg: 0, min: Infinity, max: 0 },
      totalAdaptations: 0,
      totalRecoveries: 0,
      totalFailures: 0,
      confidenceHistory: [{ timestamp: new Date().toISOString(), value: 1 }],
    };
  }

  getState(): AgentState {
    return { ...this.state };
  }

  getTimeline() {
    return this.timeline;
  }

  getNotifications() {
    return this.notifications;
  }

  getEnvironment() {
    return this.monitor;
  }

  getMetrics(): AnalyticsMetric {
    return { ...this.metrics };
  }

  getAdaptationHistory(): AdaptationResult[] {
    return [...this.adaptationHistory];
  }

  getScenarios(): SimulationScenario[] {
    return [
      {
        id: 'payment-failure',
        name: 'Payment Gateway Failure',
        description: 'Simulates a sudden API failure in the payment service during checkout',
        category: 'api_failure',
        events: [
          { type: 'api_failure', target: 'payment-api', payload: { service: 'payment-api' }, delay: 0 },
        ],
      },
      {
        id: 'inventory-crash',
        name: 'Inventory Stockout',
        description: 'Simulates a critical inventory shortage for a popular product',
        category: 'inventory_change',
        events: [
          { type: 'inventory_change', target: 'product-A', payload: { product: 'product-A', delta: -140 }, delay: 0 },
        ],
      },
      {
        id: 'permission-revoke',
        name: 'Admin Permission Revoked',
        description: 'Simulates an admin user losing critical permissions mid-session',
        category: 'permission_change',
        events: [
          { type: 'permission_change', target: 'user-1', payload: { user: 'user-1', revoked: ['admin'] }, delay: 0 },
        ],
      },
      {
        id: 'user-cancellation',
        name: 'User Cancellation',
        description: 'Simulates a user cancelling their request during processing',
        category: 'user_request_change',
        events: [
          { type: 'user_request_change', target: 'req-001', payload: { requestId: 'req-001', change: 'User cancelled the order.' }, delay: 0 },
        ],
      },
      {
        id: 'multi-failure',
        name: 'Multi-Service Cascade',
        description: 'Simulates cascading failures across multiple services',
        category: 'api_failure',
        events: [
          { type: 'api_failure', target: 'payment-api', payload: { service: 'payment-api' }, delay: 0 },
          { type: 'api_failure', target: 'inventory-api', payload: { service: 'inventory-api' }, delay: 3000 },
          { type: 'timeout', target: 'database-query', payload: { operation: 'order-lookup' }, delay: 5000 },
        ],
      },
      {
        id: 'random-events',
        name: 'Random Environment Noise',
        description: 'Continuously injects random environmental changes',
        category: 'api_failure',
        events: [
          { type: 'api_failure', target: 'random', payload: {}, delay: 0 },
        ],
      },
    ];
  }

  onChange(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  async startAgent(goal: string): Promise<void> {
    if (this.state.isRunning) return;

    const plan = this.planEngine.generatePlan(goal);
    this.state.currentPlan = plan;
    this.state.isRunning = true;
    this.state.confidence = plan.confidence;
    this.state.currentStepIndex = 0;
    this.state.executionProgress = 0;
    this.state.replanCount = 0;
    this.state.recoveryStatus = 'idle';
    this.state.activeRisks = [];
    this.adaptationHistory = [];

    this.timeline.addEvent({
      type: 'plan_created',
      category: null,
      title: `Plan Created: ${plan.name}`,
      description: `Generated ${plan.steps.length}-step plan for goal: "${goal}"`,
      previousState: null,
      newState: { planId: plan.id, steps: plan.steps.length },
      riskLevel: null,
      impact: null,
      planId: plan.id,
      stepId: null,
    });

    this.notifications.add({
      type: 'info',
      title: 'Agent Started',
      message: `Execution plan created for: "${goal}"`,
      eventId: null,
    });

    this.updateConfidenceHistory();
    this.notify();

    this.abortController = new AbortController();
    await this.executePlan(plan);
  }

  private async executePlan(plan: ExecutionPlan): Promise<void> {
    const steps = [...plan.steps];

    for (let i = 0; i < steps.length; i++) {
      if (this.abortController?.signal.aborted) break;
      if (this.state.currentPlan?.status === 'failed') break;

      const step = steps[i];
      if (step.status === 'skipped') continue;

      this.state.currentStepIndex = i;
      step.status = 'in_progress';

      this.timeline.addEvent({
        type: 'step_started',
        category: null,
        title: `Executing: ${step.name}`,
        description: step.description,
        previousState: null,
        newState: { stepId: step.id, stepName: step.name },
        riskLevel: null,
        impact: null,
        planId: plan.id,
        stepId: step.id,
      });

      this.state.executionProgress = Math.round((i / steps.length) * 100);
      this.notify();

      await sleep(1500 + Math.random() * 2000);

      const success = Math.random() > 0.15;
      if (success) {
        step.status = 'completed';
        this.timeline.addEvent({
          type: 'step_completed',
          category: null,
          title: `Completed: ${step.name}`,
          description: `Step ${i + 1}/${steps.length} completed successfully`,
          previousState: null,
          newState: { stepId: step.id },
          riskLevel: null,
          impact: null,
          planId: plan.id,
          stepId: step.id,
        });
      } else {
        step.status = 'failed';
        this.metrics.totalFailures++;
        this.metrics.failureTypes.push({ type: `execution_error_${step.name}`, count: 1 });

        this.timeline.addEvent({
          type: 'step_failed',
          category: null,
          title: `Failed: ${step.name}`,
          description: `Step failed unexpectedly during execution`,
          previousState: null,
          newState: { stepId: step.id, error: 'Execution timeout or internal error' },
          riskLevel: 'high',
          impact: 'Step failure may cascade to dependent steps.',
          planId: plan.id,
          stepId: step.id,
        });

        this.state.recoveryStatus = 'recovering';
        this.notifications.add({
          type: 'error',
          title: 'Step Failed',
          message: `${step.name} failed. Initiating recovery.`,
          eventId: null,
        });
        this.notify();

        await sleep(1000);
        this.state.recoveryStatus = 'recovered';
        this.metrics.recoverySuccessRate.total++;
        this.metrics.recoverySuccessRate.successful++;
        this.metrics.totalRecoveries++;

        this.timeline.addEvent({
          type: 'recovery_completed',
          category: null,
          title: `Recovery: ${step.name}`,
          description: `Step recovered with retry strategy`,
          previousState: null,
          newState: { stepId: step.id, recoveryStrategy: 'retry' },
          riskLevel: null,
          impact: null,
          planId: plan.id,
          stepId: step.id,
        });

        step.status = 'completed';
      }

      this.updateConfidenceHistory();
      this.state.executionProgress = Math.round(((i + 1) / steps.length) * 100);
      this.notify();
    }

    const allCompleted = steps.every((s) => s.status === 'completed' || s.status === 'skipped');
    if (this.state.currentPlan) {
      this.state.currentPlan.status = allCompleted ? 'completed' : 'failed';
      this.state.isRunning = false;
      this.state.executionProgress = allCompleted ? 100 : this.state.executionProgress;
      this.state.recoveryStatus = 'idle';

      this.timeline.addEvent({
        type: allCompleted ? 'plan_started' : 'step_failed',
        category: null,
        title: allCompleted ? 'Plan Completed' : 'Plan Failed',
        description: allCompleted
          ? `All ${steps.length} steps completed successfully.`
          : 'Plan terminated due to unrecoverable errors.',
        previousState: null,
        newState: { status: allCompleted ? 'completed' : 'failed', stepsCompleted: steps.filter(s => s.status === 'completed').length },
        riskLevel: null,
        impact: null,
        planId: plan.id,
        stepId: null,
      });

      this.notifications.add({
        type: allCompleted ? 'success' : 'error',
        title: allCompleted ? 'Plan Complete' : 'Plan Failed',
        message: allCompleted
          ? `Goal achieved in ${steps.length} steps.`
          : 'Could not complete the plan.',
        eventId: null,
      });

      this.notify();
    }
  }

  private async handleEnvironmentalChange(event: ChangeEvent): Promise<void> {
    if (!this.state.currentPlan || !this.state.isRunning) return;

    this.state.activeRisks.push({
      level: event.riskLevel || 'medium',
      description: event.title,
    });

    const startTime = performance.now();
    const result = this.adaptivePlanner.adapt(
      this.state.currentPlan,
      event,
      this.state
    );
    const duration = performance.now() - startTime;

    this.adaptationHistory.push(result);
    this.state.currentPlan = result.adaptedPlan;
    this.state.confidence = result.adaptedPlan.confidence;
    this.state.replanCount++;
    this.metrics.totalAdaptations++;

    this.metrics.adaptationFrequency.push({
      date: new Date().toISOString().split('T')[0],
      count: 1,
    });

    this.metrics.averageReplanTime = {
      avg: (this.metrics.averageReplanTime.avg * (this.metrics.totalAdaptations - 1) + duration) / this.metrics.totalAdaptations,
      min: Math.min(this.metrics.averageReplanTime.min, duration),
      max: Math.max(this.metrics.averageReplanTime.max, duration),
    };

    this.timeline.addEvent({
      type: 'adaptation_triggered',
      category: event.category,
      title: `Plan Adapted: v${result.originalPlan.version} → v${result.adaptedPlan.version}`,
      description: result.changes.map((c) => `[${c.type}] ${c.stepName}: ${c.reason}`).join('\n'),
      previousState: { planVersion: result.originalPlan.version },
      newState: { planVersion: result.adaptedPlan.version, changes: result.changes.length },
      riskLevel: null,
      impact: `${result.changes.length} changes applied. Confidence: ${(result.adaptedPlan.confidence * 100).toFixed(0)}%`,
      planId: this.state.currentPlan.id,
      stepId: null,
    });

    this.notifications.add({
      type: 'warning',
      title: 'Plan Adapted',
      message: `${result.changes.length} changes applied due to: ${event.title}`,
      eventId: event.id,
    });

    this.updateConfidenceHistory();
    this.notify();
  }

  stopAgent(): void {
    this.abortController?.abort();
    this.state.isRunning = false;
    this.state.recoveryStatus = 'idle';
    this.notify();
  }

  resetAgent(): void {
    this.stopAgent();
    this.state.currentPlan = null;
    this.state.confidence = 1;
    this.state.activeRisks = [];
    this.state.replanCount = 0;
    this.state.executionProgress = 0;
    this.state.currentStepIndex = 0;
    this.timeline.clear();
    this.metrics = this.createInitialMetrics();
    this.adaptationHistory = [];
    this.notify();
  }

  triggerSimulationEvent(event: SimulationEvent): void {
    this.monitor.simulateEvent(event);
  }

  triggerScenario(scenarioId: string): void {
    const scenarios = this.getScenarios();
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    this.timeline.addEvent({
      type: 'simulation_triggered',
      category: scenario.category as ChangeCategory,
      title: `Scenario: ${scenario.name}`,
      description: scenario.description,
      previousState: null,
      newState: { scenarioId },
      riskLevel: 'medium',
      impact: scenario.description,
      planId: this.state.currentPlan?.id || '',
      stepId: null,
    });

    scenario.events.forEach((e, i) => {
      setTimeout(() => {
        this.triggerSimulationEvent(e);
      }, e.delay || i * 2000);
    });
  }

  private updateConfidenceHistory(): void {
    this.metrics.confidenceHistory.push({
      timestamp: new Date().toISOString(),
      value: this.state.confidence,
    });
  }

  async queryOllama(prompt: string): Promise<string> {
    return this.ollama.generate(prompt);
  }

  generateExplanation(): string {
    if (this.adaptationHistory.length === 0) {
      return 'No adaptations have occurred yet. Start the agent and trigger environmental changes to see adaptive planning in action.';
    }

    const latest = this.adaptationHistory[this.adaptationHistory.length - 1];
    return this.adaptivePlanner.generateExplanation(latest);
  }
}

export const agentStore = new AgentStore();
