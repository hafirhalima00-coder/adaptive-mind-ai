# Walkthrough Video

**Watch:** https://youtu.be/CAVwhsIptwU

---

# Loom Walkthrough Script (90 seconds)

## Opening (0-10s)
"AdaptiveMind AI answers one question: Can an AI system recognize that reality changed and safely change its mind? Let me show you."

## The Setup (10-20s)
"Here's the dashboard. I'll enter a goal — process a customer order — and start the agent. It generates a 10-step execution plan."

## Normal Execution (20-35s)
"Watch as the agent executes each step. Green checkmarks mean completed. The confidence meter tracks how certain the agent is in its plan. Everything's running smoothly."

## The Change (35-50s)
"Now I'll trigger a payment gateway failure from the Simulation Center. Watch — the agent detects the change immediately. The timeline shows 'I changed my mind because payment-api is down.' The workflow graph updates live. The agent modified the affected steps and added a retry strategy."

## Before/After (50-65s)
"Here's the key difference. A non-adaptive agent would hang on payment processing forever. AdaptiveMind rerouted through a queue-based fallback and kept going. The confidence adjusted, but the agent adapted and continued."

## Failure Containment (65-80s)
"Watch what happens when I trigger a cascade failure — multiple simultaneous changes. The first adaptation attempt itself encounters issues. The agent activates a circuit breaker and enters safe mode. All completed work is preserved. This is failure containment."

## Closing (80-90s)
"AdaptiveMind AI: the agent that notices when reality changes and safely changes its mind. Every decision is explained. Every adaptation is traceable. This is what production-ready adaptation looks like."
