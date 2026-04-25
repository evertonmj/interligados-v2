import { render, act } from '@testing-library/react';
import { useGame } from './useGame';
import * as aiService from '../services/aiService';
import { useRef } from 'react';
import { describe, it, expect } from 'vitest';

function TestComponent({ action }: { action: (api: ReturnType<typeof useGame>) => void }) {
  const called = useRef(false);
  const api = useGame();
  if (!called.current) {
    action(api);
    called.current = true;
  }
  return null;
}

describe('useGame', () => {
  beforeAll(() => {
    vi.spyOn(aiService, 'generateWordGraph').mockImplementation(async (seedWord: string) => {
      if (seedWord === 'casa') {
        return {
          nodes: [
            { id: 'a', word: 'casa', connections: ['b'] },
            { id: 'b', word: 'carro', connections: ['a'] },
          ],
        };
      }
      if (seedWord === 'a b') {
        return {
          nodes: [
            { id: 'a', word: 'a b', connections: ['b'] },
            { id: 'b', word: 'bbb', connections: ['a'] },
          ],
        };
      }
      return { nodes: [] };
    });
  });
  it('starts in setup state', () => {
    let state: ReturnType<typeof useGame>["state"] | undefined = undefined;
    render(<TestComponent action={api => { state = api.state; }} />);
    expect(state?.status).toBe('setup');
  });

  it('resets hints when a word is revealed', async () => {
    let api: ReturnType<typeof useGame> | undefined = undefined;
    render(<TestComponent action={a => { api = a; }} />);
    // Inicia o jogo e aguarda
    await act(async () => {
      await api!.startGame('casa', 2, undefined);
    });
    // Gasta dicas antes de revelar qualquer node
    await act(async () => { api!.revealHintLetter(); });
    await act(async () => { api!.revealHintLetter(); });
    const hintsAfter = api!.state.hintsRemaining;
    expect(hintsAfter).toBe(9);
    // Agora revela um node (carro)
    await act(async () => { api!.guessWord('carro'); });
    expect(api!.state.hintsRemaining).toBe(11);
  });

  it('does not reveal spaces as hints', () => {
    let api: ReturnType<typeof useGame> | undefined = undefined;
    render(<TestComponent action={a => { api = a; }} />);
    // Inicia o jogo com seed que contém espaço e node conectado
    act(() => {
      api!.startGame('a b', 2, undefined);
    });
    // Gasta uma dica enquanto o node 'a b' ainda não está revelado
    act(() => {
      api!.revealHintLetter();
    });
    const node = Object.values(api!.state.nodes).find((n): n is import('./useGame').WordNode => typeof n === 'object' && n !== null && 'word' in n && 'hintedLetterIndexes' in n && n.word === 'a b');
    expect(node).toBeDefined();
    const indexes = node!.hintedLetterIndexes;
    expect(indexes.length).toBe(1);
    const letter = Array.from(node!.word)[indexes[0]];
    expect(letter).not.toBe(' ');
  });
});
