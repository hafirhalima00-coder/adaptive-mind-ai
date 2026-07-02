'use client';

import { useState, useEffect, useMemo } from 'react';
import { agentStore } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AnalyticsMetric } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  GitBranch,
  ShieldCheck,
  Zap,
  BarChart,
  LineChart,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetric>(() => {
    const m = agentStore.getMetrics();
    return m;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const m = agentStore.getMetrics();
      setMetrics((prev) => {
        if (
          m.totalAdaptations === prev.totalAdaptations &&
          m.totalRecoveries === prev.totalRecoveries
        )
          return prev;
        return m;
      });
    }, 2000);

    const unsub = agentStore.onChange(() => {
      setMetrics(agentStore.getMetrics());
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const successRate =
    metrics.recoverySuccessRate.total > 0
      ? (
          (metrics.recoverySuccessRate.successful / metrics.recoverySuccessRate.total) *
          100
        ).toFixed(0)
      : 'N/A';

  const chartMax = useMemo(() => {
    if (metrics.adaptationFrequency.length === 0) return 10;
    return Math.max(...metrics.adaptationFrequency.map((a) => a.count), 10);
  }, [metrics.adaptationFrequency]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Visualize agent performance, adaptation patterns, and recovery metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricStat
          icon={<GitBranch className="h-4 w-4 text-purple-500" />}
          label="Total Adaptations"
          value={metrics.totalAdaptations.toString()}
        />
        <MetricStat
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
          label="Total Recoveries"
          value={metrics.totalRecoveries.toString()}
        />
        <MetricStat
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          label="Total Failures"
          value={metrics.totalFailures.toString()}
        />
        <MetricStat
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          label="Recovery Success Rate"
          value={successRate !== 'N/A' ? `${successRate}%` : 'N/A'}
          trend={successRate !== 'N/A' && parseInt(successRate) > 80 ? 'up' : 'down'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart className="h-4 w-4" />
              Adaptation Frequency
            </CardTitle>
            <CardDescription>Adaptations per day</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.adaptationFrequency.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No adaptation data yet
              </div>
            ) : (
              <div className="relative h-48">
                <div className="flex h-full items-end gap-2">
                  {metrics.adaptationFrequency.map((item, i) => (
                    <div
                      key={i}
                      className="relative flex flex-1 flex-col items-center gap-1"
                    >
                      <span className="text-[9px] font-medium text-muted-foreground">
                        {item.count}
                      </span>
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                        style={{
                          height: `${Math.max(4, (item.count / chartMax) * 100)}%`,
                        }}
                      />
                      <span className="text-[8px] text-muted-foreground whitespace-nowrap">
                        {item.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Replan Time
            </CardTitle>
            <CardDescription>Average, min, and max replan duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">
                  {metrics.averageReplanTime.avg.toFixed(0)}ms
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">
                  {metrics.averageReplanTime.min === Infinity
                    ? '-'
                    : `${metrics.averageReplanTime.min.toFixed(0)}ms`}
                </p>
                <p className="text-xs text-muted-foreground">Min</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">
                  {metrics.averageReplanTime.max === 0
                    ? '-'
                    : `${metrics.averageReplanTime.max.toFixed(0)}ms`}
                </p>
                <p className="text-xs text-muted-foreground">Max</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Failure Types
            </CardTitle>
            <CardDescription>Classification of execution failures</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.failureTypes.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No failures recorded
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.failureTypes.map((ft, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px]">{ft.type}</span>
                      <span className="font-medium">{ft.count}</span>
                    </div>
                    <Progress
                      value={(ft.count / Math.max(...metrics.failureTypes.map((f) => f.count))) * 100}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-4 w-4" />
              Confidence History
            </CardTitle>
            <CardDescription>Agent confidence over time</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.confidenceHistory.length <= 1 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No confidence data yet
              </div>
            ) : (
              <div className="relative h-40">
                <div className="flex h-full items-end gap-1">
                  {metrics.confidenceHistory.map((point, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          point.value > 0.7
                            ? 'bg-emerald-500/80'
                            : point.value > 0.4
                            ? 'bg-amber-500/80'
                            : 'bg-red-500/80'
                        }`}
                        style={{ height: `${point.value * 100}%`, minHeight: '2px' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-muted-foreground">
                  <span>Start</span>
                  <span>Now</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              label="Total Execution Events"
              value={(
                metrics.totalAdaptations +
                metrics.totalRecoveries +
                metrics.totalFailures
              ).toString()}
            />
            <SummaryItem
              label="Recovery Success Rate"
              value={successRate}
              highlight={successRate !== 'N/A' && parseInt(successRate) > 80}
            />
            <SummaryItem
              label="Avg Replan Time"
              value={metrics.averageReplanTime.avg > 0 ? `${metrics.averageReplanTime.avg.toFixed(0)}ms` : 'N/A'}
            />
            <SummaryItem
              label="Unique Failure Types"
              value={metrics.failureTypes.length.toString()}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricStat({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
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
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {trend && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="text-[10px]">
              {trend === 'up' ? '↑' : '↓'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${highlight ? 'text-emerald-500' : ''}`}>
        {value}
      </p>
    </div>
  );
}
