import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
} from '@xyflow/react';
import type { GameState } from '../types';
import { WordFlowNode, type WordFlowNodeType } from './WordFlowNode';
import { D3WordGraph } from './D3WordGraph';

interface WordGraphProps {
  gameState: GameState;
}

const nodeTypes = {
  wordNode: WordFlowNode,
};

export function WordGraph({ gameState }: WordGraphProps) {
  return (
    <div className="h-full w-full overflow-auto rounded-3xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
      <D3WordGraph gameState={gameState} />
    </div>
  );
}
