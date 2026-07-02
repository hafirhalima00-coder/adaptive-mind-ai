'use client';

import { useState, useEffect, useCallback } from 'react';
import { agentStore } from '@/services/agent-service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PulseRing, StatusDot } from '@/components/ui/status-dot';
import type { AgentState } from '@/types';
import {
  Play,
  Square,
  RotateCcw,
  Brain,
  Activity,
  AlertTriangle,
  ShieldCheck,
  GitBranch,
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  Zap,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const [state, setState] = useState<AgentState>(agentStore.getState());
  const [goal, setGoal] = useState('Process a customer order for checkout');
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const unsub = agentStore.onChange(() => {
      setState(agentStore.getState());
    });
    return unsub;
  }, []);

  const handleStart = useCallback(() => {
    if (!goal.trim()) return;
    agentStore.startAgent(goal);
  }, [goal]);

  const handleStop = useCallback(() => {
    agentStore.stopAgent();
  }, []);

  const handleReset = useCallback(() => {
    agentStore.resetAgent();
    setShowExplanation(false);
  }, []);

  const handleExplain = useCallback(() => {
    const exp = agentStore.generateExplanation();
    setExplanation(exp);
    setShowExplanation(true);
  }, []);

  const confidenceColor =
    state.confidence > 0.7 ? 'text-emerald-500' : state.confidence > 0.4 ? 'text-amber-500' : 'text-red-500';

  const riskCount = state.activeRisks.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor agent execution, confidence, and environmental changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={state.isRunning ? 'success' : 'secondary'} className="gap-1.5">
            <StatusDot status={state.isRunning ? 'running' : 'idle'} />
            {state.isRunning ? 'Running' : 'Idle'}
          </Badge>
          {state.currentPlan && (
            <Badge variant="outline" className="gap-1.5">
              v{state.currentPlan.version}
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="goal-input" className="text-sm font-medium">
                Agent Goal
              </label>
              <Input
                id="goal-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe what the agent should do..."
                className="bg-background"
                disabled={state.isRunning}
              />
            </div>
            <div className="flex gap-2">
              {!state.isRunning ? (
                <Button onClick={handleStart} disabled={!goal.trim()} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Agent
                </Button>
              ) : (
                <Button onClick={handleStop} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Brain className="h-4 w-4" />}
          label="Current Task"
          value={state.currentPlan?.goal || 'No active plan'}
          sub={state.currentPlan ? `${state.currentPlan.steps.length} steps` : undefined}
        />
        <MetricCard
          icon={<TrendingUp className={`h-4 w-4 ${confidenceColor}`} />}
          label="Confidence"
          value={`${(state.confidence * 100).toFixed(0)}%`}
          sub={state.replanCount > 0 ? `After ${state.replanCount} replan(s)` : undefined}
        >
          <Progress
            value={state.confidence * 100}
            className={confidenceColor.replace('text-', 'bg-')}
          />
        </MetricCard>
        <MetricCard
          icon={<AlertTriangle className={`h-4 w-4 ${riskCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />}
          label="Active Risks"
          value={riskCount.toString()}
          sub={riskCount > 0 ? state.activeRisks[0]?.description : 'No risks detected'}
        />
        <MetricCard
          icon={<ShieldCheck className={`h-4 w-4 ${state.recoveryStatus !== 'idle' ? 'text-amber-500' : 'text-muted-foreground'}`} />}
          label="Recovery Status"
          value={state.recoveryStatus.charAt(0).toUpperCase() + state.recoveryStatus.slice(1)}
          sub={state.recoveryStatus !== 'idle' ? 'In progress' : 'Stable'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Execution Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Step {state.currentStepIndex + 1} of {state.currentPlan?.steps.length || 0}
                </span>
                <span className="font-medium">{state.executionProgress}%</span>
              </div>
              <Progress value={state.executionProgress} className="h-3" />

              {state.currentPlan && (
                <div className="mt-6 space-y-2">
                  {state.currentPlan.steps.map((step, i) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all ${
                        step.status === 'in_progress'
                          ? 'border-primary/50 bg-primary/5 shadow-sm'
                          : step.status === 'completed'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : step.status === 'failed'
                          ? 'border-red-500/30 bg-red-500/5'
                          : step.status === 'skipped'
                          ? 'border-muted bg-muted/30 opacity-60'
                          : ''
                      }`}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : step.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : step.status === 'in_progress' ? (
                          <Zap className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{step.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                      </div>
                      <Badge
                        variant={
                          step.status === 'completed'
                            ? 'success'
                            : step.status === 'failed'
                            ? 'destructive'
                            : step.status === 'in_progress'
                            ? 'info'
                            : step.status === 'skipped'
                            ? 'outline'
                            : 'secondary'
                        }
                        className="shrink-0 text-[10px]"
                      >
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {!state.currentPlan && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-medium">No active execution</p>
                    <p className="text-xs text-muted-foreground">
                      Enter a goal and click Start Agent to begin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-4 w-4" />
                Replan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold">{state.replanCount}</div>
                <p className="text-xs text-muted-foreground">Total adaptations</p>
              </div>
              {state.replanCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full gap-2"
                  onClick={handleExplain}
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Latest Reasoning
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-4 w-4" />
                Last Adaptation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.replanCount > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="font-medium text-right max-w-[180px] truncate">
                      {state.activeRisks[state.activeRisks.length - 1]?.description || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className={confidenceColor}>{(state.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No adaptations yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(state.environment.apiStatus).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={status} />
                      <span
                        className={
                          status === 'healthy'
                            ? 'text-emerald-500'
                            : status === 'degraded'
                            ? 'text-amber-500'
                            : 'text-red-500'
                        }
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showExplanation && (
        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              Adaptation Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs leading-relaxed">
              {explanation}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-lg font-semibold leading-tight truncate max-w-[200px]" title={value}>
              {value}
            </p>
            {sub && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={sub}>
                {sub}
              </p>
            )}
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  );
}
