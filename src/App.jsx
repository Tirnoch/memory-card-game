import { useEffect, useState } from 'react';
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
  });

  // Preload sound effects when component mounts
  useEffect(() => {
    soundManager.preload();
  }, []);

  // Fetch Pokemon data on initial component mount or when difficulty changes
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setGame((prev) => ({
          ...prev,
          isLoading: true,
          soundsLoaded: false,
        }));

        const pokemonData = await fetchPokemonData(game.difficultyLevel);

        // Start preloading Pokemon sounds
        soundManager.preloadPokemonSounds(pokemonData);

        setGame((prev) => ({
          ...prev,
          gameBoard: shuffle([...pokemonData]),
          isLoading: false,
          soundsLoaded: true,
        }));
      } catch (error) {
        console.error('Failed to load Pokemon data:', error);
        setGame((prev) => ({
          ...prev,
          isLoading: false,
          soundsLoaded: true,
        }));
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
          setGame((prev) => ({
            ...prev,
            lastClickResult: null,
          }));
        },
        game.lastClickResult === 'error' ? 400 : 700
      ); // Shorter time for error feedback

      return () => clearTimeout(timer);
    }
  }, [game.lastClickResult]);

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
      }));
    }
  }, [game.currentScore, game.difficultyLevel]);

  // Handle difficulty change during active gameplay (from header)
  const handleDifficultyChange = (newDifficulty) => {
    if (newDifficulty !== game.difficultyLevel) {
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
      }));

      const newPokemonData = await fetchPokemonData(effectiveDifficulty);

      // Preload sounds for the new Pokemon set
      soundManager.preloadPokemonSounds(newPokemonData);

      setGame((prev) => ({
        ...prev,
        gameBoard: shuffle([...newPokemonData]),
        isLoading: false,
        soundsLoaded: true,
      }));
    } catch (error) {
      console.error('Failed to start new game:', error);
      setGame((prev) => ({
        ...prev,
        isLoading: false,
        soundsLoaded: true,
      }));
    }
  };

  // Play error sounds when a bad click happens (user clicked same card twice)
  const playBadClickSounds = (pokemonName) => {
    // First play the immediate error sound
    soundManager.play('error', true);

    // Delay the game over state to allow Pokemon sounds to play fully
    setTimeout(() => {
      // Play Pokemon-specific defeat sound
      soundManager.playPokemonSound(pokemonName, true);

      // Further delay the final lose sound to let the Pokemon cry finish
      setTimeout(() => {
        soundManager.play('lose', true);
      }, 800); // Longer delay to ensure we hear the Pokemon sound
    }, 200);
  };

  const handleClick = (index) => {
    soundManager.play('click');

    const updatedArray = [...game.gameBoard];
    const clickedCard = updatedArray[index];
    const updatedClickedCards = [...game.clickedCards];

    // Check if this is a duplicate click (bad click)
    if (
      updatedClickedCards.find((newClick) => newClick.id === clickedCard.id)
    ) {
      // Play error sounds BEFORE updating state
      playBadClickSounds(clickedCard.name);

      // Shuffle the array
      shuffle(updatedArray);

      // First update the visuals for error feedback
      setGame((prev) => ({
        ...prev,
        gameBoard: updatedArray,
        currentScore: 0,
        clickedCards: [],
        lastClickResult: 'error',
      }));

      // Delay showing the game over screen to give time for sounds to play
      setTimeout(() => {
        setGame((prev) => ({
          ...prev,
          showGameOver: true,
          gameResult: 'lose',
        }));
      }, 1200); // Delay showing game over screen until after sounds
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
        if (prev.currentScore >= prev.highScore) {
          return {
            ...prev,
            gameBoard: updatedArray,
            currentScore: updatedClickedCards.length,
            highScore: updatedClickedCards.length,
            clickedCards: [...updatedClickedCards],
            lastClickResult: 'success',
          };
        } else {
          return {
            ...prev,
            gameBoard: updatedArray,
            currentScore: updatedClickedCards.length,
            clickedCards: [...updatedClickedCards],
            lastClickResult: 'success',
          };
        }
      });
    }
  };

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        highScore={game.highScore}
        currentScore={game.currentScore}
        difficultyLevel={game.difficultyLevel}
        onChangeDifficulty={handleDifficultyChange}
      />

      <div className="flex-1 flex flex-col items-center justify-center">
        {game.isLoading || !game.soundsLoaded ? (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-sky-800 font-medium">
              {getLoadingMessage()}
            </p>
          </div>
        ) : (
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
              />
            ))}
          </div>
        )}
      </div>

      <GameOverModal
        isVisible={game.showGameOver}
        score={game.currentScore}
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
