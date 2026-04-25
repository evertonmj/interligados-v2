import { memo, useEffect, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

interface WordFlowNodeData extends Record<string, unknown> {
  label: string;
  revealed: boolean;
  animateIn?: boolean;
}

type WordFlowNodeType = Node<WordFlowNodeData, 'wordNode'>;

function WordFlowNodeComponent({ data }: NodeProps<WordFlowNodeType>) {
  const [entered, setEntered] = useState(!data.animateIn);

  useEffect(() => {
    if (!data.animateIn) {
      setEntered(true);
      return;
    }

    setEntered(false);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [data.animateIn, data.label]);

  return (
    <div
      className={`min-w-[104px] max-w-[180px] rounded-full border px-4 py-3 text-center text-base font-medium shadow-sm transition-all duration-300 ${
        data.revealed
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-slate-200 bg-slate-200 text-slate-900'
      } ${entered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="!h-2 !w-2 !border-0 !bg-transparent !opacity-0"
      />
      <span className="block whitespace-nowrap font-bold">{data.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className="!h-2 !w-2 !border-0 !bg-transparent !opacity-0"
      />
    </div>
  );
}

export const WordFlowNode = memo(WordFlowNodeComponent);
export type { WordFlowNodeData, WordFlowNodeType };
