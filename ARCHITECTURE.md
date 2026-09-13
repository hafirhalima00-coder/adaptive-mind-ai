# Architecture Snapshot: Plan → Execute → Observe → Re-evaluate Loop

## The Adaptive Agent Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE AGENT LOOP                          │
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │  PLAN    │───▶│ EXECUTE  │───▶│ OBSERVE  │───▶│ RE-EVAL  │ │
│   │          │    │          │    │          │    │          │  │
│   │ Generate │    │ Run step │    │ Monitor  │    │ Is plan  │  │
│   │ DAG plan │    │ by step  │    │ environ- │    │ still    │  │
│   │ from     │    │ with     │    │ ment for │    │ valid?   │  │
│   │ goal     │    │ precond  │    │ changes  │    │          │  │
│   └──────────┘    │ checks   │    └──────────┘    └────┬─────┘ │
│        ▲          └──────────┘                         │       │
│        │                                               │       │
│        │           ┌──────────────────────────────────┘       │
│        │           │                                          │
│        │           ▼                                          │
│        │     ┌──────────┐     YES     ┌──────────┐           │
│        │     │ Valid?   │────────────▶│ Continue │           │
│        │     └──────────┘             │ Execute  │           │
│        │          │ NO                └──────────┘           │
│        │          ▼                                          │
│        │     ┌──────────┐                                    │
│        │     │ ADAPT    │                                    │
│        │     │          │                                    │
│        │     │ 1. Classify change                            │
│        │     │ 2. Trace impact on DAG                        │
│        │     │ 3. Modify/skip/add steps                      │
│        │     │ 4. Preserve completed work                    │
│        │     │ 5. Explain reasoning                          │
│        │     └──────────┘                                    │
│        │          │                                          │
│        │          ▼                                          │
│        │     ┌──────────┐                                    │
│        │     │Contain?  │──YES──▶ Safe Mode (circuit breaker)│
│        │     │ Failed?  │                                    │
│        │     └──────────┘                                    │
│        │          │ NO                                       │
│        └──────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UI LAYER                               │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐ │
│  │Dashboard│ │Workflow │ │Timeline │ │Simulation Center │ │
│  │         │ │Graph    │ │         │ │                  │ │
│  │• Goal   │ │• React  │ │• Event  │ │• 6 Scenarios     │ │
│  │  input  │ │  Flow   │ │  log    │ │• Silent failure  │ │
│  │• Live   │ │• DAG    │ │• Search │ │  indicators      │ │
│  │  steps  │ │  visual │ │• Filter │ │• Non-adaptive    │ │
│  │• Confid │ │• Live   │ │• Replay │ │  comparison      │ │
│  │• Risks  │ │  status │ │         │ │• Environment     │ │
│  │• Recover│ │         │ │         │ │  state           │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └───────┬──────────┘ │
│       │           │           │              │             │
│  ┌────┴───────────┴───────────┴──────────────┴──────────┐ │
│  │              SERVICES LAYER                           │ │
│  │                                                       │ │
│  │  PlanEngine ──▶ AdaptivePlanner ──▶ TimelineService  │ │
│  │       │              │                    │           │ │
│  │       ▼              ▼                    ▼           │ │
│  │  EnvironmentMonitor ──▶ ChangeDetector               │ │
│  │       │                                                  │ │
│  │       ▼                                                  │ │
│  │  NotificationService    OllamaClient (optional)         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Adaptation Data Flow

```
Environment Change ──▶ EnvironmentMonitor.emit()
                           │
                           ▼
                    TimelineService.addEvent()
                           │
                           ▼
                    AgentStore.handleEnvironmentalChange()
                           │
                    ┌──────┴──────┐
                    │  Evaluate   │
                    │  Risk Level │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Adaptive   │
                    │  Planner    │
                    │  .adapt()   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐     ┌──────────────┐
                    │  Success?   │─NO─▶│  Containment  │
                    └──────┬──────┘     │  Circuit      │
                           │ YES        │  Breaker      │
                           ▼            └──────────────┘
                    Update Plan
                    Update Metrics
                    Notify UI
```

## Key Design Decisions

1. **Signal-driven, not timer-driven**: Adaptation triggers only when the environment actually changes, not on a fixed interval.
2. **Completed work is sacred**: The adaptive planner never discards completed steps — it only modifies remaining work.
3. **Failure containment**: When adaptation itself fails, the agent enters a safe mode that preserves all completed work.
4. **Explainable decisions**: Every adaptation includes a natural language explanation of why changes were made.
