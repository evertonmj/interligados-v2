export interface WordNode {
  id: string;
  word: string;
  revealed: boolean;
  connections: string[];
  hintedLetterIndexes: number[];
}

export type GameStatus = 'setup' | 'loading' | 'playing' | 'won';

export type GameMode = 'offline' | 'gemini' | 'ollama';

export interface GameConfig {
  mode: GameMode;
  geminiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
}

export interface GameState {
  seedWord: string;
  maxRelations: number;
  nodes: Record<string, WordNode>;
  visibleNodes: string[]; // Node IDs that should be shown on screen (either revealed or hidden as '?')
  hintsRemaining: number;
  status: GameStatus;
  error?: string;
  config?: GameConfig;
}

export interface GraphDataResponse {
  nodes: {
    id: string;
    word: string;
    connections: string[];
  }[];
}
