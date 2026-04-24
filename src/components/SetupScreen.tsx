import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronsUpDown,
  SlidersHorizontal,
  Sparkles,
  Boxes,
  Cpu,
  Network,
} from 'lucide-react';
import { listThemeOptions } from '../data/constellations';
import type { GameConfig, GameMode } from '../types';

interface SetupScreenProps {
  onStart: (seedWord: string, maxRelations: number, config: GameConfig) => void;
  isLoading: boolean;
  error?: string;
}

const modeMeta: Record<
  GameMode,
  { label: string; description: string; icon: typeof Boxes; accent: string }
> = {
  offline: {
    label: 'Offline',
    description: 'Constelações prontas',
    icon: Boxes,
    accent: 'text-slate-700',
  },
  gemini: {
    label: 'Gemini',
    description: 'Google Gemini API',
    icon: Sparkles,
    accent: 'text-blue-600',
  },
  ollama: {
    label: 'Ollama',
    description: 'Modelo local',
    icon: Cpu,
    accent: 'text-orange-600',
  },
};

export function SetupScreen({ onStart, isLoading, error }: SetupScreenProps) {
  const [seedWord, setSeedWord] = useState('');
  const [maxRelations, setMaxRelations] = useState(20);
  const [gameMode, setGameMode] = useState<GameMode>('offline');
  const [geminiKey, setGeminiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('mistral');

  const themes = listThemeOptions();
  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.theme === seedWord),
    [seedWord, themes],
  );
  const currentMode = modeMeta[gameMode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedWord.trim()) return;

    const config: GameConfig = {
      mode: gameMode,
    };

    if (gameMode === 'gemini' && geminiKey.trim()) {
      config.geminiKey = geminiKey.trim();
    }

    if (gameMode === 'ollama') {
      config.ollamaUrl = ollamaUrl.trim() || 'http://localhost:11434';
      config.ollamaModel = ollamaModel.trim() || 'mistral';
    }

    onStart(seedWord.trim(), maxRelations, config);
  };

  const isFormValid = () => {
    if (!seedWord.trim()) return false;
    if (gameMode === 'gemini' && !geminiKey.trim()) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Network size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Interligado Livre</h1>
            <p className="text-sm text-slate-300">Escolha um tema para começar.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Temas</div>
                <div className="text-sm text-slate-500">A seleção do tema fica como ação principal.</div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {currentMode.label}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <button
                  key={theme.theme}
                  type="button"
                  onClick={() => {
                    setSeedWord(theme.theme);
                    // Start game immediately
                    const config: GameConfig = { mode: gameMode };
                    if (gameMode === 'gemini' && geminiKey.trim()) config.geminiKey = geminiKey.trim();
                    if (gameMode === 'ollama') {
                      config.ollamaUrl = ollamaUrl.trim() || 'http://localhost:11434';
                      config.ollamaModel = ollamaModel.trim() || 'mistral';
                    }
                    onStart(theme.theme, maxRelations, config);
                  }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    seedWord === theme.theme
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-1 text-sm font-semibold text-slate-900">{theme.theme}</div>
                  <div className="mb-3 text-sm leading-relaxed text-slate-500">{theme.description}</div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{theme.seedWord}</span>
                    <span>{theme.totalWords} palavras</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label htmlFor="seedWord" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tema selecionado
              </label>
              <input
                type="text"
                id="seedWord"
                required
                value={seedWord}
                onChange={(e) => setSeedWord(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Digite um tema ou escolha um card acima"
              />
              {selectedTheme && (
                <div className="mt-2 text-xs text-slate-500">
                  {selectedTheme.description}
                </div>
              )}
            </div>
          </section>

          <details className="rounded-2xl border border-slate-800 bg-slate-900 text-slate-100">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden md:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <currentMode.icon size={18} className={currentMode.accent} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Modo de geração</div>
                  <div className="text-xs text-slate-400">{currentMode.description}</div>
                </div>
              </div>
              <ChevronsUpDown size={18} className="text-slate-400" />
            </summary>

            <div className="border-t border-slate-800 px-4 py-4 md:px-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(Object.keys(modeMeta) as GameMode[]).map((mode) => {
                  const meta = modeMeta[mode];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setGameMode(mode)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        gameMode === mode
                          ? 'border-blue-500 bg-blue-50 text-slate-900'
                          : 'border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-600'
                      }`}
                    >
                      <Icon size={18} className={`mb-2 ${meta.accent}`} />
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className={`mt-1 text-xs ${gameMode === mode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {meta.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {gameMode === 'gemini' && (
                <div className="mt-4 rounded-xl border border-blue-900/40 bg-blue-950/30 p-4">
                  <label htmlFor="geminiKey" className="mb-2 block text-sm font-medium text-slate-100">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    id="geminiKey"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full rounded-xl border border-blue-900/50 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-950"
                    placeholder="Cole sua API Key do Google Gemini"
                  />
                </div>
              )}

              {gameMode === 'ollama' && (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label htmlFor="ollamaUrl" className="mb-2 block text-sm font-medium text-slate-100">
                      URL do Ollama
                    </label>
                    <input
                      type="text"
                      id="ollamaUrl"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-950"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div>
                    <label htmlFor="ollamaModel" className="mb-2 block text-sm font-medium text-slate-100">
                      Modelo
                    </label>
                    <input
                      type="text"
                      id="ollamaModel"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-950"
                      placeholder="mistral"
                    />
                  </div>
                </div>
              )}
            </div>
          </details>

          <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden md:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <SlidersHorizontal size={18} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Opções avançadas</div>
                  <div className="text-xs text-slate-500">Quantidade de palavras e ajustes da partida.</div>
                </div>
              </div>
              <ChevronsUpDown size={18} className="text-slate-400" />
            </summary>

            <div className="border-t border-slate-200 px-4 py-4 md:px-5">
              <label htmlFor="maxRelations" className="mb-3 block text-sm font-medium text-slate-700">
                Quantidade de Palavras ({maxRelations})
              </label>
              <input
                type="range"
                id="maxRelations"
                min="10"
                max="50"
                step="5"
                value={maxRelations}
                onChange={(e) => setMaxRelations(Number(e.target.value))}
                className="w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>10</span>
                <span>50</span>
              </div>
            </div>
          </details>

          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Gerando conexões...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ArrowRight size={18} />
                Iniciar
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
