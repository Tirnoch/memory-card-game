import { useEffect, useState } from 'react';
import Header from './components/Header';
import shuffle from './components/shuffle';
import Card from './components/Card';
import {
  fetchPokemonData,
  getCardCountByDifficulty,
} from './components/fetchAPI';
import GameOverModal from './components/GameOverModal';

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
    gameResult: null, // 'win' or 'lose'
  });

  // Fetch Pokemon data on initial component mount or when difficulty changes
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setGame((prev) => ({ ...prev, isLoading: true }));
        const pokemonData = await fetchPokemonData(game.difficultyLevel);

        setGame((prev) => ({
          ...prev,
          gameBoard: shuffle([...pokemonData]),
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load Pokemon data:', error);
        setGame((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadPokemonData();
  }, [game.difficultyLevel]);

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
      setGame((prev) => ({
        ...prev,
        showGameOver: true,
        gameResult: 'win',
      }));
    }
  }, [game.currentScore, game.difficultyLevel]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    if (newDifficulty !== game.difficultyLevel) {
      setGame((prev) => ({
        ...prev,
        difficultyLevel: newDifficulty,
        clickedCards: [],
        currentScore: 0,
        showGameOver: false,
      }));
    }
  };

  // Start a new game by fetching new Pokemon
  const startNewGame = async () => {
    try {
      setGame((prev) => ({
        ...prev,
        isLoading: true,
        clickedCards: [],
        currentScore: 0,
        showGameOver: false,
      }));

      const newPokemonData = await fetchPokemonData(game.difficultyLevel);

      setGame((prev) => ({
        ...prev,
        gameBoard: shuffle([...newPokemonData]),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to start new game:', error);
      setGame((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleClick = (index) => {
    setGame((prev) => {
      const updatedArray = [...prev.gameBoard];
      const clickedCard = updatedArray[index];
      const updatedClickedCards = [...prev.clickedCards];

      //Game Restart
      if (
        updatedClickedCards.find((newClick) => newClick.id === clickedCard.id)
      ) {
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
        clickedCard.clicked = true;
        updatedClickedCards.push(clickedCard);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        highScore={game.highScore}
        currentScore={game.currentScore}
        difficultyLevel={game.difficultyLevel}
        onChangeDifficulty={handleDifficultyChange}
      />

      <div className="flex-1 flex flex-col items-center justify-center">
        {game.isLoading ? (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-sky-800 font-medium">
              Loading Pokémon...
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
        onChangeDifficulty={handleDifficultyChange}
      />
    </div>
  );
}
