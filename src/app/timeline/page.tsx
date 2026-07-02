'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { agentStore } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import type { ChangeEvent, EventType, ChangeCategory, RiskLevel } from '@/types';
import {
  Timeline as TimelineIcon,
  Filter,
  RotateCcw,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Activity,
  GitBranch,
  Bell,
  UserX,
  Timer,
  Box,
  Zap,
} from 'lucide-react';

const eventIcons: Record<string, React.ReactNode> = {
  plan_created: <GitBranch className="h-4 w-4" />,
  plan_started: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  step_started: <Activity className="h-4 w-4 text-blue-500" />,
  step_completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  step_failed: <AlertTriangle className="h-4 w-4 text-red-500" />,
  change_detected: <Bell className="h-4 w-4 text-amber-500" />,
  adaptation_triggered: <GitBranch className="h-4 w-4 text-purple-500" />,
  plan_adapted: <GitBranch className="h-4 w-4 text-purple-500" />,
  risk_assessed: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  recovery_initiated: <RotateCcw className="h-4 w-4 text-blue-500" />,
  recovery_completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  simulation_triggered: <Zap className="h-4 w-4 text-amber-500" />,
};

const riskColors: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const eventTypeLabels: { value: EventType; label: string }[] = [
  { value: 'change_detected', label: 'Change Detected' },
  { value: 'adaptation_triggered', label: 'Adaptation' },
  { value: 'step_failed', label: 'Failure' },
  { value: 'recovery_initiated', label: 'Recovery' },
  { value: 'step_completed', label: 'Success' },
];

export default function TimelinePage() {
  const [events, setEvents] = useState<ChangeEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsub = agentStore.getTimeline().onChange((evts) => setEvents(evts));
    return unsub;
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter((e) => selectedTypes.includes(e.type));
    }
    return result;
  }, [events, search, selectedTypes]);

  const toggleType = useCallback((type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleReplay = useCallback(() => {
    if (events.length === 0) return;
    setReplayIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= events.length) {
        clearInterval(interval);
        setReplayIndex(null);
      } else {
        setReplayIndex(i);
      }
    }, 1000);
  }, [events]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Chronological record of all events and decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((f) => !f)} className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleReplay} className="gap-2" disabled={events.length === 0}>
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="sm:max-w-sm"
        />

        {showFilters && (
          <Card className="animate-slide-in p-2">
            <div className="flex flex-wrap gap-2">
              {eventTypeLabels.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={selectedTypes.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleType(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[17px] top-0 h-full w-[2px] bg-border" />

        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <TimelineIcon className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">No events recorded</p>
              <p className="text-xs text-muted-foreground">
                Start the agent to begin tracking events
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className={`relative flex gap-4 animate-slide-in ${
                replayIndex !== null && index > replayIndex ? 'opacity-30' : ''
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background">
                {eventIcons[event.type] || <Activity className="h-4 w-4" />}
              </div>

              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{event.title}</span>
                        {event.riskLevel && (
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${riskColors[event.riskLevel]}`}
                            title={`Risk: ${event.riskLevel}`}
                          />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      {event.impact && (
                        <p className="mt-1 text-[10px] text-muted-foreground/70 italic">
                          Impact: {event.impact}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {event.type.replace(/_/g, ' ')}
                        </Badge>
                        {event.category && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {event.category.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {event.riskLevel && (
                          <Badge
                            variant={
                              event.riskLevel === 'critical'
                                ? 'destructive'
                                : event.riskLevel === 'high'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="text-[9px] px-1 py-0"
                          >
                            {event.riskLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
