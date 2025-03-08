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
    if (newDifficulty !== game.difficultyLevel) {
      soundManager.play('click');
      // Store the selection as pending, to be applied when the game restarts
      setGame((prev) => ({
        ...prev,
        pendingDifficulty: newDifficulty,
      }));
    }
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

  const handleClick = (index) => {
    soundManager.play('click');

    setGame((prev) => {
      const updatedArray = [...prev.gameBoard];
      const clickedCard = updatedArray[index];
      const updatedClickedCards = [...prev.clickedCards];

      //Game Restart - when clicking the same card twice (bad click)
      if (
        updatedClickedCards.find((newClick) => newClick.id === clickedCard.id)
      ) {
        // Play error sounds - first the Pokemon defeat sound, then the general lose sound
        soundManager.play('error'); // Immediate feedback
        soundManager.playPokemonSound(clickedCard.name, true); // Pokemon defeat sound
        setTimeout(() => soundManager.play('lose'), 500); // Lose sound after delay

        shuffle(updatedArray);

        // Show game over modal with lose result
        return {
          ...prev,
          gameBoard: updatedArray,
          currentScore: 0,
          clickedCards: [],
          lastClickResult: 'error', // Indicate error on duplicate click
          showGameOver: true,
          gameResult: 'lose',
        };
      } else {
        // Good click - selecting a new card
        clickedCard.clicked = true;
        updatedClickedCards.push(clickedCard);

        // Play the Pokemon's cry sound for successful click
        soundManager.playPokemonSound(clickedCard.name);

        shuffle(updatedArray);

        if (prev.currentScore >= prev.highScore) {
          return {
            ...prev,
            gameBoard: updatedArray,
            currentScore: updatedClickedCards.length,
            highScore: updatedClickedCards.length,
            clickedCards: [...updatedClickedCards],
            lastClickResult: 'success', // Indicate successful click
          };
        } else
          return {
            ...prev,
            gameBoard: updatedArray,
            currentScore: updatedClickedCards.length,
            clickedCards: [...updatedClickedCards],
            lastClickResult: 'success', // Indicate successful click
          };
      }
    });
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
