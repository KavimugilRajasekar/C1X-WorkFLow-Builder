import React, { useState } from 'react';
import { defaultNodeDefinitions, categoryColors } from '../workflow/node-definitions';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';

export const NodePalette: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('trigger');

  const categories = ['trigger', 'action', 'logic'] as const;

  const filteredNodes = defaultNodeDefinitions.filter(
    n => n.label.toLowerCase().includes(search.toLowerCase()) || n.type.includes(search.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/workflow-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-foreground font-display tracking-wide uppercase mb-3">Nodes</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full bg-secondary border border-border rounded-md pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map(cat => {
          const colors = categoryColors[cat];
          const nodesInCat = filteredNodes.filter(n => n.category === cat);
          if (nodesInCat.length === 0) return null;
          const isExpanded = expandedCategory === cat || search.length > 0;

          return (
            <div key={cat}>
              <button
                onClick={() => setExpandedCategory(isExpanded && !search ? null : cat)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-secondary/50 transition-colors"
                style={{ color: colors.accent }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: colors.accent }} />
                {colors.label}
                <span className="ml-auto text-muted-foreground font-mono text-[10px]">{nodesInCat.length}</span>
              </button>

              {isExpanded && (
                <div className="space-y-0.5 ml-2 mb-2">
                  {nodesInCat.map(nodeDef => {
                    const IconComp = (LucideIcons as unknown as Record<string, React.FC<{ size?: number; className?: string }>>)[nodeDef.icon];
                    return (
                      <div
                        key={nodeDef.type}
                        draggable
                        onDragStart={e => handleDragStart(e, nodeDef.type)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-secondary/80 transition-colors group"
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ background: colors.bg }}
                        >
                          {IconComp && <IconComp size={14} className="opacity-80 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <div>
                          <div className="text-xs text-foreground font-medium leading-tight">{nodeDef.label}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{nodeDef.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center font-mono">
          Drag nodes onto the canvas
        </p>
      </div>
    </div>
  );
};
