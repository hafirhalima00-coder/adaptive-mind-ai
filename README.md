# Ÿ§  AdaptiveMind AI

> **Can an AI system recognize that reality changed and safely change its mind?**
AdaptiveMind AI is a production-grade autonomous agent platform that continuously monitors its environment, detects changes, and safely adapts its execution plan â€” while explaining every decision it makes.

![Dashboard](https://img.shields.io/badge/status-production-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ŸŒŸ The Core Question
Traditional AI agents execute a plan from start to finish â€” but reality doesn't stand still. AdaptiveMind AI asks:

> **If the environment changes mid-execution, can the agent recognize the shift, understand its implications, and replan without starting over?**
This project demonstrates **metacognition in autonomous systems**: the ability to reflect on one's own plan, detect when assumptions are invalidated, and generate a safe alternative path.

---

## Ÿï¸ Architecture

```âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”‚                     UI Layer (Next.js 16)                    â”‚â”‚  âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” â”‚â”‚  â”Dashboard â”‚ â”‚ Workflow â”‚ â”‚ Timeline â”‚ â”‚  Simulation   â”‚ â”‚â”‚  â”‚  (/)     â”‚ â”‚ (/flow)  â”‚ â”‚(/timeline)â”‚ â”‚  (/simulation)â”‚ â”‚â”‚  â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜ â”‚â”‚  âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”  â”‚â”‚  â”Analytics â”‚ â”‚  Components (shadcn/ui + React Flow)     â”‚  â”‚â”‚  â”‚(/analytics)â”‚ â”‚  CommandPalette â”‚ NotificationCenter    â”‚  â”‚â”‚  â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜  â”‚âœâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”¤â”‚                    Services Layer (Clean Architecture)       â”‚â”‚  âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” â”‚â”‚  â”‚  Plan    â”‚ â”‚ Env.     â”‚ â”‚ Change   â”‚ â”‚  Adaptive     â”‚ â”‚â”‚  â”‚  Engine  â”‚ â”‚ Monitor  â”‚ â”‚ Detector â”‚ â”‚  Planner      â”‚ â”‚â”‚  â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜ â”‚â”‚  âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â” âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”   â”‚â”‚  â”‚ Timeline â”‚ â”‚ Notif.   â”‚ â”‚   Ollama Client (LLM)    â”‚   â”‚â”‚  â”‚ Service  â”‚ â”‚ Service  â”‚ â”‚   (Optional Reasoning)   â”‚   â”‚â”‚  â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”˜ â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜   â”‚âœâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”¤â”‚                  Data Layer (In-Memory Store)                â”‚â”‚       Plans â”‚ Steps â”‚ Events â”‚ Metrics â”‚ Env. State          â”‚â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜
```

### Ÿ”„ Adaptation Flow

```âŒâ”â”â”â”â”â”â”â”â”â”     âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”     âŒâ”â”â”â”â”â”â”â”â”â”â”     âŒâ”â”â”â”â”â”â”â”â”â”â”â”‚  Plan   â”â”â”â”â”â–â”‚  Execute   â”â”â”â”â”â–â”‚  Detect  â”‚     â”‚  Plan    â”‚â”‚ Engine  â”‚     â”‚   Steps    â”‚     â”‚  Change  â”‚     â”‚ Complete â”‚â”â”â”â”â”â”â”â”â”â”â”˜     â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜     â”â”â”â”â”â”â”â”â”â”â”â”˜     â”â”â”â”â”â”â”â”â”â”â”â”˜
                      â”‚                  â”‚
                      â–¼                  â–¼
               âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”    âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
               â”‚  Step OK   â”‚    â”‚ Change Event  â”‚
               â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜    â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜
                                         â”‚
                                         â–¼
                                  âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
                                  â”‚  Adaptive    â”‚
                                  â”‚  Planner     â”‚
                                  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜
                                         â”‚
                          âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
                          â–¼              â–¼              â–¼
                   âŒâ”â”â”â”â”â”â”â”â”â”â”   âŒâ”â”â”â”â”â”â”â”â”â”â”   âŒâ”â”â”â”â”â”â”â”â”â”â”
                   â”‚ Modify   â”‚   â”‚  Skip    â”‚   â”‚  Add     â”‚
                   â”‚  Step    â”‚   â”‚  Step    â”‚   â”‚  Step    â”‚
                   â”â”â”â”â”â”â”â”â”â”â”â”˜   â”â”â”â”â”â”â”â”â”â”â”â”˜   â”â”â”â”â”â”â”â”â”â”â”â”˜
                                         â”‚
                                         â–¼
                                  âŒâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
                                  â”‚  Resume with â”‚
                                  â”‚  Adapted Planâ”‚
                                  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”˜
```

---

## œ¨ Features

### Core Capabilities
- **Planning Engine** â€” Generates dependency-respecting DAG execution plans
- **Environment Monitor** â€” Simulates real-world conditions (API status, inventory, permissions, timeouts)
- **Change Detection** â€” Deep comparison between expected and actual environment state
- **Adaptive Planner** â€” Recalculates remaining workflow with full explanations for every change
- **Timeline** â€” Complete chronological event log with search, filter, and replay

### UI/UX
- **Dashboard** â€” Real-time execution visualization with confidence metrics, risk tracking, and progress
- **Interactive Workflow Graph** â€” React Flow-powered DAG visualization with live status updates
- **Simulation Center** â€” 6 preset scenarios for testing agent resilience
- **Analytics** â€” Charts for adaptation frequency, recovery rates, replan times
- **Command Palette** â€” Œ˜+K (Ctrl+K) quick navigation
- **Notification Center** â€” Real-time event notifications
- **Dark Mode** â€” Automatic theme detection with manual toggle
- **Responsive Design** â€” Mobile-first layout

### Technical
- œ… Clean Architecture with separations of concerns
- œ… 30+ unit tests across all services
- œ… Docker & Docker Compose support
- œ… GitHub Actions CI/CD
- œ… Vercel-ready deployment
- œ… Full TypeScript strict mode
- œ… Accessible (ARIA labels, keyboard navigation)

---

## Ÿš€ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bashgit clone https://github.com/yourusername/adaptive-mind-ai.gitcd adaptive-mind-ai
npm installnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bashdocker compose up -d
```
This starts both the Next.js app and an Ollama server for LLM-powered reasoning.

---

## Ÿª Testing

```bash
# Run all testsnpx vitest run

# Watch modenpx vitest

# With coveragenpx vitest run --coverage
```

---

## Ÿ® Using the Agent

### 1. Start the AgentNavigate to the **Dashboard** â†’ enter a goal (e.g., "Process a customer order for checkout") â†’ click **Start Agent**.

### 2. Watch ExecutionThe agent executes steps sequentially, with each step showing its real-time status (pending â†’ in progress â†’ completed).

### 3. Trigger ChangesGo to the **Simulation Center** and run a scenario (e.g., "Payment Gateway Failure"). The agent will detect the change and adapt.

### 4. Observe Adaptation
- **Dashboard** shows confidence dropping and replan count incrementing
- **Workflow Graph** displays the adapted DAG with modified steps highlighted
- **Timeline** logs every event with explanations
- **Analytics** tracks adaptation frequency and recovery rates

### 5. Understand ReasoningClick **"View Latest Reasoning"** on the Dashboard to see the agent's metacognitive explanation in this format:

```
# Adaptation Report (v1 â†’ v2)
Reasoning:
  Change detected: API Failure: payment-api
  Impact assessment: Blocking all operations dependent on payment-api
  High risk detected. Proactive adaptation initiated.
  Adaptation strategy: Preserve completed steps (2 complete),
  recalculate remaining 8 steps.
Changes made:
  - [MODIFIED] Process Payment (step-4)
    Reason: API unavailable. Adding retry with exponential backoff.
  - [MODIFIED] Complete Order (step-9)
    Reason: Dependency Process Payment is degraded.
Original confidence: 85%New confidence: 73%Adaptation time: 12ms
```

---

## Ÿ§© Scenario Presets

| Scenario | Category | Description | Risk |
|----------|----------|-------------|------|
| Payment Gateway Failure | `api_failure` | Payment API returns 503 | High |
| Inventory Stockout | `inventory_change` | Popular product stock drops to 10 | High |
| Admin Permission Revoked | `permission_change` | Admin access removed mid-session | Critical |
| User Cancellation | `user_request_change` | User cancels during processing | Medium |
| Multi-Service Cascade | `mixed` | Cascading failures across 3 services | Critical |
| Random Environment Noise | `random` | Continuous random changes | Variable |

---

## ŸŠ Analytics

- **Adaptation Frequency** â€” Bar chart of adaptations per day
- **Replan Time** â€” Average, min, and max adaptation duration
- **Failure Types** â€” Categorized failure breakdown
- **Confidence History** â€” Agent confidence over the execution timeline
- **Recovery Success Rate** â€” Overall recovery effectiveness

---

## ŸŒ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent` | GET | Get current agent state, metrics, and events |
| `/api/agent` | POST | Start/stop/reset agent, get explanations |
| `/api/simulation` | POST | Trigger scenarios or individual events |
| `/api/events` | GET | Get all timeline events |

### POST `/api/agent`

```json
{ "action": "start", "goal": "Process a customer order" }
{ "action": "stop" }
{ "action": "reset" }
{ "action": "explain" }
{ "action": "ollama", "prompt": "Why did you adapt?" }
```

### POST `/api/simulation`

```json
{ "scenarioId": "payment-failure" }
{ "event": { "type": "api_failure", "target": "auth-api", "payload": {} } }
```

---

## Ÿ›ï¸ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| React Flow (@xyflow/react) | Interactive workflow DAG |
| Recharts | Analytics charts |
| Lucide React | Icons |
| Motion (Framer Motion) | Animations |
| Ollama | Local LLM reasoning |
| Vitest | Unit testing |
| Docker | Containerization |

---

## â˜ï¸ Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
1. Push to GitHub2. Import to Vercel3. Deploy â€” zero configuration required

> **Note:** The in-memory store resets on each deployment. For persistent data, integrate with Vercel KV or a database.

---

## Ÿ“ Project Structure

```src/âœâ”â”€ app/â”‚   âœâ”â”€ page.tsx              # Dashboardâ”‚   âœâ”â”€ simulation/page.tsx   # Simulation Centerâ”‚   âœâ”â”€ timeline/page.tsx     # Timelineâ”‚   âœâ”â”€ analytics/page.tsx    # Analyticsâ”‚   âœâ”â”€ flow/page.tsx         # Workflow Graphâ”‚   âœâ”â”€ layout.tsx            # Root layoutâ”‚   âœâ”â”€ globals.css           # Global styles + CSS variablesâ”‚   â”â”â”€ api/â”‚       âœâ”â”€ agent/route.ts    # Agent control APIâ”‚       âœâ”â”€ simulation/route.ts # Simulation APIâ”‚       â”â”â”€ events/route.ts   # Events APIâœâ”â”€ components/â”‚   âœâ”â”€ ui/                   # shadcn/ui primitivesâ”‚   â”â”â”€ layout/               # Sidebar, Header, CommandPalette, etc.âœâ”â”€ services/â”‚   âœâ”â”€ agent-service.ts      # Main orchestrator (singleton)â”‚   âœâ”â”€ plan-engine.ts        # Plan generationâ”‚   âœâ”â”€ environment-monitor.ts # Environment simulationâ”‚   âœâ”â”€ change-detector.ts    # Change detectionâ”‚   âœâ”â”€ adaptive-planner.ts   # Adaptive replanningâ”‚   âœâ”â”€ timeline-service.ts   # Event log managementâ”‚   âœâ”â”€ notification-service.ts # Notification systemâ”‚   â”â”â”€ ollama-client.ts      # LLM integrationâœâ”â”€ types/index.ts            # TypeScript typesâ”â”â”€ lib/utils.ts              # Utility functions
```

---

## Ÿ¤ Contributing
1. Fork the repository2. Create a feature branch: `git checkout -b feature/amazing-feature`3. Commit: `git commit -m 'Add amazing feature'`4. Push: `git push origin feature/amazing-feature`5. Open a Pull Request

---

## Ÿ“„ License
MIT â€” see [LICENSE](LICENSE) file.

---

## Ÿ’¡ Philosophy

> "The measure of intelligence is the ability to change." â€” Albert Einstein
AdaptiveMind AI embodies this principle. Traditional AI agents are rigid â€” they follow a plan and fail when reality diverges from expectations. AdaptiveMind AI represents a shift toward **metacognitive agents** that can:1. **Monitor** their own execution context2. **Detect** when assumptions are invalidated3. **Understand** the implications of change4. **Adapt** without discarding prior work5. **Explain** their reasoning transparently
This is not just a demo â€” it's a blueprint for the next generation of autonomous systems that operate safely in dynamic, unpredictable environments.

---

> **built by Halima Hafir**

