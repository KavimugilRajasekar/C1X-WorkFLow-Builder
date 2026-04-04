import { WorkflowNode, WorkflowEdge, WorkflowData } from '../workflow/types';

interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type WorkflowEngineListener = (engine: WorkflowEngine) => void;

const EXAMPLE_WORKFLOW: WorkflowData = {
  version: '1.0',
  nodes: [
    { id: 'node_1', type: 'abandoned_cart', position: { x: 120, y: 280 }, config: { wait_minutes: 30 } },
    { id: 'node_2', type: 'delay', position: { x: 380, y: 280 }, config: { duration: 1, unit: 'hours' } },
    { id: 'node_3', type: 'send_email', position: { x: 640, y: 280 }, config: { template_id: 'cart_reminder', subject: 'Forgot something?' } },
    { id: 'node_4', type: 'condition', position: { x: 900, y: 280 }, config: { condition_type: 'purchased', field: 'order_status', operator: 'equals', value: 'completed' } },
    { id: 'node_5', type: 'send_sms', position: { x: 1160, y: 160 }, config: { template_id: 'discount_offer' } },
    { id: 'node_6', type: 'adjust_bid', position: { x: 1160, y: 400 }, config: { new_bid_amount: 2.5, direction: 'increase' } },
  ],
  edges: [
    { id: 'edge_1', source: 'node_1', target: 'node_2' },
    { id: 'edge_2', source: 'node_2', target: 'node_3' },
    { id: 'edge_3', source: 'node_3', target: 'node_4' },
    { id: 'edge_4', source: 'node_4', target: 'node_5' },
    { id: 'edge_5', source: 'node_4', target: 'node_6' },
  ],
  metadata: {
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned carts with email and SMS follow-ups',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

let idCounter = 100;
const genId = () => `node_${++idCounter}`;
const genEdgeId = () => `edge_${++idCounter}`;

export class WorkflowEngine {
  private _nodes: WorkflowNode[] = [...EXAMPLE_WORKFLOW.nodes];
  private _edges: WorkflowEdge[] = [...EXAMPLE_WORKFLOW.edges];
  private _selectedNodeId: string | null = null;

  private history: HistoryEntry[] = [{ nodes: [...EXAMPLE_WORKFLOW.nodes], edges: [...EXAMPLE_WORKFLOW.edges] }];
  private historyIndex = 0;

  private listeners: Set<WorkflowEngineListener> = new Set();

  get nodes() { return this._nodes; }
  get edges() { return this._edges; }
  get selectedNodeId() { return this._selectedNodeId; }

  subscribe(listener: WorkflowEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this));
  }

  private pushHistory(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    const idx = this.historyIndex + 1;
    this.history = this.history.slice(0, idx);
    this.history.push({ nodes, edges });
    this.historyIndex = idx;
  }

  setSelectedNodeId(id: string | null) {
    this._selectedNodeId = id;
    this.notify();
  }

  updateNodePosition(nodeId: string, x: number, y: number) {
    this._nodes = this._nodes.map(n =>
      n.id === nodeId ? { ...n, position: { x, y } } : n
    );
    this.notify();
  }

  finalizeNodePosition() {
    this.pushHistory(this._nodes, this._edges);
  }

  addNode(type: string, x: number, y: number): string {
    const newNode: WorkflowNode = { id: genId(), type, position: { x, y }, config: {} };
    this._nodes = [...this._nodes, newNode];
    this.pushHistory(this._nodes, this._edges);
    this.notify();
    return newNode.id;
  }

  addEdge(source: string, target: string): boolean {
    if (source === target) return false;

    if (this._edges.some(e => e.source === source && e.target === target)) return false;

    const adjacency = new Map<string, string[]>();
    for (const e of this._edges) {
      if (!adjacency.has(e.source)) adjacency.set(e.source, []);
      adjacency.get(e.source)!.push(e.target);
    }

    const visited = new Set<string>();
    const stack = [target];
    while (stack.length) {
      const curr = stack.pop()!;
      if (curr === source) return false;
      if (visited.has(curr)) continue;
      visited.add(curr);
      for (const neighbor of adjacency.get(curr) || []) {
        stack.push(neighbor);
      }
    }

    const newEdge: WorkflowEdge = { id: genEdgeId(), source, target };
    this._edges = [...this._edges, newEdge];
    this.pushHistory(this._nodes, this._edges);
    this.notify();
    return true;
  }

  deleteNode(nodeId: string) {
    this._nodes = this._nodes.filter(n => n.id !== nodeId);
    this._edges = this._edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    if (this._selectedNodeId === nodeId) this._selectedNodeId = null;
    this.pushHistory(this._nodes, this._edges);
    this.notify();
  }

  deleteEdge(edgeId: string) {
    this._edges = this._edges.filter(e => e.id !== edgeId);
    this.pushHistory(this._nodes, this._edges);
    this.notify();
  }

  undo(): boolean {
    if (this.historyIndex <= 0) return false;
    this.historyIndex--;
    const entry = this.history[this.historyIndex];
    this._nodes = [...entry.nodes];
    this._edges = [...entry.edges];
    this.notify();
    return true;
  }

  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) return false;
    this.historyIndex++;
    const entry = this.history[this.historyIndex];
    this._nodes = [...entry.nodes];
    this._edges = [...entry.edges];
    this.notify();
    return true;
  }

  exportJSON(): WorkflowData {
    return {
      version: '1.0',
      nodes: [...this._nodes],
      edges: [...this._edges],
      metadata: {
        ...EXAMPLE_WORKFLOW.metadata,
        updated_at: new Date().toISOString(),
      },
    };
  }

  importJSON(data: WorkflowData) {
    this._nodes = [...data.nodes];
    this._edges = [...data.edges];
    this._selectedNodeId = null;
    this.pushHistory(this._nodes, this._edges);
    this.notify();
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this._nodes.length === 0) {
      errors.push('Workflow has no nodes');
    }

    const triggerNodes = this._nodes.filter(n => {
      const type = n.type;
      return ['ad_click', 'impression', 'purchase', 'signup', 'abandoned_cart', 'page_visit', 'ctr_threshold'].includes(type);
    });

    if (triggerNodes.length === 0) {
      errors.push('Workflow has no trigger nodes');
    }

    const orphanNodes = this._nodes.filter(n => {
      const hasIncoming = this._edges.some(e => e.target === n.id);
      const isTrigger = triggerNodes.includes(n);
      return !hasIncoming && !isTrigger;
    });

    if (orphanNodes.length > 0) {
      errors.push(`Nodes with no incoming connections: ${orphanNodes.map(n => n.id).join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  clear() {
    this._nodes = [];
    this._edges = [];
    this._selectedNodeId = null;
    this.pushHistory(this._nodes, this._edges);
    this.notify();
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  reset() {
    this._nodes = [...EXAMPLE_WORKFLOW.nodes];
    this._edges = [...EXAMPLE_WORKFLOW.edges];
    this._selectedNodeId = null;
    this.history = [{ nodes: [...EXAMPLE_WORKFLOW.nodes], edges: [...EXAMPLE_WORKFLOW.edges] }];
    this.historyIndex = 0;
    this.notify();
  }
}
