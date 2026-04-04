import React from 'react';
import { Position } from '../workflow/types';

interface Props {
  from: Position;
  to: Position;
}

export const ConnectionLine: React.FC<Props> = ({ from, to }) => {
  const dx = Math.abs(to.x - from.x) * 0.5;
  const d = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;

  return (
    <path
      d={d}
      fill="none"
      stroke="hsl(200, 95%, 55%)"
      strokeWidth={2}
      strokeDasharray="6 4"
      opacity={0.7}
    />
  );
};
