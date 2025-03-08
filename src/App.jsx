import { useEffect, useState } from 'react';
import Header from './components/Header';
import shuffle from './components/shuffle';
import Card from './components/Card';
import { fetchPokemonData } from './components/fetchAPI';

export default function App() {
  const [game, setGame] = useState({
    clickedCards: [],
    currentScore: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    gameBoard: [],
    lastClickResult: null, // Track the result of the last click (success, error, null)
    isLoading: true,
  });

  // Fetch Pokemon data on initial component mount
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setGame((prev) => ({ ...prev, isLoading: true }));
        const pokemonData = await fetchPokemonData();

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
  }, []);

  // Save high score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('highScore', game.highScore.toString());
  }, [game.highScore]);

  // Reset feedback after a short delay
  useEffect(() => {
    if (game.lastClickResult) {
      const timer = setTimeout(() => {
        setGame((prev) => ({
          ...prev,
          lastClickResult: null,
        }));
      }, 700); // Reset after 700ms

      return () => clearTimeout(timer);
    }
  }, [game.lastClickResult]);

  // Start a new game by fetching new Pokemon
  const startNewGame = async () => {
    try {
      setGame((prev) => ({
        ...prev,
        isLoading: true,
        clickedCards: [],
        currentScore: 0,
      }));

      const newPokemonData = await fetchPokemonData();

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

        // Start a new game with new Pokemon after a short delay
        setTimeout(() => {
          startNewGame();
        }, 1000);

        return {
          ...prev,
          gameBoard: updatedArray,
          currentScore: 0,
          clickedCards: [],
          lastClickResult: 'error', // Indicate error on duplicate click
        };
      } else {
        clickedCard.clicked = true;
        updatedClickedCards.push(clickedCard);
        shuffle(updatedArray);

        if (game.currentScore >= game.highScore) {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header highScore={game.highScore} currentScore={game.currentScore} />

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
            className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-10 justify-items-center content-start mx-auto w-full max-w-7xl"
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
    </div>
  );
}
