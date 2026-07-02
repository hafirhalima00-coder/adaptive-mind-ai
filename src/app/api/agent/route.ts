import { NextRequest, NextResponse } from 'next/server';
import { agentStore } from '@/services/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, goal } = body;

    switch (action) {
      case 'start':
        if (!goal) {
          return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
        }
        await agentStore.startAgent(goal);
        return NextResponse.json({ status: 'started', state: agentStore.getState() });

      case 'stop':
        agentStore.stopAgent();
        return NextResponse.json({ status: 'stopped', state: agentStore.getState() });

      case 'reset':
        agentStore.resetAgent();
        return NextResponse.json({ status: 'reset', state: agentStore.getState() });

      case 'status':
        return NextResponse.json({
          state: agentStore.getState(),
          metrics: agentStore.getMetrics(),
        });

      case 'explain':
        return NextResponse.json({ explanation: agentStore.generateExplanation() });

      case 'ollama':
        if (!body.prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }
        const response = await agentStore.queryOllama(body.prompt);
        return NextResponse.json({ response });

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    state: agentStore.getState(),
    metrics: agentStore.getMetrics(),
    events: agentStore.getTimeline().getEvents().slice(0, 50),
  });
}
