import React from 'react';
import { WorkflowNode, NodeDefinition } from '../workflow/types';
import { categoryColors } from '../workflow/node-definitions';
import * as LucideIcons from 'lucide-react';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const PORT_RADIUS = 6;

interface Props {
  node: WorkflowNode;
  definition?: NodeDefinition;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortMouseDown: (port: string, e: React.MouseEvent) => void;
  onPortMouseUp: (port: string, e: React.MouseEvent) => void;
}

export const WorkflowNodeComponent: React.FC<Props> = ({
  node, definition, isSelected, onMouseDown, onPortMouseDown, onPortMouseUp,
}) => {
  const category = definition?.category || 'action';
  const colors = categoryColors[category];
  const label = node.label || definition?.label || node.type;

  // Get icon component
  const iconName = definition?.icon || 'Circle';
  const IconComponent = (LucideIcons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[iconName];

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'pointer' }}
    >
      {/* Selection glow */}
      {isSelected && (
        <rect
          x={-3} y={-3}
          width={NODE_WIDTH + 6} height={NODE_HEIGHT + 6}
          rx={10} ry={10}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      {/* Node body */}
      <rect
        x={0} y={0}
        width={NODE_WIDTH} height={NODE_HEIGHT}
        rx={8} ry={8}
        fill={colors.bg}
        stroke={isSelected ? colors.accent : 'hsl(228, 10%, 20%)'}
        strokeWidth={1.5}
      />

      {/* Category accent bar */}
      <rect
        x={0} y={0}
        width={4} height={NODE_HEIGHT}
        rx={2} ry={0}
        fill={colors.accent}
      />
      <rect
        x={0} y={0}
        width={8} height={NODE_HEIGHT}
        rx={8} ry={8}
        fill={colors.accent}
        clipPath={`inset(0 ${NODE_WIDTH - 4}px 0 0)`}
      />
      {/* Simpler accent: just a left bar */}
      <line x1={0} y1={8} x2={0} y2={NODE_HEIGHT - 8} stroke={colors.accent} strokeWidth={3} strokeLinecap="round" />

      {/* Icon */}
      <foreignObject x={14} y={(NODE_HEIGHT - 20) / 2} width={20} height={20}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {IconComponent && <IconComponent size={16} color={colors.accent} />}
        </div>
      </foreignObject>

      {/* Label */}
      <text
        x={42}
        y={NODE_HEIGHT / 2 - 4}
        fill="hsl(220, 20%, 90%)"
        fontSize={12}
        fontFamily="var(--font-display)"
        fontWeight={500}
        dominantBaseline="middle"
      >
        {label.length > 14 ? label.slice(0, 14) + '…' : label}
      </text>

      {/* Type subtitle */}
      <text
        x={42}
        y={NODE_HEIGHT / 2 + 12}
        fill="hsl(220, 10%, 45%)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        dominantBaseline="middle"
      >
        {node.type}
      </text>

      {/* Input port (left) */}
      {category !== 'trigger' && (
        <circle
          cx={0} cy={NODE_HEIGHT / 2}
          r={PORT_RADIUS}
          fill="hsl(228, 12%, 14%)"
          stroke="hsl(228, 10%, 30%)"
          strokeWidth={1.5}
          onMouseUp={(e) => onPortMouseUp('input', e as unknown as React.MouseEvent)}
          style={{ cursor: 'crosshair' }}
        >
          <title>Drop connection here</title>
        </circle>
      )}

      {/* Output port (right) */}
      <circle
        cx={NODE_WIDTH} cy={NODE_HEIGHT / 2}
        r={PORT_RADIUS}
        fill="hsl(228, 12%, 14%)"
        stroke="hsl(228, 10%, 30%)"
        strokeWidth={1.5}
        onMouseDown={(e) => onPortMouseDown('output', e as unknown as React.MouseEvent)}
        style={{ cursor: 'crosshair' }}
      >
        <title>Drag to connect</title>
      </circle>
    </g>
  );
};
