import { NextResponse } from 'next/server';
import { agentStore } from '@/services/agent-service';

export async function GET() {
  const events = agentStore.getTimeline().getEvents();
  return NextResponse.json({ events, total: events.length });
}
