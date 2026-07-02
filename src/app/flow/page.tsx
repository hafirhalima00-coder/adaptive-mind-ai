'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { agentStore } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ExecutionPlan } from '@/types';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  Zap,
  SkipForward,
  Clock,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface StepNodeData {
  label: string;
  description: string;
  status: string;
  order?: number;
}

function StepNode({ data: rawData }: NodeProps) {
  const data = rawData as unknown as StepNodeData;
  const statusColors: Record<string, string> = {
    pending: 'border-slate-300 dark:border-slate-600 bg-card',
    in_progress: 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 node-running',
    completed: 'border-emerald-500 bg-emerald-500/10',
    failed: 'border-red-500 bg-red-500/10',
    skipped: 'border-slate-400/50 bg-muted/30 opacity-60',
    adapted: 'border-purple-500 bg-purple-500/10',
  };

  const icons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    in_progress: <Zap className="h-4 w-4 text-blue-500" />,
    skipped: <SkipForward className="h-4 w-4 text-slate-400" />,
    pending: <Clock className="h-4 w-4 text-slate-400" />,
  };

  return (
    <div
      className={`rounded-lg border-2 px-4 py-3 min-w-[180px] shadow-sm transition-all ${
        statusColors[data.status] || 'border-slate-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!border-2 !border-primary !bg-primary !w-3 !h-3" />
      <div className="flex items-center gap-2">
        {icons[data.status] || <Clock className="h-4 w-4" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{data.label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
            {data.description}
          </p>
        </div>
      </div>
      {data.order !== undefined && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">Step {data.order}</span>
          <Badge
            variant={
              data.status === 'completed'
                ? 'success'
                : data.status === 'failed'
                ? 'destructive'
                : data.status === 'in_progress'
                ? 'info'
                : 'secondary'
            }
            className="text-[8px] px-1 py-0"
          >
            {data.status.replace('_', ' ')}
          </Badge>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!border-2 !border-primary !bg-primary !w-3 !h-3" />
    </div>
  );
}

const nodeTypes = { stepNode: StepNode };

export default function FlowPage() {
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const unsub = agentStore.onChange(() => {
      const s = agentStore.getState();
      setPlan(s.currentPlan);
    });
    return unsub;
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!plan) return { nodes: [], edges: [] };

    const n: Node[] = plan.steps.map((step, i) => ({
      id: step.id,
      type: 'stepNode',
      position: { x: (i % 3) * 220, y: Math.floor(i / 3) * 140 },
      data: {
        label: step.name,
        description: step.description,
        status: step.status,
        order: i + 1,
      },
    }));

    const e: Edge[] = [];
    plan.steps.forEach((step) => {
      step.dependsOn.forEach((depId) => {
        const depExists = plan.steps.find((s) => s.id === depId);
        if (depExists) {
          e.push({
            id: `${depId}-${step.id}`,
            source: depId,
            target: step.id,
            type: 'smoothstep',
            animated: step.status === 'in_progress' || step.status === 'pending',
            style: {
              stroke: step.status === 'completed' ? '#22c55e' : '#94a3b8',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: step.status === 'completed' ? '#22c55e' : '#94a3b8',
            },
          });
        }
      });
    });

    return { nodes: n, edges: e };
  }, [plan]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  const handleExplain = useCallback(() => {
    const exp = agentStore.generateExplanation();
    setExplanation(exp);
    setShowExplanation(true);
  }, []);

  const completedCount = plan?.steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length || 0;
  const totalCount = plan?.steps.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Graph</h1>
          <p className="text-sm text-muted-foreground">
            Interactive visualization of the execution plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plan && (
            <>
              <Badge variant="secondary" className="gap-1.5">
                v{plan.version}
              </Badge>
              <Badge
                variant={
                  plan.status === 'completed'
                    ? 'success'
                    : plan.status === 'failed'
                    ? 'destructive'
                    : plan.status === 'running' || plan.status === 'adapted'
                    ? 'info'
                    : 'secondary'
                }
              >
                {plan.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExplain} className="gap-2">
                <FileText className="h-3.5 w-3.5" />
                Explain
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {plan ? (
        <Card className={fullscreen ? 'fixed inset-4 z-50' : ''}>
          <CardContent className={`p-0 ${fullscreen ? 'h-full' : 'h-[500px]'}`}>
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              minZoom={0.3}
              maxZoom={2}
            >
              <Background color="var(--border)" gap={20} />
              <Controls />
              <MiniMap
                nodeStrokeColor="var(--primary)"
                nodeColor="var(--muted)"
                maskColor="var(--background)"
                className="!border !border-border"
              />
            </ReactFlow>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Workflow className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">No active plan</p>
              <p className="text-xs text-muted-foreground">
                Start the agent from the Dashboard to visualize the workflow
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-normal">
                Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold">
                {completedCount}/{totalCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-normal">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-2xl font-bold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </p>
              <Progress
                value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-normal">
                Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium truncate">{plan.goal}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-normal">
                Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold">
                {plan.steps.filter((s) => s.dependsOn.length > 0).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {showExplanation && (
        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Workflow Reasoning
            </CardTitle>
            <CardDescription>Why the plan was adapted</CardDescription>
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
