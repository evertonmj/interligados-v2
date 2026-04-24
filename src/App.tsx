import { useGame } from './hooks/useGame';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import type { GameConfig } from './types';

function App() {
  const { state, startGame, guessWord, revealHintLetter, resetGame, progress } = useGame();

  const handleStart = (seedWord: string, maxRelations: number, config: GameConfig) => {
    startGame(seedWord, maxRelations, config);
  };

  if (state.status === 'setup' || state.status === 'loading') {
    return (
      <SetupScreen 
        onStart={handleStart} 
        isLoading={state.status === 'loading'} 
        error={state.error}
      />
    );
  }

  return (
    <GameScreen 
      state={state} 
      progress={progress} 
      onGuess={guessWord} 
      onUseHint={revealHintLetter}
      onRestart={resetGame} 
    />
  );
}

export default App;
