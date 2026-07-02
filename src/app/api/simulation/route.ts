import { NextRequest, NextResponse } from 'next/server';
import { agentStore } from '@/services/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, event } = body;

    if (scenarioId) {
      agentStore.triggerScenario(scenarioId);
      return NextResponse.json({ status: 'scenario_triggered', scenarioId });
    }

    if (event) {
      agentStore.triggerSimulationEvent(event);
      return NextResponse.json({ status: 'event_triggered', event });
    }

    return NextResponse.json({ error: 'scenarioId or event required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
