import { useEffect, useState } from 'react';
import Header from './components/Header';
import shuffle from './components/shuffle';
import URL_ARRAY from './components/URL_ARRAY';
import Card from './components/Card';

export default function App() {
  const [game, setGame] = useState({
    clickedCards: [],
    currentScore: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    gameBoard: [...URL_ARRAY],
    lastClickResult: null, // Track the result of the last click (success, error, null)
  });

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

  const handleClick = (index) => {
    setGame((prev) => {
      const updatedArray = [...prev.gameBoard];
      const clickedCard = updatedArray[index];
      const updatedClickedCards = [...prev.clickedCards];

      //Game Restart
      if (updatedClickedCards.find((newClick) => newClick == clickedCard)) {
        shuffle(updatedArray);
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
    <>
      <Header highScore={game.highScore} currentScore={game.currentScore} />
      <div
        id="gameBoard"
        className="grid grid-rows-auto grid-cols-3 gap-10 pt-10 px-10 justify-items-center"
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
    </>
  );
}
