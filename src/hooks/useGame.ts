import { useState, useCallback, useMemo } from 'react';
import type { GameState, WordNode, GameConfig } from '../types';
import { generateWordGraph } from '../services/aiService';
import { normalizeWord } from '../lib/utils';

export function useGame() {
  const [state, setState] = useState<GameState>({
    seedWord: '',
    maxRelations: 30,
    nodes: {},
    visibleNodes: [],
    hintsRemaining: 11,
    status: 'setup',
  });

  const startGame = useCallback(async (seedWord: string, maxRelations: number, config?: GameConfig) => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));

    try {
      const data = await generateWordGraph(seedWord, maxRelations, config);
      
      const nodesMap: Record<string, WordNode> = {};
      
      // Ensure seedword is normalized as the first node if the AI didn't exactly match
      let seedNodeId = data.nodes[0]?.id;

      // Map raw data to our node structure and ensure connections are bidirectional
      data.nodes.forEach(rawNode => {
        if (!nodesMap[rawNode.id]) {
          nodesMap[rawNode.id] = {
            id: rawNode.id,
            word: rawNode.word,
            revealed: false,
            connections: [],
            hintedLetterIndexes: [],
          };
        } else {
           nodesMap[rawNode.id].word = rawNode.word; // Update word just in case
        }

        rawNode.connections.forEach(connId => {
          // Initialize connected node if it doesn't exist yet
          if (!nodesMap[connId]) {
            nodesMap[connId] = {
              id: connId,
              word: connId,
              revealed: false,
              connections: [],
              hintedLetterIndexes: [],
            };
          }
          
          // Add connection from current node to connId
          if (!nodesMap[rawNode.id].connections.includes(connId)) {
            nodesMap[rawNode.id].connections.push(connId);
          }
          
          // Add connection from connId back to current node (bidirectional)
          if (!nodesMap[connId].connections.includes(rawNode.id)) {
            nodesMap[connId].connections.push(rawNode.id);
          }
        });
      });

      // Find the actual seed node to reveal it initially. 
      // It should be the one closest to seedWord, or just the first node.
      const normalizedSeedInput = normalizeWord(seedWord);
      const foundSeedNode = Object.values(nodesMap).find(n => normalizeWord(n.word) === normalizedSeedInput);
      if (foundSeedNode) {
        seedNodeId = foundSeedNode.id;
      }

      if (!seedNodeId || !nodesMap[seedNodeId]) {
        throw new Error("Grafo gerado é inválido. Tente novamente.");
      }

      nodesMap[seedNodeId].revealed = true;

      // Visible nodes initially are the seed and its direct connections
      const initialVisibleNodes = [seedNodeId, ...nodesMap[seedNodeId].connections];

      setState({
        seedWord,
        maxRelations,
        nodes: nodesMap,
        visibleNodes: initialVisibleNodes,
        hintsRemaining: 11,
        status: 'playing',
        config,
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'setup',
        error: error.message || "Erro desconhecido ao iniciar o jogo."
      }));
    }
  }, []);

  const guessWord = useCallback((guess: string): boolean => {
    const normalizedGuess = normalizeWord(guess);
    let foundMatch = false;

    setState(prev => {
      const newState = { ...prev, nodes: { ...prev.nodes } };
      let newlyRevealedNodeId: string | null = null;

      // Find if guess matches any VISIBLE but UNREVEALED node

      for (const nodeId of prev.visibleNodes) {
        const node = newState.nodes[nodeId];
        if (!node.revealed && normalizeWord(node.word) === normalizedGuess) {
          newState.nodes[nodeId] = {
            ...node,
            revealed: true,
            hintedLetterIndexes: [],
          };
          newlyRevealedNodeId = nodeId;
          foundMatch = true;
          break; // only reveal one at a time if there happen to be duplicates
        }
      }

      if (!foundMatch || !newlyRevealedNodeId) {
        return prev; // No changes
      }

      // If we revealed a node, we need to add its connections to visibleNodes
      const newVisibleNodes = new Set(prev.visibleNodes);
      newState.nodes[newlyRevealedNodeId].connections.forEach(connId => {
        if (newState.nodes[connId]) {
            newVisibleNodes.add(connId);
        }
      });

      // Check win condition: are all nodes in the map revealed?
      // Or maybe check if all generated nodes are revealed
      const totalNodes = Object.keys(newState.nodes).length;
      const revealedNodesCount = Object.values(newState.nodes).filter(n => n.revealed).length;
      
      const newStatus = revealedNodesCount >= totalNodes ? 'won' : 'playing';

      return {
        ...newState,
        visibleNodes: Array.from(newVisibleNodes),
        status: newStatus,
        hintsRemaining: 11, // Resetar dicas a cada palavra revelada
      };
    });

    return foundMatch;
  }, []);

  const revealHintLetter = useCallback((): boolean => {
    let usedHint = false;

    setState(prev => {
      if (prev.status !== 'playing' || prev.hintsRemaining <= 0) {
        return prev;
      }


      const candidateNodes = prev.visibleNodes
        .map(nodeId => prev.nodes[nodeId])
        .filter((node): node is WordNode => Boolean(node && !node.revealed))
        .map((node) => {
          // Conta apenas letras (não espaço/hífen)
          const allLetterIndexes = Array.from(node.word)
            .map((char, index) => ({ char, index }))
            .filter(({ char }) => /\p{L}/u.test(char) && char !== ' ' && char !== '-')
            .map(({ index }) => index);

          const availableIndexes = allLetterIndexes.filter(index => !node.hintedLetterIndexes.includes(index));

          // Se só falta uma letra, não permitir dica
          if (availableIndexes.length <= 1) {
            return { node, availableIndexes: [] };
          }

          return { node, availableIndexes };
        })
        .filter(({ availableIndexes }) => availableIndexes.length > 0);

      if (candidateNodes.length === 0) {
        return prev;
      }

      const selectedNode =
        candidateNodes.reduce((best, current) =>
          current.availableIndexes.length > best.availableIndexes.length ? current : best,
        );
      const revealedIndex =
        selectedNode.availableIndexes[Math.floor(Math.random() * selectedNode.availableIndexes.length)];

      const updatedNode: WordNode = {
        ...selectedNode.node,
        hintedLetterIndexes: [...selectedNode.node.hintedLetterIndexes, revealedIndex].sort((a, b) => a - b),
      };

      usedHint = true;

      return {
        ...prev,
        hintsRemaining: prev.hintsRemaining - 1,
        nodes: {
          ...prev.nodes,
          [updatedNode.id]: updatedNode,
        },
      };
    });

    return usedHint;
  }, []);

  const resetGame = useCallback(() => {
    setState({
      seedWord: '',
      maxRelations: 30,
      nodes: {},
      visibleNodes: [],
      hintsRemaining: 11,
      status: 'setup',
      config: undefined,
    });
  }, []);

  const progress = useMemo(() => {
      const total = Object.keys(state.nodes).length;
      const revealed = Object.values(state.nodes).filter(n => n.revealed).length;
      return { total, revealed };
  }, [state.nodes]);

  return {
    state,
    startGame,
    guessWord,
    revealHintLetter,
    resetGame,
    progress
  };
}
