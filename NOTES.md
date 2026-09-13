# Notes: What to Look At, AI Usage, Key Decisions

## What to Look At

### 1. The Adaptation Loop (Core Demo)
**Start the agent** → **Trigger a scenario** → **Watch the trace**
- **Dashboard** (`/`): Enter a goal, click Start. Watch steps execute with live status. Then trigger a change from the Simulation Center. See the confidence drop, replan count increment, and the "I Changed My Mind" button appear.
- **Timeline** (`/timeline`): Every adaptation has a natural language explanation. Search "payment" to see only payment-related events. The risk level badge (red/amber/green) shows severity at a glance.

### 2. Silent Failure Comparison
**Simulation Center** → **Run any scenario** → **Click "Non-Adaptive vs Adaptive Comparison"**
Each scenario card shows exactly what a non-adaptive agent would do:
- **Payment Gateway Failure**: Non-adaptive agent hangs on payment processing forever. AdaptiveMind reroutes through queue fallback.
- **Inventory Stockout**: Non-adaptive agent attempts fulfillment with 10 items in stock for a 100-item order. AdaptiveMind recalculates quantities.
- **Permission Revocation**: Non-adaptive agent attempts admin operations without admin access → security violation. AdaptiveMind detects and routes through elevation.

### 3. Failure Containment
**Simulation Center** → **Run "Cascade Failure"** (marked as FAILURE TEST)
Multiple simultaneous changes cause the adaptation itself to encounter issues. Watch the red "Failure Containment Active" card appear with:
- Original Error
- Containment Action (circuit breaker)
- Fallback Strategy (safe mode, preserve completed work)

### 4. Interactive Workflow Graph
**Workflow** (`/flow`): React Flow DAG showing the execution plan. Nodes pulse blue when in-progress, turn green when completed. The graph updates live as the agent adapts.

---

## AI Usage

### What AI tools were used
- **Cursor / Claude**: Used for initial project scaffolding, component architecture design, and writing the thesis. The core services layer (PlanEngine, AdaptivePlanner, EnvironmentMonitor) were designed by hand and iterated with AI assistance for code quality and edge case coverage.
- **Ollama (optional)**: The system includes an optional `OllamaClient` that can connect to a local LLM for generating natural language explanations of adaptation decisions. When Ollama is not running, the system falls back to built-in rule-based explanations that are deterministic and always available.

### What was NOT AI-generated
- The adaptation logic in `AdaptivePlanner.adapt()` is hand-written deterministic code, not LLM-generated. It classifies changes and applies transformation rules based on change category.
- The plan generation in `PlanEngine` uses hardcoded templates for different goal types (order, report, generic) — not dynamic LLM generation.
- The failure containment mechanism (circuit breaker, safe mode) is deterministic, not LLM-dependent.

### Why this matters
The competition asks for "real plan/observe/revise loop" — not "re-prompt an LLM every N seconds." Our architecture is signal-driven: the `EnvironmentMonitor` detects changes and emits events, the `AgentStore` receives them and triggers adaptation, the `AdaptivePlanner` applies deterministic transformation rules. No LLM call is required for the core loop to function.

---

## Key Decisions

### 1. Signal-Driven, Not Timer-Driven
**Decision**: Removed the timer-based `startRandomSimulation()` method from `EnvironmentMonitor`. All adaptation is triggered by explicit user action in the Simulation Center.

**Why**: The competition disqualifies "Re-prompt every N seconds with no real change detection." Our adaptation is reactive — it only fires when the environment actually changes, not on a schedule.

### 2. Completed Work is Sacred
**Decision**: The `AdaptivePlanner` never modifies or removes completed steps. It only changes pending steps.

**Why**: In production, if an agent has already processed payment successfully, you can't "undo" that. The planner preserves completed work and only adapts the remaining DAG.

### 3. Failure Containment as a Feature
**Decision**: Added a `handleAdaptationFailure()` method that activates a circuit breaker when adaptation itself fails.

**Why**: The competition requires "one scenario where adaptation goes wrong, and how you contain it." Most adaptive systems only handle external failures — we also handle internal adaptation failures. When the planner enters an inconsistent state, we revert to the last known-good plan version and enter safe mode.

### 4. Deterministic Over Probabilistic
**Decision**: Made the adaptive planner deterministic (rule-based) rather than LLM-dependent.

**Why**: LLM calls are slow, non-deterministic, and can fail. For a competition demo, we need the adaptation to happen instantly and reliably every time. The rules are:
- API failure → add retry strategy + fallback route
- Inventory change → recalculate quantities
- Permission change → add elevation requirement
- User cancellation → skip remaining steps
- Timeout → add circuit breaker

### 5. Non-Adaptive Baseline
**Decision**: Preserved the original plan as `nonAdaptiveBaseline` when the agent starts, and built a comparison generator.

**Why**: The competition asks for "side-by-side comparison with a non-adaptive baseline." By preserving the original plan, we can show exactly what a blind agent would have done vs. what our adaptive agent actually did.

### 6. In-Memory State (Not Database)
**Decision**: Used an in-memory singleton store rather than SQLite.

**Why**: Vercel's serverless runtime doesn't support persistent filesystem access. The in-memory store works perfectly for the demo and can be swapped to a database for production. The architecture is the same either way — only the storage layer changes.

### 7. Zustand-Free Architecture
**Decision**: Used a plain TypeScript singleton class (`AgentStore`) instead of Zustand/Redux.

**Why**: Fewer dependencies, simpler mental model, and the store is directly testable. The `onChange` callback pattern gives React components reactive updates without framework overhead.

---

## Demo Flow (Recommended 90-Second Sequence)

| Time | Action | What the judge sees |
|------|--------|-------------------|
| 0-10s | Enter goal, click Start | 10-step plan generated, steps begin executing |
| 10-20s | Watch execution | Green checkmarks, progress bar, confidence at 85% |
| 20-35s | Click Simulation → "Payment Gateway Failure" | API status turns red, timeline shows change detected |
| 35-50s | Switch to Dashboard | "Plan Adapted: v1 → v2", confidence drops to 73%, "I Changed My Mind" button visible |
| 50-65s | Click "Why I Changed My Mind" | Full reasoning trace with before/after explanation |
| 65-80s | Click "Non-Adaptive Comparison" | Side-by-side: blind agent hangs vs adaptive agent adapts |
| 80-90s | Switch to Workflow Graph | Live DAG with modified nodes highlighted in purple |
