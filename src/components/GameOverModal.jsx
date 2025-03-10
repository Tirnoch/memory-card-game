import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import soundManager from './SoundManager';

const GameOverModal = ({
  isVisible,
  score,
  maxScore,
  result,
  onPlayAgain,
  onChangeDifficulty,
  currentDifficulty,
}) => {
  // Use ref to focus the play again button when modal opens
  const playAgainButtonRef = useRef(null);

  // Play appropriate sound when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      // Focus the play again button when modal becomes visible
      if (playAgainButtonRef.current) {
        setTimeout(() => playAgainButtonRef.current.focus(), 100);
      }

      // Use a short timeout to ensure the sound plays after any other sounds
      setTimeout(() => {
        soundManager.play(result === 'win' ? 'win' : 'lose');
      }, 100);
    }
  }, [isVisible, result]);

  if (!isVisible) return null;

  const isWin = result === 'win';

  const handlePlayAgain = () => {
    soundManager.play('click');
    onPlayAgain();
  };

  const handleDifficultyChange = (e) => {
    soundManager.play('click');
    onChangeDifficulty(e.target.value);
  };

  // Function to handle keyboard navigation inside the modal
  const handleKeyDown = (e) => {
    // Trap focus inside modal with Tab key
    if (e.key === 'Tab') {
      const focusableElements = document.querySelectorAll(
        'button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift+tab and on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // If tab and on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    // Close on Escape key
    if (e.key === 'Escape') {
      handlePlayAgain();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all animate-[fadeIn_0.3s_ease-out] relative overflow-hidden ${
          isWin ? 'border-4 border-green-500' : 'border-4 border-red-500'
        }`}
        tabIndex="-1"
      >
        {/* Decorative Pokeball */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-red-500 rounded-full opacity-10"></div>
        <div className="absolute -right-10 -top-10 w-20 h-20 bg-white rounded-full opacity-10"></div>
        <div className="absolute right-4 top-4 w-4 h-4 bg-white rounded-full opacity-20"></div>

        <div className="text-center relative z-10">
          <h2
            id="modal-title"
            className={`text-2xl font-bold mb-4 ${
              isWin ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isWin ? 'Congratulations!' : 'Game Over!'}
          </h2>

          <div className="my-6" role="status">
            <p className="text-lg mb-2">
              {isWin
                ? 'You remembered all the cards!'
                : 'You clicked a card you already selected!'}
            </p>
            <p className="text-gray-700 mb-4">
              Your score: <span className="font-bold">{score}</span>
            </p>
            {maxScore > 0 && (
              <p className="text-gray-700">
                Best score: <span className="font-bold">{maxScore}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              ref={playAgainButtonRef}
              onClick={handlePlayAgain}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isWin
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-400'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
              }`}
              aria-label="Play again"
            >
              Play Again
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="modal-difficulty-select"
                className="text-gray-600"
              >
                Difficulty:
              </label>
              <select
                id="modal-difficulty-select"
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={currentDifficulty}
                onChange={handleDifficultyChange}
                aria-label="Select difficulty level for next game"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

GameOverModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  score: PropTypes.number.isRequired,
  maxScore: PropTypes.number.isRequired,
  result: PropTypes.oneOf(['win', 'lose']).isRequired,
  onPlayAgain: PropTypes.func.isRequired,
  onChangeDifficulty: PropTypes.func.isRequired,
  currentDifficulty: PropTypes.string.isRequired,
};

export default GameOverModal;
