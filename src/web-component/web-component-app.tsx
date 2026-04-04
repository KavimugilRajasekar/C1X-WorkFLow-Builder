import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkflowEngine } from '../engine/workflow-engine';
import { WorkflowNode, WorkflowEdge, WorkflowData } from '../workflow/types';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { NodePalette } from '../components/NodePalette';
import { Toolbar } from '../components/Toolbar';

interface Props {
  engine: WorkflowEngine;
  showBranding?: boolean;
}

export const WebComponentApp: React.FC<Props> = ({ engine, showBranding = true }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(engine.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(engine.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(engine.selectedNodeId);

  // Subscribe to engine changes
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setNodes([...engine.nodes]);
      setEdges([...engine.edges]);
      setSelectedNodeId(engine.selectedNodeId);
    });
    return unsubscribe;
  }, [engine]);

  const handleExport = useCallback(() => {
    const json = engine.exportJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [engine]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.nodes && data.edges) {
            engine.importJSON(data);
          }
        } catch {
          // silent fail
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [engine]);

  const handleClear = useCallback(() => {
    if (engine.nodes.length === 0) return;
    engine.clear();
  }, [engine]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <NodePalette />
      <div className="flex-1 relative">
        <Toolbar
          onUndo={() => engine.undo()}
          onRedo={() => engine.redo()}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
          nodeCount={nodes.length}
          edgeCount={edges.length}
        />
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => engine.setSelectedNodeId(id)}
          onUpdatePosition={(id, x, y) => engine.updateNodePosition(id, x, y)}
          onFinalizePosition={() => engine.finalizeNodePosition()}
          onAddEdge={(source, target) => engine.addEdge(source, target)}
          onDeleteNode={(id) => engine.deleteNode(id)}
          onDeleteEdge={(id) => engine.deleteEdge(id)}
          onDropNode={(type, x, y) => engine.addNode(type, x, y)}
        />
        {showBranding && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-muted-foreground/50">
            <span className="text-[10px] font-mono tracking-widest uppercase">c1x workflow builder</span>
          </div>
        )}
      </div>
    </div>
  );
};
