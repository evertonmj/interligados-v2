import React, { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types';
import { cn, normalizeWord } from '../lib/utils';
import { Send, Trophy, RefreshCw, Network, Sparkles } from 'lucide-react';
import { WordGraph } from './WordGraph';

interface GameScreenProps {
  state: GameState;
  progress: { total: number; revealed: number };
  onGuess: (word: string) => boolean;
  onUseHint: () => boolean;
  onRestart: () => void;
}

export function GameScreen({ state, progress, onGuess, onUseHint, onRestart }: GameScreenProps) {
  const [guess, setGuess] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [hintPulse, setHintPulse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;

    const success = onGuess(guess);
    if (success) {
      setGuess('');
      setIsWrong(false);
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 400); // Remove shake class after animation
    }
  };

  const handleGuessChange = (value: string) => {
    setGuess(value);

    const normalizedValue = normalizeWord(value);
    if (!normalizedValue || state.status !== 'playing') {
      return;
    }

    const hasExactVisibleMatch = state.visibleNodes.some((nodeId) => {
      const node = state.nodes[nodeId];
      return node && !node.revealed && normalizeWord(node.word) === normalizedValue;
    });

    if (!hasExactVisibleMatch) {
      return;
    }

    const success = onGuess(value);
    if (success) {
      setGuess('');
      setIsWrong(false);
    }
  };

  const handleUseHint = () => {
    const success = onUseHint();
    if (success) {
      setHintPulse(true);
      setTimeout(() => setHintPulse(false), 250);
      inputRef.current?.focus();
    }
  };

  const isWon = state.status === 'won';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 font-bold text-xl text-primary">
               <Network size={22} className="text-primary" />
               <span>Interligado AI</span>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
               Semente: <span className="font-bold text-slate-800">{state.seedWord}</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUseHint}
              disabled={isWon || state.hintsRemaining <= 0}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                isWon || state.hintsRemaining <= 0
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
                hintPulse && "scale-95"
              )}
              title="Revelar uma letra de uma palavra ainda oculta"
            >
              <Sparkles size={16} />
              <span>Dica</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold">
                {state.hintsRemaining}/11
              </span>
            </button>
            <div className="text-sm font-medium text-slate-600">
              Progresso: <span className="text-primary font-bold">{progress.revealed}</span> / {progress.total}
            </div>
            <button 
              onClick={onRestart}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
              title="Recomeçar"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 overflow-y-auto p-0 md:p-0">
        <div className="max-w-full mx-auto h-full flex flex-col justify-center items-center">
          {isWon && (
            <div className="mb-4 p-6 bg-green-50 border border-green-200 rounded-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 z-20">
              <Trophy className="text-green-500 w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Parabéns!</h2>
              <p className="text-green-600">Você descobriu todas as {progress.total} palavras conectadas a "{state.seedWord}".</p>
              <button 
                onClick={onRestart}
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Jogar Novamente
              </button>
            </div>
          )}

          {/* Word Board (Graph) - maximize area */}
          <div className="w-full h-[calc(100vh-180px)] md:h-[calc(100vh-180px)] flex items-center justify-center">
            <WordGraph gameState={state} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => handleGuessChange(e.target.value)}
              disabled={isWon}
              placeholder={isWon ? "Jogo finalizado!" : "Digite uma palavra..."}
              className={cn(
                "w-full pl-6 pr-14 py-4 text-lg bg-slate-50 border-2 rounded-2xl outline-none transition-all",
                isWrong ? "border-red-400 bg-red-50 animate-shake text-red-900" : "border-slate-200 focus:border-primary focus:bg-white",
                isWon && "opacity-50 cursor-not-allowed"
              )}
            />
            <button
              type="submit"
              disabled={isWon || !guess.trim()}
              className="absolute right-2 p-3 text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
