import { useEffect, useState, useRef } from 'react';
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
  const handleDifficultyChange = (newDifficulty) => {
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
  };

  // Handle difficulty change in game over modal (just stores the selection)
  const handleGameOverDifficultyChange = (newDifficulty) => {
    // Always play click sound and update pendingDifficulty, even if same as current
    soundManager.play('click');
    setGame((prev) => ({
      ...prev,
      pendingDifficulty: newDifficulty,
    }));
  };

  // Start a new game by fetching new Pokemon
  const startNewGame = async () => {
    soundManager.play('click');

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
  };

  // Create a locking wrapper for any game function to prevent execution during lock
  const withLockCheck = (fn) => {
    return (...args) => {
      if (
        game.isGameLocked ||
        game.transitionLock ||
        game.isLoading ||
        !game.soundsLoaded
      ) {
        return; // Block execution if game is locked
      }
      return fn(...args);
    };
  };

  // Play error sounds when a bad click happens (user clicked same card twice)
  const playBadClickSounds = (pokemonName) => {
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
  };

  // Handle card clicks with lock protection
  const handleClick = withLockCheck((index) => {
    // Safety check - if already locked, don't proceed
    if (game.isGameLocked || game.transitionLock) return;

    soundManager.play('click');

    const updatedArray = [...game.gameBoard];
    const clickedCard = updatedArray[index];
    const updatedClickedCards = [...game.clickedCards];

    // Check if this is a duplicate click (bad click)
    if (
      updatedClickedCards.find((newClick) => newClick.id === clickedCard.id)
    ) {
      // Save the current score before resetting it
      const finalScore = game.currentScore;

      // IMMEDIATELY lock the game to prevent any further interaction
      // This must be done synchronously before any async operations
      setGame((prev) => ({
        ...prev,
        isGameLocked: true,
        transitionLock: true,
        lastClickResult: 'error',
        finalScore: finalScore, // Store the final score before resetting
      }));

      // After locking the game, play sounds and show visual feedback
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

      // Delay showing the game over screen to give time for sounds to play
      const gameOverTimer = setTimeout(() => {
        if (isMounted.current) {
          setGame((prev) => ({
            ...prev,
            currentScore: 0, // Now reset the score after delay
            showGameOver: true,
            gameResult: 'lose',
          }));
        }
      }, 1200); // Delay showing game over screen until after sounds

      // Cleanup timer if component unmounts
      return () => clearTimeout(gameOverTimer);
    } else {
      // Good click - selecting a new card
      clickedCard.clicked = true;
      updatedClickedCards.push(clickedCard);

      // Play the Pokemon's cry sound for successful click
      soundManager.playPokemonSound(clickedCard.name);

      // Shuffle the array
      shuffle(updatedArray);

      // Update state
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
  });

  // Get the appropriate grid classes based on difficulty
  const getGridClasses = () => {
    switch (game.difficultyLevel) {
      case 'easy':
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4';
      case 'medium':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
      case 'hard':
        return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
    }
  };

  // Message for loading state
  const getLoadingMessage = () => {
    if (game.isLoading) {
      return 'Loading Pokémon...';
    } else if (!game.soundsLoaded) {
      return 'Preloading sounds...';
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header
        highScore={game.highScore}
        currentScore={game.currentScore}
        difficultyLevel={game.difficultyLevel}
        onChangeDifficulty={handleDifficultyChange}
        isDisabled={game.isGameLocked || game.transitionLock}
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
          <div className="relative w-full flex-1">
            {/* Overlay to prevent clicks during transition */}
            {game.transitionLock && !game.showGameOver && (
              <div className="absolute inset-0 z-10 bg-black bg-opacity-20 flex items-center justify-center pointer-events-auto">
                <div className="text-white text-xl font-bold shadow-xl px-4 py-2 rounded-lg bg-black bg-opacity-50">
                  Game Over
                </div>
              </div>
            )}

            <div
              id="gameBoard"
              className={`flex-1 grid ${getGridClasses()} gap-3 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-10 justify-items-center content-start mx-auto w-full max-w-7xl`}
            >
              {game.gameBoard.map((card, index) => (
                <Card
                  key={card.id}
                  url={card.url}
                  name={card.name}
                  id={card.id}
                  handleClick={() => handleClick(index)}
                  feedbackStatus={game.lastClickResult}
                  isDisabled={game.isGameLocked || game.transitionLock}
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

      <SoundToggle />
    </div>
  );
}
