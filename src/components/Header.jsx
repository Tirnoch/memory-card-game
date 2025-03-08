import PropTypes from 'prop-types';

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
    <div className="bg-gradient-to-tr from-sky-700 to-sky-900 text-slate-200 flex flex-col sm:flex-row items-center p-3 sm:p-4 shadow-md">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold sm:flex-1 mb-2 sm:mb-0">
        Memory Card Game
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <div className="flex gap-4 sm:gap-6 text-sm sm:text-base px-2 py-1 sm:px-4 bg-sky-950/30 rounded-lg">
          <p className="font-medium">
            Best: <span className="font-bold">{highScore}</span>
          </p>
          <p className="font-medium">
            Current: <span className="font-bold">{currentScore}</span>
          </p>
        </div>

        <select
          className={`bg-sky-600 text-white px-3 py-1 rounded-lg text-sm sm:text-base cursor-pointer border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 ${
            isDisabled ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          value={difficultyLevel}
          onChange={handleDifficultyChange}
          disabled={isDisabled}
        >
          <option value="easy">Easy (8 cards)</option>
          <option value="medium">Medium (12 cards)</option>
          <option value="hard">Hard (16 cards)</option>
        </select>
      </div>
    </div>
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

export default Header;
