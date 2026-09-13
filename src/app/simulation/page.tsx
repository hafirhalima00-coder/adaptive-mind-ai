'use client';

import { useState, useEffect, useCallback } from 'react';
import { agentStore } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SimulationScenario, EnvironmentState, FailureContainment } from '@/types';
import {
  Beaker,
  Zap,
  Box,
  ShieldAlert,
  UserX,
  AlertTriangle,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

const scenarioIcons: Record<string, React.ReactNode> = {
  'payment-failure': <Zap className="h-5 w-5 text-red-500" />,
  'inventory-crash': <Box className="h-5 w-5 text-amber-500" />,
  'permission-revoke': <ShieldAlert className="h-5 w-5 text-purple-500" />,
  'user-cancellation': <UserX className="h-5 w-5 text-orange-500" />,
  'cascade-failure': <AlertTriangle className="h-5 w-5 text-red-600" />,
  'auth-breach': <Shield className="h-5 w-5 text-pink-500" />,
};

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [env, setEnv] = useState<EnvironmentState>(agentStore.getEnvironment().getState());
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [containment, setContainment] = useState<FailureContainment | null>(null);
  const [comparison, setComparison] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setScenarios(agentStore.getScenarios());

    const interval = setInterval(() => {
      setEnv(agentStore.getEnvironment().getState());
      setContainment(agentStore.getFailureContainment());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleTriggerScenario = useCallback(
    (scenarioId: string) => {
      setRunningScenario(scenarioId);
      agentStore.triggerScenario(scenarioId);
      setShowComparison(false);
      setTimeout(() => setRunningScenario(null), 100);
    },
    []
  );

  const handleCompare = useCallback(() => {
    const comp = agentStore.generateComparison();
    setComparison(comp);
    setShowComparison(true);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulation Center</h1>
        <p className="text-sm text-muted-foreground">
          Trigger environmental changes to test agent adaptability. Each scenario demonstrates
          a real-world failure that a non-adaptive agent would miss silently.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`transition-all hover:shadow-md ${
              runningScenario === scenario.id ? 'ring-2 ring-primary' : ''
            } ${scenario.id === 'cascade-failure' ? 'border-red-500/50' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {scenarioIcons[scenario.id] || <Beaker className="h-5 w-5" />}
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {scenario.category}
                  </Badge>
                  {scenario.id === 'cascade-failure' && (
                    <Badge variant="destructive" className="text-[10px]">
                      FAILURE TEST
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="mt-3 text-base">{scenario.name}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {scenario.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
                    EVENTS ({scenario.events.length})
                  </p>
                  {scenario.events.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                        {e.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-muted-foreground truncate">{e.target}</span>
                      {e.delay > 0 && (
                        <span className="ml-auto text-muted-foreground shrink-0">+{e.delay}ms</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-md bg-red-500/5 border border-red-500/20 p-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-red-500">
                    <EyeOff className="h-3 w-3" />
                    Silent failure without adaptation
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Non-adaptive agent: continues blindly, fails or hangs.
                  </p>
                </div>
              </div>

              <Button
                className="mt-4 w-full gap-2"
                size="sm"
                onClick={() => handleTriggerScenario(scenario.id)}
              >
                <Play className="h-3.5 w-3.5" />
                Run Scenario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {containment?.triggered && (
        <Card className="border-red-500 animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-500">
              <Shield className="h-5 w-5" />
              Failure Containment Active
            </CardTitle>
            <CardDescription>
              Adaptation itself encountered an error. The agent entered safe mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                  <p className="text-xs font-medium text-red-500">Original Error</p>
                  <p className="text-xs text-muted-foreground mt-1">{containment.originalError}</p>
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                  <p className="text-xs font-medium text-amber-500">Containment Action</p>
                  <p className="text-xs text-muted-foreground mt-1">{containment.containmentAction}</p>
                </div>
              </div>
              <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                <p className="text-xs font-medium text-blue-500">Fallback Strategy</p>
                <p className="text-xs text-muted-foreground mt-1">{containment.fallbackStrategy}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={containment.recovered ? 'success' : 'destructive'}>
                  {containment.recovered ? 'RECOVERED' : 'SAFE MODE'}
                </Badge>
                <span className="text-muted-foreground">
                  All completed work preserved. Execution paused.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4" />
                Non-Adaptive vs Adaptive Comparison
              </CardTitle>
              <CardDescription>
                See the difference between a blind agent and an adaptive one
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCompare} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showComparison ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs leading-relaxed max-h-80 overflow-y-auto">
              {comparison}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Start the agent, trigger a scenario, then click Generate to compare.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Beaker className="h-4 w-4" />
            Environment State
          </CardTitle>
          <CardDescription>Current simulated environment snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">API Status</h3>
              <div className="space-y-1.5">
                {Object.entries(env.apiStatus).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <Badge
                      variant={
                        status === 'healthy'
                          ? 'success'
                          : status === 'degraded'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Inventory</h3>
              <div className="space-y-1.5">
                {Object.entries(env.inventory).map(([product, qty]) => (
                  <div key={product} className="flex items-center justify-between text-sm">
                    <span>{product}</span>
                    <span
                      className={
                        qty < 20
                          ? 'font-medium text-red-500'
                          : qty < 100
                          ? 'text-amber-500'
                          : ''
                      }
                    >
                      {qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Permissions</h3>
              <div className="space-y-1.5">
                {Object.entries(env.userPermissions).map(([user, perms]) => (
                  <div key={user} className="text-sm">
                    <span className="font-medium">{user}: </span>
                    <span className="text-muted-foreground">{perms.join(', ') || 'none'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">System</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>System Load</span>
                  <span>{(env.systemLoad * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(env.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
