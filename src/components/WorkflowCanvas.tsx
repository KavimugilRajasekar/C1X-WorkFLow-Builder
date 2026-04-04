import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WorkflowNode, WorkflowEdge, CanvasTransform, ConnectionState, NodeDefinition } from '../workflow/types';
import { defaultNodeDefinitions, categoryColors } from '../workflow/node-definitions';
import { WorkflowNodeComponent } from './WorkflowNode';
import { WorkflowEdgeComponent } from './WorkflowEdge';
import { ConnectionLine } from './ConnectionLine';

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onFinalizePosition: () => void;
  onAddEdge: (source: string, target: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDropNode: (type: string, x: number, y: number) => void;
}

const GRID_SIZE = 20;
const SNAP_SIZE = 20;

function snapToGrid(val: number) {
  return Math.round(val / SNAP_SIZE) * SNAP_SIZE;
}

export const WorkflowCanvas: React.FC<CanvasProps> = ({
  nodes, edges, selectedNodeId, onSelectNode,
  onUpdatePosition, onFinalizePosition,
  onAddEdge, onDeleteNode, onDeleteEdge, onDropNode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const [dragState, setDragState] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const [connection, setConnection] = useState<ConnectionState>({
    isConnecting: false, sourceNodeId: null, sourcePort: 'output', mousePosition: null,
  });

  const nodeDefMap = useRef(new Map<string, NodeDefinition>());
  useEffect(() => {
    defaultNodeDefinitions.forEach(d => nodeDefMap.current.set(d.type, d));
  }, []);

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale,
    };
  }, [transform]);

  // Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).classList.contains('canvas-bg')) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
      onSelectNode(null);
    }
  }, [transform, onSelectNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: panStart.current.tx + (e.clientX - panStart.current.x),
        y: panStart.current.ty + (e.clientY - panStart.current.y),
      }));
      return;
    }

    if (dragState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      onUpdatePosition(dragState.nodeId, snapToGrid(pos.x - dragState.offsetX), snapToGrid(pos.y - dragState.offsetY));
      return;
    }

    if (connection.isConnecting) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setConnection(prev => ({ ...prev, mousePosition: pos }));
    }
  }, [isPanning, dragState, connection.isConnecting, screenToCanvas, onUpdatePosition]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false);
    if (dragState) {
      onFinalizePosition();
      setDragState(null);
    }
    if (connection.isConnecting) {
      setConnection({ isConnecting: false, sourceNodeId: null, sourcePort: 'output', mousePosition: null });
    }
  }, [isPanning, dragState, connection.isConnecting, onFinalizePosition]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * delta, 0.2), 3);
      const rect = svgRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      return {
        scale: newScale,
        x: cx - (cx - prev.x) * (newScale / prev.scale),
        y: cy - (cy - prev.y) * (newScale / prev.scale),
      };
    });
  }, []);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragState({ nodeId, offsetX: pos.x - node.position.x, offsetY: pos.y - node.position.y });
    onSelectNode(nodeId);
  }, [nodes, screenToCanvas, onSelectNode]);

  const handlePortMouseDown = useCallback((nodeId: string, port: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnection({ isConnecting: true, sourceNodeId: nodeId, sourcePort: port, mousePosition: screenToCanvas(e.clientX, e.clientY) });
  }, [screenToCanvas]);

  const handlePortMouseUp = useCallback((nodeId: string, _port: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connection.isConnecting && connection.sourceNodeId && connection.sourceNodeId !== nodeId) {
      onAddEdge(connection.sourceNodeId, nodeId);
    }
    setConnection({ isConnecting: false, sourceNodeId: null, sourcePort: 'output', mousePosition: null });
  }, [connection, onAddEdge]);

  // Drag & drop from sidebar
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/workflow-node-type');
    if (!type) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    onDropNode(type, snapToGrid(pos.x - 80), snapToGrid(pos.y - 30));
  }, [screenToCanvas, onDropNode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && !(e.target instanceof HTMLInputElement)) {
          onDeleteNode(selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, onDeleteNode]);

  const getNodeDef = (type: string) => nodeDefMap.current.get(type);

  // Find source node position for connection line
  const sourceNode = connection.sourceNodeId ? nodes.find(n => n.id === connection.sourceNodeId) : null;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ background: 'hsl(228, 12%, 6%)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <defs>
        <pattern id="grid-small" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="hsl(228, 10%, 10%)" strokeWidth="0.5" />
        </pattern>
        <pattern id="grid-large" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
          <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#grid-small)" />
          <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="hsl(228, 10%, 13%)" strokeWidth="1" />
        </pattern>
      </defs>

      <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
        <rect className="canvas-bg" x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid-large)" />

        {/* Edges */}
        {edges.map(edge => {
          const sourceN = nodes.find(n => n.id === edge.source);
          const targetN = nodes.find(n => n.id === edge.target);
          if (!sourceN || !targetN) return null;
          return (
            <WorkflowEdgeComponent
              key={edge.id}
              edge={edge}
              sourcePos={{ x: sourceN.position.x + 160, y: sourceN.position.y + 30 }}
              targetPos={{ x: targetN.position.x, y: targetN.position.y + 30 }}
              onDelete={() => onDeleteEdge(edge.id)}
            />
          );
        })}

        {/* Connection line while dragging */}
        {connection.isConnecting && sourceNode && connection.mousePosition && (
          <ConnectionLine
            from={{ x: sourceNode.position.x + 160, y: sourceNode.position.y + 30 }}
            to={connection.mousePosition}
          />
        )}

        {/* Nodes */}
        {nodes.map(node => {
          const def = getNodeDef(node.type);
          return (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              definition={def}
              isSelected={node.id === selectedNodeId}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onPortMouseDown={(port, e) => handlePortMouseDown(node.id, port, e)}
              onPortMouseUp={(port, e) => handlePortMouseUp(node.id, port, e)}
            />
          );
        })}
      </g>
    </svg>
  );
};
