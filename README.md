# C1X-Workflow-Builder

A **visual marketing automation workflow builder** packaged as a **framework-agnostic Web Component**. Build workflows by dragging nodes onto a canvas, connecting them with edges, and exporting/importing them as JSON.

## What Is This?

C1X-Workflow-Builder is a tool that lets users create marketing automation flows visually. Think of it like a flowchart builder, but purpose-built for marketing workflows:

- **Drag** trigger nodes (e.g., "Abandoned Cart", "Purchase", "User Signup")
- **Connect** them to action nodes (e.g., "Send Email", "Send SMS", "Webhook")
- **Branch** with logic nodes (e.g., "If/Else Condition", "A/B Test Split")
- **Export** the complete workflow as JSON to use in your marketing platform

The entire app is exposed as a single HTML tag: `<c1x-workflow-builder>`, making it embeddable in **any** web project regardless of framework.

---

## How It Works — Layer by Layer

The app follows a strict **4-layer architecture**. Each layer has one job and talks only to the layer directly below it.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: CONSUMER / HOST ENVIRONMENT                           │
│  (React, Vue, Angular, Vanilla HTML — any framework or none)    │
│                                                                 │
│  <c1x-workflow-builder></c1x-workflow-builder>                 │
│  document.querySelector('c1x-workflow-builder').exportJSON()    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Custom Element API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: WEB COMPONENT WRAPPER                                 │
│  src/web-component/c1x-workflow-builder.ts                     │
│                                                                 │
│  • Registers <c1x-workflow-builder> custom element              │
│  • Creates Shadow DOM for style isolation                       │
│  • Mounts React root inside shadow root                        │
│  • Bridges CustomElement API ↔ WorkflowEngine                  │
│  • Dispatches onChange / onSave events to host                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Props & Callbacks
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: REACT UI LAYER (Render-Only)                         │
│  src/pages/Index.tsx  +  src/components/*.tsx                   │
│                                                                 │
│  • Receives ALL data via props (no internal state)             │
│  • Calls engine methods for every user action                  │
│  • Components are "dumb" — they only render what they're given  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Engine Methods
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: WORKFLOW ENGINE (Pure TypeScript — No React)         │
│  src/engine/workflow-engine.ts                                 │
│                                                                 │
│  • Owns all state: nodes[], edges[], selectedNodeId           │
│  • Manages undo/redo history stack                             │
│  • Validates workflow integrity                                │
│  • Import/Export JSON serialization                            │
│  • Subscribes observers to state changes                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: User Adds a Node

1. **User** drags a node from the NodePalette onto the canvas
2. **WorkflowCanvas** (Layer 3) receives the drop, calls `engine.addNode(type, x, y)`
3. **WorkflowEngine** (Layer 4) adds the node, pushes history, calls all subscribers
4. **Index.tsx** (Layer 3) receives the subscriber callback, calls `setNodes([...newNodes])`
5. **React** re-renders WorkflowCanvas with the new nodes array
6. **Canvas** renders the new node on screen

### Data Flow Example: Host App Exports Workflow

1. **Host app** calls `document.querySelector('c1x-workflow-builder').exportJSON()`
2. **Web Component** (Layer 2) calls `this.engine.exportJSON()`
3. **WorkflowEngine** (Layer 4) serializes nodes + edges to JSON and returns it
4. **Web Component** returns JSON string to host app

---

## Directory Structure & File Descriptions

```
c1x-workflow-builder/
├── public/                          # Static assets served as-is
│   ├── favicon.ico                  # Site favicon
│   ├── placeholder.svg              # Placeholder image
│   └── robots.txt                  # Search engine crawling rules
│
├── src/                            # Source code
│   │
│   ├── engine/                     # ─── LAYER 4: WORKFLOW ENGINE ───
│   │   └── workflow-engine.ts      # Pure TypeScript class. No React imports.
│   │                               # Manages: nodes, edges, history, validation,
│   │                               # import/export, subscriptions
│   │
│   ├── web-component/              # ─── LAYER 2: WEB COMPONENT ───
│   │   ├── c1x-workflow-builder.ts # Registers <c1x-workflow-builder>
│   │   │                           # Creates Shadow DOM, mounts React root,
│   │   │                           # bridges API ↔ engine, dispatches events
│   │   └── web-component-app.tsx    # React app mounted inside Shadow DOM.
│   │                               # Subscribes to engine, wires UI to engine
│   │
│   ├── workflow/                   # Workflow data types & node definitions
│   │   ├── types.ts               # TypeScript interfaces:
│   │   │                           # WorkflowNode, WorkflowEdge, WorkflowData,
│   │   │                           # Position, NodeDefinition, CanvasTransform
│   │   └── node-definitions.ts     # All node type definitions:
│   │                               # triggers (Ad Click, Purchase, etc.),
│   │                               # actions (Send Email, SMS, etc.),
│   │                               # logic (Delay, If/Else, A/B Test, etc.)
│   │
│   ├── components/                 # ─── LAYER 3: UI COMPONENTS (Render-Only) ───
│   │   │
│   │   ├── WorkflowCanvas.tsx      # Main SVG canvas.
│   │   │                           # Handles: pan, zoom, grid rendering,
│   │   │                           # node/edge rendering, drag-drop onto canvas,
│   │   │                           # keyboard shortcuts (Delete key)
│   │   │
│   │   ├── WorkflowNode.tsx       # Renders a single node on the canvas.
│   │   │                           # Shows: icon, label, type subtitle,
│   │   │                           # input/output ports, selection glow
│   │   │
│   │   ├── WorkflowEdge.tsx        # Renders a bezier curve edge between two nodes.
│   │   │                           # Shows: animated dot, hover highlight,
│   │   │                           # delete button on hover
│   │   │
│   │   ├── ConnectionLine.tsx      # Dashed SVG line shown while dragging
│   │   │                           # a connection from one node to another
│   │   │
│   │   ├── NodePalette.tsx         # Left sidebar listing all draggable node types
│   │   │                           # organized by category (Triggers, Actions, Logic).
│   │   │                           # Includes: search filter, category collapse
│   │   │
│   │   ├── Toolbar.tsx             # Top toolbar bar with buttons:
│   │   │                           # Undo, Redo, Import JSON, Export JSON, Clear
│   │   │                           # Also shows node/edge count
│   │   │
│   │   ├── NavLink.tsx             # Styled navigation link component
│   │   │
│   │   └── ui/                     # shadcn/ui component library (Radix UI)
│   │       ├── button.tsx          # Button with variants
│   │       ├── dialog.tsx          # Modal dialog
│   │       ├── dropdown-menu.tsx   # Dropdown menu
│   │       ├── tooltip.tsx         # Tooltip wrapper
│   │       ├── sonner.tsx          # Sonner toast notifications
│   │       ├── toaster.tsx         # Toaster component
│   │       ├── separator.tsx       # Horizontal/vertical divider
│   │       ├── slider.tsx          # Slider input
│   │       ├── switch.tsx          # Toggle switch
│   │       ├── tabs.tsx            # Tab navigation
│   │       ├── card.tsx            # Card container
│   │       ├── avatar.tsx          # Avatar image
│   │       ├── badge.tsx           # Label badge
│   │       ├── progress.tsx         # Progress bar
│   │       ├── scroll-area.tsx      # Scrollable area
│   │       ├── select.tsx          # Dropdown select
│   │       ├── radio-group.tsx      # Radio button group
│   │       ├── checkbox.tsx        # Checkbox
│   │       ├── input.tsx           # Text input
│   │       ├── label.tsx           # Form label
│   │       ├── textarea.tsx        # Multi-line text input
│   │       └── ... (additional shadcn/ui components)
│   │
│   ├── pages/
│   │   ├── Index.tsx               # Main page composing the entire UI.
│   │   │                           # Creates WorkflowEngine instance,
│   │   │                           # subscribes to engine changes,
│   │   │                           # wires Toolbar + NodePalette + WorkflowCanvas
│   │   └── NotFound.tsx            # 404 error page
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-mobile.tsx         # Detects mobile viewport (< 768px)
│   │   └── use-toast.ts           # Toast notification hook
│   │
│   ├── lib/
│   │   └── utils.ts               # Utility: cn() merges Tailwind classes
│   │
│   ├── App.tsx                    # Root React component.
│   │                               # Sets up: QueryClient (TanStack Query),
│   │                               # TooltipProvider, Toaster, React Router
│   │
│   ├── index.css                  # Global CSS.
│   │                               # Defines: CSS custom properties (variables)
│   │                               # for colors, typography, canvas, nodes, edges
│   │
│   ├── index.ts                   # Library entry point (npm package).
│   │                               # Exports: WorkflowEngine, C1xWorkflowBuilderElement,
│   │                               # all types, node definitions
│   │
│   └── main.tsx                   # React DOM entry point.
│   │                               # Calls createRoot, renders <App />
│   │
│   ├── dist/                      # Built npm package (Rollup output)
│   │   ├── index.js               # Main ES module bundle
│   │   ├── index.js.map           # Source map
│   │   ├── index.d.ts             # Main type declaration
│   │   ├── engine/
│   │   │   └── workflow-engine.d.ts
│   │   ├── web-component/
│   │   │   ├── c1x-workflow-builder.d.ts
│   │   │   └── web-component-app.d.ts
│   │   └── workflow/
│   │       ├── types.d.ts
│   │       └── node-definitions.d.ts
│   │
│   ├── dist-demo/                  # Built demo app (Vite output)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── demo/                      # Standalone Web Component demo
│   │   ├── index.html             # Loads dist/index.js, uses <c1x-workflow-builder>
│   │   └── main.tsx              # Demo entry point
│   │
│   ├── index.html                 # Main app HTML entry point
│   │
│   ├── package.json               # Dependencies and scripts
│   ├── vite.config.ts             # Vite dev server configuration
│   ├── rollup.config.js           # Rollup library build configuration
│   ├── tsconfig.json              # TypeScript config (application)
│   ├── tsconfig.lib.json          # TypeScript config (library build)
│   ├── eslint.config.js           # ESLint rules
│   ├── vitest.config.ts          # Vitest test configuration
│   └── components.json           # shadcn/ui CLI configuration
```

---

## File-by-File Quick Reference

| File | Layer | What It Does |
|------|-------|--------------|
| `src/engine/workflow-engine.ts` | 4 | All workflow logic: nodes, edges, undo/redo, validation, import/export |
| `src/web-component/c1x-workflow-builder.ts` | 2 | Web Component registration, Shadow DOM, API bridge |
| `src/web-component/web-component-app.tsx` | 2-3 | React root inside shadow DOM, subscribes to engine |
| `src/workflow/types.ts` | — | TypeScript interfaces (no logic) |
| `src/workflow/node-definitions.ts` | — | Static node definitions (data, no logic) |
| `src/pages/Index.tsx` | 3 | Main page, wires engine to UI components |
| `src/components/WorkflowCanvas.tsx` | 3 | SVG canvas: pan/zoom, drag/drop, renders nodes & edges |
| `src/components/WorkflowNode.tsx` | 3 | Renders one node (icon, label, ports) |
| `src/components/WorkflowEdge.tsx` | 3 | Renders one edge (bezier curve, animated dot) |
| `src/components/ConnectionLine.tsx` | 3 | Dashed line while creating a connection |
| `src/components/NodePalette.tsx` | 3 | Left sidebar with draggable node list |
| `src/components/Toolbar.tsx` | 3 | Top bar with action buttons |
| `src/App.tsx` | 3 | Root app setup: providers, routing |
| `src/main.tsx` | — | DOM entry point |
| `src/index.ts` | — | npm package entry (exports) |
| `src/index.css` | — | Global CSS variables and styles |
| `src/lib/utils.ts` | — | Utility: `cn()` class name merger |
| `src/hooks/use-mobile.tsx` | — | Hook: is mobile viewport |
| `src/hooks/use-toast.ts` | — | Hook: toast notifications |
| `rollup.config.js` | Build | Rollup library build config |
| `vite.config.ts` | Build | Vite dev server config |
| `tsconfig.lib.json` | Build | TypeScript config for library build |

---

## Node Types

### Triggers (Start of Workflow)
| Node | Icon | Description |
|------|------|-------------|
| Ad Click | MousePointer | Fires when user clicks an ad |
| Ad Impression | Eye | Fires when user sees an ad |
| Purchase | ShoppingCart | Fires on completed purchase |
| User Signup | UserPlus | Fires on new user registration |
| Abandoned Cart | ShoppingCart | Fires when cart is abandoned |
| Page Visit | Globe | Fires on specific page visit |
| CTR Below Threshold | TrendingDown | Fires when CTR drops below threshold |

### Actions (Do Something)
| Node | Icon | Description |
|------|------|-------------|
| Show Ad | Tv | Display an advertisement |
| Send Email | Mail | Send an email message |
| Send SMS | MessageSquare | Send a text message |
| Push Notification | Bell | Send push notification |
| Webhook | Webhook | Call external webhook |
| Add to Audience | Users | Add user to audience segment |
| Remove from Audience | UserMinus | Remove user from segment |
| Pause Campaign | PauseCircle | Pause a marketing campaign |
| Adjust Bid | DollarSign | Modify ad bid amount |
| Notify Team | BellRing | Send team notification |
| Update CRM | Database | Update CRM record |

### Logic (Branch/Split)
| Node | Icon | Description |
|------|------|-------------|
| Delay | Clock | Wait for specified duration |
| If/Else | GitBranch | Branch based on condition |
| A/B Test | Split | Split users into test groups |
| Filter | Filter | Filter users by criteria |
| Wait for Event | Hourglass | Wait for specific event |

---

## Web Component API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `initial-data` | JSON string | — | Pre-populate with a workflow JSON object |
| `show-branding` | boolean | `true` | Show/hide the "c1x workflow builder" watermark |

### Events

```js
const wc = document.querySelector('c1x-workflow-builder');

// Fires every time the workflow changes
wc.addEventListener('onChange', (e) => {
  console.log('Workflow changed:', e.detail.workflow);
});

// Fires when user explicitly saves (via export)
wc.addEventListener('onSave', (e) => {
  console.log('Workflow saved:', e.detail.workflow);
});
```

### Methods

```js
const wc = document.querySelector('c1x-workflow-builder');

// Serialize workflow to JSON string
wc.exportJSON();                        // → '{"version":"1.0","nodes":[...],"edges":[...],"metadata":{}}'

// Load workflow from JSON string
wc.importJSON(jsonString);              // → true/false

// Validate workflow
wc.validate();                          // → { valid: boolean, errors: string[] }

// History
wc.undo();                              // Undo last action
wc.redo();                              // Redo previously undone action

// Canvas
wc.clear();                             // Remove all nodes and edges
wc.reset();                             // Reset to default "Abandoned Cart Recovery" example

// Advanced
wc.getEngine();                         // Get raw WorkflowEngine instance
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the npm package (Web Component)
npm run build:lib

# Build the demo app
npm run build
```

## Usage as Web Component

**Vanilla HTML:**
```html
<script type="module" src="node_modules/c1x-workflow-builder/dist/index.js"></script>
<c1x-workflow-builder show-branding="true"></c1x-workflow-builder>
```

**React:**
```tsx
import 'c1x-workflow-builder';

function App() {
  return <c1x-workflow-builder show-branding="false" />;
}
```

**Angular:**
```html
<c1x-workflow-builder></c1x-workflow-builder>
```

## Example Workflow

The app loads with an "Abandoned Cart Recovery" example:

```
Abandoned Cart Trigger
       │
       ▼
    Delay (1 hour)
       │
       ▼
  Send Email (Reminder)
       │
       ▼
  If/Else Condition
    ├── Yes ──► Send SMS (Discount)
    └── No  ──► Adjust Bid (Increase)
```

## Tech Stack

| Category | Technology |
|----------|------------|
| UI Framework | React 18 + TypeScript |
| Build (App) | Vite |
| Build (Library) | Rollup |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Animations | Framer Motion |
| State (App) | TanStack React Query |
| Routing | React Router DOM |
| Web Component | Native Custom Elements + Shadow DOM |
| Testing | Vitest + Playwright |

## License

Private project — All rights reserved.
