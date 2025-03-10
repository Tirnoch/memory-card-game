import { useEffect, useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import shuffle from './components/shuffle';
import Card from './components/Card';
import {
  fetchPokemonData,
  getCardCountByDifficulty,
} from './components/fetchAPI';
import GameOverModal from './components/GameOverModal';
import soundManager from './components/SoundManager';
import SoundToggle from './components/SoundToggle';

// Add a top-level lock variable outside of React state for immediate effect
let GAME_LOCKED = false;

export default function App() {
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  const [game, setGame] = useState({
    clickedCards: [],
    currentScore: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    gameBoard: [],
    lastClickResult: null, // Track the result of the last click (success, error, null)
    isLoading: true,
    difficultyLevel: localStorage.getItem('difficultyLevel') || 'medium',
    showGameOver: false,
    gameResult: null, // 'win' or 'lose',
    soundsLoaded: false, // Track if Pokemon sounds are loaded
    pendingDifficulty: null, // Store pending difficulty change from game over screen
    isGameLocked: false, // Prevent interaction during game over sequence
    transitionLock: false, // Additional lock for the transition period
    finalScore: 0, // Store the final score when game ends for display in game over modal
  });

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset GAME_LOCKED when component unmounts
  useEffect(() => {
    // Reset GAME_LOCKED on mount
    GAME_LOCKED = false;

    return () => {
      GAME_LOCKED = false;
    };
  }, []);

  // Fetch Pokemon data on initial component mount or when difficulty changes
  useEffect(() => {
    const loadPokemonData = async () => {
      if (!isMounted.current) return;

      try {
        setGame((prev) => ({
          ...prev,
          isLoading: true,
          soundsLoaded: false,
        }));

        const pokemonData = await fetchPokemonData(game.difficultyLevel);

        // Start preloading Pokemon sounds
        soundManager.preloadPokemonSounds(pokemonData);

        if (isMounted.current) {
          setGame((prev) => ({
            ...prev,
            gameBoard: shuffle([...pokemonData]),
            isLoading: false,
            soundsLoaded: true,
          }));
        }
      } catch (error) {
        console.error('Failed to load Pokemon data:', error);
        if (isMounted.current) {
          setGame((prev) => ({
            ...prev,
            isLoading: false,
            soundsLoaded: true,
          }));
        }
      }
    };

    loadPokemonData();
  }, [game.difficultyLevel]);

  // Apply pending difficulty change when starting a new game
  useEffect(() => {
    if (game.pendingDifficulty && !game.showGameOver) {
      setGame((prev) => ({
        ...prev,
        difficultyLevel: prev.pendingDifficulty,
        pendingDifficulty: null,
      }));
    }
  }, [game.pendingDifficulty, game.showGameOver]);

  // Reset game lock when game over modal is closed
  useEffect(() => {
    if (!game.showGameOver && game.isGameLocked) {
      // Also reset the global lock
      GAME_LOCKED = false;

      setGame((prev) => ({
        ...prev,
        isGameLocked: false,
        transitionLock: false,
      }));
    }
  }, [game.showGameOver, game.isGameLocked]);

  // Save high score and difficulty to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('highScore', game.highScore.toString());
    localStorage.setItem('difficultyLevel', game.difficultyLevel);
  }, [game.highScore, game.difficultyLevel]);

  // Reset feedback after a short delay - make error feedback shorter
  useEffect(() => {
    if (game.lastClickResult) {
      const timer = setTimeout(
        () => {
          // Don't reset visual feedback during transition to game over
          if (!game.transitionLock && isMounted.current) {
            setGame((prev) => ({
              ...prev,
              lastClickResult: null,
            }));
          }
        },
        game.lastClickResult === 'error' ? 400 : 700
      ); // Shorter time for error feedback

      return () => clearTimeout(timer);
    }
  }, [game.lastClickResult, game.transitionLock]);

  // Check for win condition
  useEffect(() => {
    const cardCount = getCardCountByDifficulty(game.difficultyLevel);

    // If player has clicked all cards without duplicates, they win
    if (game.currentScore === cardCount) {
      // Set global lock
      GAME_LOCKED = true;

      soundManager.play('win');
      setGame((prev) => ({
        ...prev,
        showGameOver: true,
        gameResult: 'win',
        isGameLocked: true, // Lock game on win
        transitionLock: true,
        finalScore: prev.currentScore, // Store the final score
      }));
    }
  }, [game.currentScore, game.difficultyLevel]);

  // Handle difficulty change during active gameplay (from header)
  const handleDifficultyChange = useCallback(
    (newDifficulty) => {
      // Check global lock first
      if (GAME_LOCKED) return;

      if (
        newDifficulty !== game.difficultyLevel &&
        !game.isGameLocked &&
        !game.transitionLock
      ) {
        soundManager.play('click');
        setGame((prev) => ({
          ...prev,
          difficultyLevel: newDifficulty,
          clickedCards: [],
          currentScore: 0,
          showGameOver: false,
        }));
      }
    },
    [game.difficultyLevel, game.isGameLocked, game.transitionLock]
  );

  // Handle difficulty change in game over modal (just stores the selection)
  const handleGameOverDifficultyChange = useCallback((newDifficulty) => {
    // Always play click sound and update pendingDifficulty, even if same as current
    soundManager.play('click');
    setGame((prev) => ({
      ...prev,
      pendingDifficulty: newDifficulty,
    }));
  }, []);

  // Start a new game by fetching new Pokemon
  const startNewGame = useCallback(async () => {
    soundManager.play('click');

    // Reset global lock
    GAME_LOCKED = false;

    // First, apply any pending difficulty change
    const effectiveDifficulty = game.pendingDifficulty || game.difficultyLevel;

    try {
      setGame((prev) => ({
        ...prev,
        isLoading: true,
        clickedCards: [],
        currentScore: 0,
        showGameOver: false,
        soundsLoaded: false,
        difficultyLevel: effectiveDifficulty,
        pendingDifficulty: null,
        isGameLocked: false, // Ensure game is unlocked when starting a new game
        transitionLock: false,
        finalScore: 0,
      }));

      const newPokemonData = await fetchPokemonData(effectiveDifficulty);

      // Preload sounds for the new Pokemon set
      soundManager.preloadPokemonSounds(newPokemonData);

      if (isMounted.current) {
        setGame((prev) => ({
          ...prev,
          gameBoard: shuffle([...newPokemonData]),
          isLoading: false,
          soundsLoaded: true,
        }));
      }
    } catch (error) {
      console.error('Failed to start new game:', error);
      if (isMounted.current) {
        setGame((prev) => ({
          ...prev,
          isLoading: false,
          soundsLoaded: true,
        }));
      }
    }
  }, [game.pendingDifficulty, game.difficultyLevel]);

  // Play error sounds when a bad click happens (user clicked same card twice)
  const playBadClickSounds = useCallback((pokemonName) => {
    // First play the immediate error sound
    soundManager.play('error', true);

    // Delay the game over state to allow Pokemon sounds to play fully
    const timer1 = setTimeout(() => {
      // Play Pokemon-specific defeat sound
      soundManager.playPokemonSound(pokemonName, true);

      // Further delay the final lose sound to let the Pokemon cry finish
      const timer2 = setTimeout(() => {
        soundManager.play('lose', true);
      }, 800); // Longer delay to ensure we hear the Pokemon sound

      // Cleanup timers if component unmounts
      return () => clearTimeout(timer2);
    }, 200);

    // Cleanup timers if component unmounts
    return () => clearTimeout(timer1);
  }, []);

  // Create a memoized card click handler generator
  const createCardClickHandler = useCallback(
    (index) => {
      return () => {
        // First, check the global lock
        if (GAME_LOCKED) return;

        // Also check React state locks for redundancy
        if (
          game.isGameLocked ||
          game.transitionLock ||
          game.isLoading ||
          !game.soundsLoaded
        ) {
          return;
        }

        soundManager.play('click');

        const updatedArray = [...game.gameBoard];
        const clickedCard = updatedArray[index];
        const updatedClickedCards = [...game.clickedCards];

        // Check if this is a duplicate click (bad click)
        if (
          updatedClickedCards.find((newClick) => newClick.id === clickedCard.id)
        ) {
          // IMMEDIATELY set global lock before ANY other operation
          GAME_LOCKED = true;

          // Save the current score
          const finalScore = game.currentScore;

          // Now update React state - won't impact the global lock which is already applied
          setGame((prev) => ({
            ...prev,
            isGameLocked: true,
            transitionLock: true,
            lastClickResult: 'error',
            finalScore: finalScore, // Store the final score before resetting
          }));

          // Shuffle array for visual feedback
          shuffle(updatedArray);

          // Update the game board display but keep the score for now
          setGame((prev) => ({
            ...prev,
            gameBoard: updatedArray,
            clickedCards: [], // Reset clicked cards but keep score for display
          }));

          // Play the error sounds
          playBadClickSounds(clickedCard.name);

          // Delay showing the game over screen
          const gameOverTimer = setTimeout(() => {
            if (isMounted.current) {
              setGame((prev) => ({
                ...prev,
                currentScore: 0, // Now reset the score after delay
                showGameOver: true,
                gameResult: 'lose',
              }));
            }
          }, 1200);

          // Cleanup timer if component unmounts
          return () => clearTimeout(gameOverTimer);
        } else {
          // Good click - only proceed if not locked
          if (!GAME_LOCKED) {
            clickedCard.clicked = true;
            updatedClickedCards.push(clickedCard);

            // Play the Pokemon's cry sound for successful click
            soundManager.playPokemonSound(clickedCard.name);

            // Shuffle the array
            shuffle(updatedArray);

            // Update state if still not locked
            if (!GAME_LOCKED) {
              setGame((prev) => {
                const newScore = updatedClickedCards.length;
                if (prev.currentScore >= prev.highScore) {
                  return {
                    ...prev,
                    gameBoard: updatedArray,
                    currentScore: newScore,
                    highScore: newScore,
                    clickedCards: [...updatedClickedCards],
                    lastClickResult: 'success',
                  };
                } else {
                  return {
                    ...prev,
                    gameBoard: updatedArray,
                    currentScore: newScore,
                    clickedCards: [...updatedClickedCards],
                    lastClickResult: 'success',
                  };
                }
              });
            }
          }
        }
      };
    },
    [
      game.isGameLocked,
      game.transitionLock,
      game.isLoading,
      game.soundsLoaded,
      game.gameBoard,
      game.clickedCards,
      game.currentScore,
      playBadClickSounds,
    ]
  );

  // Get the appropriate grid classes based on difficulty
  const getGridClasses = useCallback(() => {
    switch (game.difficultyLevel) {
      case 'easy':
        return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4';
      case 'medium':
        return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
      case 'hard':
        return 'grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8';
      default:
        return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
    }
  }, [game.difficultyLevel]);

  // Message for loading state
  const getLoadingMessage = useCallback(() => {
    if (game.isLoading) {
      return 'Loading Pokémon...';
    } else if (!game.soundsLoaded) {
      return 'Preloading sounds...';
    }
    return '';
  }, [game.isLoading, game.soundsLoaded]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Full page overlay that blocks all UI interaction when game is locked */}
      {(GAME_LOCKED || game.isGameLocked) && (
        <div
          className="fixed inset-0 z-[100] bg-black bg-opacity-5"
          style={{
            pointerEvents: 'all',
            cursor: 'not-allowed',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          aria-hidden="true"
        />
      )}

      <Header
        highScore={game.highScore}
        currentScore={game.currentScore}
        difficultyLevel={game.difficultyLevel}
        onChangeDifficulty={handleDifficultyChange}
        isDisabled={GAME_LOCKED || game.isGameLocked || game.transitionLock}
      />

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {game.isLoading || !game.soundsLoaded ? (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-sky-800 font-medium">
              {getLoadingMessage()}
            </p>
          </div>
        ) : (
          <div className="relative w-full flex-1 overflow-hidden">
            {/* Overlay to prevent clicks during transition */}
            {(game.transitionLock || GAME_LOCKED) && !game.showGameOver && (
              <div
                className="absolute inset-0 z-50 bg-black bg-opacity-20 flex items-center justify-center"
                style={{
                  pointerEvents: 'all',
                  cursor: 'not-allowed',
                  touchAction: 'none',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
              >
                <div className="text-white text-xl font-bold shadow-xl px-4 py-2 rounded-lg bg-black bg-opacity-50">
                  Game Over
                </div>
              </div>
            )}

            <div
              id="gameBoard"
              className={`flex-1 grid ${getGridClasses()} gap-2 sm:gap-3 auto-rows-min p-1 sm:p-2 justify-items-center content-center mx-auto w-full max-w-full h-full ${
                GAME_LOCKED ? 'pointer-events-none' : ''
              }`}
              style={{ minHeight: '0', maxHeight: 'calc(100vh - 60px)' }}
            >
              {game.gameBoard.map((card, index) => (
                <Card
                  key={card.id}
                  url={card.url}
                  name={card.name}
                  id={card.id}
                  handleClick={createCardClickHandler(index)}
                  feedbackStatus={game.lastClickResult}
                  isDisabled={
                    GAME_LOCKED || game.isGameLocked || game.transitionLock
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <GameOverModal
        isVisible={game.showGameOver}
        score={game.finalScore} // Use finalScore instead of currentScore
        maxScore={game.highScore}
        result={game.gameResult}
        onPlayAgain={startNewGame}
        onChangeDifficulty={handleGameOverDifficultyChange}
        currentDifficulty={game.pendingDifficulty || game.difficultyLevel}
      />

      <SoundToggle
        isDisabled={GAME_LOCKED || game.isGameLocked || game.transitionLock}
      />
    </div>
  );
}
