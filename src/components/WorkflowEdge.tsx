import React, { useState } from 'react';
import { WorkflowEdge, Position } from '../workflow/types';

interface Props {
  edge: WorkflowEdge;
  sourcePos: Position;
  targetPos: Position;
  onDelete: () => void;
}

function bezierPath(from: Position, to: Position): string {
  const dx = Math.abs(to.x - from.x) * 0.5;
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
}

export const WorkflowEdgeComponent: React.FC<Props> = ({ edge, sourcePos, targetPos, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const d = bezierPath(sourcePos, targetPos);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Invisible fat hitbox */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} style={{ cursor: 'pointer' }} />
      {/* Visible edge */}
      <path
        d={d}
        fill="none"
        stroke={hovered ? 'hsl(200, 95%, 55%)' : 'hsl(228, 10%, 28%)'}
        strokeWidth={hovered ? 2.5 : 2}
        strokeDasharray={hovered ? 'none' : 'none'}
        style={{ transition: 'stroke 0.15s, stroke-width 0.15s' }}
      />
      {/* Animated dot */}
      <circle r={3} fill="hsl(200, 95%, 55%)" opacity={0.6}>
        <animateMotion dur="3s" repeatCount="indefinite" path={d} />
      </circle>
      {/* Delete button on hover */}
      {hovered && (
        <g
          transform={`translate(${(sourcePos.x + targetPos.x) / 2}, ${(sourcePos.y + targetPos.y) / 2})`}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ cursor: 'pointer' }}
        >
          <circle r={10} fill="hsl(0, 72%, 50%)" />
          <text fill="white" fontSize={12} fontWeight="bold" textAnchor="middle" dominantBaseline="central">×</text>
        </g>
      )}
    </g>
  );
};
