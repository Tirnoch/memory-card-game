import PropTypes from 'prop-types';
import { memo } from 'react';

const Header = ({
  highScore,
  currentScore,
  difficultyLevel,
  onChangeDifficulty,
  isDisabled,
}) => {
  const handleDifficultyChange = (e) => {
    if (!isDisabled) {
      onChangeDifficulty(e.target.value);
    }
  };

  return (
    <header
      className="bg-gradient-to-tr from-red-500 to-red-400 text-white flex flex-col sm:flex-row items-center p-3 sm:p-4 shadow-md relative overflow-hidden"
      role="banner"
    >
      {/* Pokeball decorative elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-white rounded-full opacity-10"></div>
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-red-500 rounded-full opacity-10"></div>
      <div className="absolute right-8 top-1/2 w-8 h-8 bg-white rounded-full opacity-20"></div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold sm:flex-1 mb-2 sm:mb-0 z-10">
        Pokémon Memory Game
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 z-10">
        <div
          className="flex gap-4 sm:gap-6 text-sm sm:text-base px-2 py-1 sm:px-4 bg-red-600/40 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium">
            <span className="sr-only">Your best score is</span>
            Best: <span className="font-bold">{highScore}</span>
          </p>
          <p className="font-medium">
            <span className="sr-only">Your current score is</span>
            Current:{' '}
            <span className="font-bold" aria-live="assertive">
              {currentScore}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="difficulty-select" className="text-white sr-only">
            Select difficulty level
          </label>
          <select
            id="difficulty-select"
            className={`bg-red-600 text-white px-3 py-1 rounded-lg text-sm sm:text-base cursor-pointer border-2 border-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-300 ${
              isDisabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            value={difficultyLevel}
            onChange={handleDifficultyChange}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label="Select difficulty level"
          >
            <option value="easy">Easy (8 cards)</option>
            <option value="medium">Medium (12 cards)</option>
            <option value="hard">Hard (16 cards)</option>
          </select>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  highScore: PropTypes.number.isRequired,
  currentScore: PropTypes.number.isRequired,
  difficultyLevel: PropTypes.string.isRequired,
  onChangeDifficulty: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

Header.defaultProps = {
  isDisabled: false,
};

export default memo(Header);
