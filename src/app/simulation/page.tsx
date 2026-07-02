'use client';

import { useState, useEffect, useCallback } from 'react';
import { agentStore } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SimulationScenario, EnvironmentState } from '@/types';
import {
  Beaker,
  Zap,
  Box,
  ShieldAlert,
  UserX,
  Timer,
  Play,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const scenarioIcons: Record<string, React.ReactNode> = {
  'payment-failure': <Zap className="h-5 w-5 text-red-500" />,
  'inventory-crash': <Box className="h-5 w-5 text-amber-500" />,
  'permission-revoke': <ShieldAlert className="h-5 w-5 text-purple-500" />,
  'user-cancellation': <UserX className="h-5 w-5 text-orange-500" />,
  'multi-failure': <AlertTriangle className="h-5 w-5 text-red-600" />,
  'random-events': <RefreshCw className="h-5 w-5 text-blue-500" />,
};

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [env, setEnv] = useState<EnvironmentState>(agentStore.getEnvironment().getState());
  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  useEffect(() => {
    setScenarios(agentStore.getScenarios());

    const interval = setInterval(() => {
      setEnv(agentStore.getEnvironment().getState());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTriggerScenario = useCallback(
    (scenarioId: string) => {
      setRunningScenario(scenarioId);
      agentStore.triggerScenario(scenarioId);
      setTimeout(() => setRunningScenario(null), 100);
    },
    []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulation Center</h1>
        <p className="text-sm text-muted-foreground">
          Trigger environmental events to test agent adaptability
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`transition-all hover:shadow-md ${
              runningScenario === scenario.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {scenarioIcons[scenario.id] || <Beaker className="h-5 w-5" />}
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {scenario.category}
                </Badge>
              </div>
              <CardTitle className="mt-3 text-base">{scenario.name}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Events ({scenario.events.length})
                </p>
                {scenario.events.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {e.type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-muted-foreground">{e.target}</span>
                    {e.delay > 0 && (
                      <span className="ml-auto text-muted-foreground">+{e.delay}ms</span>
                    )}
                  </div>
                ))}
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
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">User Permissions</h3>
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
