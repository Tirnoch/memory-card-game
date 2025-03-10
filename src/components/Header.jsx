import PropTypes from 'prop-types';
import { memo } from 'react';
import SoundToggle from './SoundToggle';

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
      className="bg-gradient-to-tr from-red-500 to-red-400 text-white flex flex-row items-center justify-between p-1 sm:p-3 shadow-md relative overflow-hidden"
      role="banner"
    >
      {/* Pokeball decorative elements - only show on larger screens */}
      <div className="hidden sm:block absolute -right-16 -top-16 w-32 h-32 bg-white rounded-full opacity-10"></div>
      <div className="hidden sm:block absolute -right-12 -top-12 w-24 h-24 bg-red-500 rounded-full opacity-10"></div>
      <div className="hidden sm:block absolute right-8 top-1/2 w-8 h-8 bg-white rounded-full opacity-20"></div>

      {/* Small Pokeball icon for mobile */}
      <div className="sm:hidden w-6 h-6 relative z-10 ml-1">
        <div className="w-full h-full bg-red-500 rounded-full border border-white"></div>
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
      </div>

      {/* Game title - hidden on mobile */}
      <h1 className="hidden sm:block text-lg sm:text-xl md:text-2xl font-bold flex-1 z-10">
        Pokémon Memory
      </h1>

      <div className="flex flex-row items-center gap-2 sm:gap-4 z-10">
        <div
          className="flex gap-2 sm:gap-4 text-xs sm:text-sm px-1 py-0.5 sm:px-3 sm:py-1 bg-red-600/40 rounded-md"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium">
            <span className="sr-only">Your best score is</span>
            Best: <span className="font-bold">{highScore}</span>
          </p>
          <p className="font-medium">
            <span className="sr-only">Your current score is</span>
            Score:{' '}
            <span className="font-bold" aria-live="assertive">
              {currentScore}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <label htmlFor="difficulty-select" className="text-white sr-only">
            Select difficulty level
          </label>
          <select
            id="difficulty-select"
            className={`bg-red-600 text-white text-xs sm:text-sm px-1 py-0.5 sm:px-2 sm:py-1 rounded-md cursor-pointer border border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-300 ${
              isDisabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            value={difficultyLevel}
            onChange={handleDifficultyChange}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label="Select difficulty level"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Sound toggle button */}
          <SoundToggle isDisabled={isDisabled} />
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
