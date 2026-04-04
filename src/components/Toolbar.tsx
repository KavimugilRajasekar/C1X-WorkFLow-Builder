import React from 'react';
import { Undo2, Redo2, Download, Upload, Trash2 } from 'lucide-react';

interface Props {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  nodeCount: number;
  edgeCount: number;
}

export const Toolbar: React.FC<Props> = ({ onUndo, onRedo, onExport, onImport, onClear, nodeCount, edgeCount }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-toolbar-bg/95 backdrop-blur-sm border border-toolbar-border rounded-xl px-2 py-1.5 shadow-2xl">
      <ToolButton icon={<Undo2 size={15} />} label="Undo" onClick={onUndo} />
      <ToolButton icon={<Redo2 size={15} />} label="Redo" onClick={onRedo} />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolButton icon={<Upload size={15} />} label="Import JSON" onClick={onImport} />
      <ToolButton icon={<Download size={15} />} label="Export JSON" onClick={onExport} />
      <ToolButton icon={<Trash2 size={15} />} label="Clear" onClick={onClear} destructive />
      <div className="w-px h-5 bg-border mx-1" />
      <div className="px-2 text-[10px] text-muted-foreground font-mono">
        {nodeCount} nodes · {edgeCount} edges
      </div>
    </div>
  );
};

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}> = ({ icon, label, onClick, destructive }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-2 rounded-lg transition-colors ${
      destructive
        ? 'text-destructive/70 hover:text-destructive hover:bg-destructive/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`}
  >
    {icon}
  </button>
);
