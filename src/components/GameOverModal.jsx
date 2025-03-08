import PropTypes from 'prop-types';
import soundManager from './SoundManager';
import { useEffect } from 'react';

const GameOverModal = ({
  isVisible,
  score,
  maxScore,
  result,
  onPlayAgain,
  onChangeDifficulty,
  currentDifficulty,
}) => {
  // Play appropriate sound when modal becomes visible
  useEffect(() => {
    if (isVisible) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center">
          <h2
            className={`text-2xl font-bold mb-4 ${
              isWin ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isWin ? 'Congratulations!' : 'Game Over!'}
          </h2>

          <div className="my-6">
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
              onClick={handlePlayAgain}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
            >
              Play Again
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Difficulty:</span>
              <select
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={currentDifficulty}
                onChange={handleDifficultyChange}
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
