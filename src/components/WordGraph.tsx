// ...existing code...

import { D3WordGraph } from './D3WordGraph';


interface WordGraphProps {
  gameState: any;
}

// ...existing code...

export function WordGraph({ gameState }: WordGraphProps) {
  return (
    <div className="h-full w-full overflow-hidden flex items-center justify-center bg-white rounded-3xl border-2 border-slate-100 shadow-inner">
      <D3WordGraph gameState={gameState} />
    </div>
  );
}
