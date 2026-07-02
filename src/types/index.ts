export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'adapted';

export type EventType =
  | 'plan_created'
  | 'plan_started'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'change_detected'
  | 'adaptation_triggered'
  | 'plan_adapted'
  | 'risk_assessed'
  | 'recovery_initiated'
  | 'recovery_completed'
  | 'simulation_triggered'
  | 'user_intervention';

export type ChangeCategory = 'api_failure' | 'inventory_change' | 'user_request_change' | 'permission_change' | 'timeout' | 'external_signal';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PlanStep {
  id: string;
  planId: string;
  order: number;
  name: string;
  description: string;
  status: StepStatus;
  dependsOn: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionPlan {
  id: string;
  name: string;
  goal: string;
  steps: PlanStep[];
  status: 'draft' | 'running' | 'completed' | 'failed' | 'adapted';
  confidence: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  parentPlanId: string | null;
}

export interface ChangeEvent {
  id: string;
  type: EventType;
  category: ChangeCategory | null;
  title: string;
  description: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  riskLevel: RiskLevel | null;
  impact: string | null;
  timestamp: string;
  planId: string;
  stepId: string | null;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  events: SimulationEvent[];
  category: string;
}

export interface SimulationEvent {
  type: ChangeCategory;
  target: string;
  payload: Record<string, unknown>;
  delay: number;
}

export interface EnvironmentState {
  apiStatus: Record<string, 'healthy' | 'degraded' | 'down'>;
  inventory: Record<string, number>;
  userPermissions: Record<string, string[]>;
  activeRequests: Record<string, unknown>;
  systemLoad: number;
  lastUpdated: string;
}

export interface AnalyticsMetric {
  adaptationFrequency: { date: string; count: number }[];
  recoverySuccessRate: { total: number; successful: number; failed: number };
  failureTypes: { type: string; count: number }[];
  averageReplanTime: { avg: number; min: number; max: number };
  totalAdaptations: number;
  totalRecoveries: number;
  totalFailures: number;
  confidenceHistory: { timestamp: string; value: number }[];
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId: string | null;
}

export interface AgentState {
  currentPlan: ExecutionPlan | null;
  environment: EnvironmentState;
  isRunning: boolean;
  confidence: number;
  activeRisks: { level: RiskLevel; description: string }[];
  recoveryStatus: 'idle' | 'recovering' | 'recovered' | 'failed';
  replanCount: number;
  executionProgress: number;
  currentStepIndex: number;
}
