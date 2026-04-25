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

});
