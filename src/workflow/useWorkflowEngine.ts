import { useState, useCallback, useRef } from 'react';
import { WorkflowNode, WorkflowEdge, WorkflowData } from './types';

interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

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

export function useWorkflowEngine() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(EXAMPLE_WORKFLOW.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(EXAMPLE_WORKFLOW.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const historyRef = useRef<HistoryEntry[]>([{ nodes: EXAMPLE_WORKFLOW.nodes, edges: EXAMPLE_WORKFLOW.edges }]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((n: WorkflowNode[], e: WorkflowEdge[]) => {
    const idx = historyIndexRef.current + 1;
    historyRef.current = historyRef.current.slice(0, idx);
    historyRef.current.push({ nodes: n, edges: e });
    historyIndexRef.current = idx;
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => {
      const next = prev.map(n => n.id === nodeId ? { ...n, position: { x, y } } : n);
      return next;
    });
  }, []);

  const finalizeNodePosition = useCallback(() => {
    setNodes(prev => {
      setEdges(prevEdges => {
        pushHistory(prev, prevEdges);
        return prevEdges;
      });
      return prev;
    });
  }, [pushHistory]);

  const addNode = useCallback((type: string, x: number, y: number) => {
    const newNode: WorkflowNode = { id: genId(), type, position: { x, y }, config: {} };
    setNodes(prev => {
      const next = [...prev, newNode];
      setEdges(prevEdges => {
        pushHistory(next, prevEdges);
        return prevEdges;
      });
      return next;
    });
    return newNode.id;
  }, [pushHistory]);

  const addEdge = useCallback((source: string, target: string) => {
    // Prevent duplicates and self-connections
    if (source === target) return;
    setEdges(prev => {
      if (prev.some(e => e.source === source && e.target === target)) return prev;
      // Simple cycle check
      const adjacency = new Map<string, string[]>();
      for (const e of prev) {
        if (!adjacency.has(e.source)) adjacency.set(e.source, []);
        adjacency.get(e.source)!.push(e.target);
      }
      // Check if target can reach source (would create cycle)
      const visited = new Set<string>();
      const stack = [target];
      while (stack.length) {
        const curr = stack.pop()!;
        if (curr === source) return prev; // cycle detected
        if (visited.has(curr)) continue;
        visited.add(curr);
        for (const neighbor of adjacency.get(curr) || []) {
          stack.push(neighbor);
        }
      }
      // Also add the new edge to check
      if (!adjacency.has(source)) adjacency.set(source, []);
      
      const newEdge: WorkflowEdge = { id: genEdgeId(), source, target };
      const next = [...prev, newEdge];
      setNodes(prevNodes => {
        pushHistory(prevNodes, next);
        return prevNodes;
      });
      return next;
    });
  }, [pushHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const next = prev.filter(n => n.id !== nodeId);
      setEdges(prevEdges => {
        const nextEdges = prevEdges.filter(e => e.source !== nodeId && e.target !== nodeId);
        pushHistory(next, nextEdges);
        return nextEdges;
      });
      return next;
    });
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [selectedNodeId, pushHistory]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => {
      const next = prev.filter(e => e.id !== edgeId);
      setNodes(prevNodes => {
        pushHistory(prevNodes, next);
        return prevNodes;
      });
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
  }, []);

  const exportJSON = useCallback((): WorkflowData => ({
    version: '1.0',
    nodes,
    edges,
    metadata: {
      ...EXAMPLE_WORKFLOW.metadata,
      updated_at: new Date().toISOString(),
    },
  }), [nodes, edges]);

  const importJSON = useCallback((data: WorkflowData) => {
    setNodes(data.nodes);
    setEdges(data.edges);
    pushHistory(data.nodes, data.edges);
  }, [pushHistory]);

  return {
    nodes, edges, selectedNodeId, setSelectedNodeId,
    updateNodePosition, finalizeNodePosition,
    addNode, addEdge, deleteNode, deleteEdge,
    undo, redo, exportJSON, importJSON,
  };
}
