export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: Position;
  config: Record<string, unknown>;
  label?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
}

export interface WorkflowData {
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
}

export type NodeCategory = 'trigger' | 'action' | 'logic';

export interface NodeDefinition {
  type: string;
  label: string;
  icon: string;
  category: NodeCategory;
  configFields: string[];
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  offset: Position;
}

export interface ConnectionState {
  isConnecting: boolean;
  sourceNodeId: string | null;
  sourcePort: string;
  mousePosition: Position | null;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
