import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Card = ({ url, name, handleClick, feedbackStatus, isDisabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Set animation when feedback status changes, but only for error
  useEffect(() => {
    if (feedbackStatus === 'error') {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Make animation faster (500ms instead of 600ms)
      return () => clearTimeout(timer);
    }
  }, [feedbackStatus]);

  // Generate the appropriate CSS classes based on feedback status
  const getFeedbackClass = () => {
    const baseClasses =
      'rounded-xl border-2 relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300';

    // First decide on disabled state
    const disabledClasses = isDisabled
      ? 'opacity-70 cursor-not-allowed pointer-events-none'
      : '';

    if (feedbackStatus === 'error') {
      // Enhanced error animation
      return `${baseClasses} border-red-500 bg-red-100 shadow-lg shadow-red-300 ${
        isAnimating ? 'animate-shake scale-105' : ''
      } ${disabledClasses}`;
    } else {
      return `${baseClasses} ${
        isDisabled
          ? disabledClasses
          : 'hover:bg-slate-300 active:bg-slate-200 hover:shadow-md hover:scale-105'
      } border-stone-600`;
    }
  };

  // Handle click without animation delay for normal clicks
  const handleCardClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    handleClick();
  };

  return (
    <button
      className={getFeedbackClass()}
      onClick={handleCardClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      <p
        className={`text-center font-medium text-xs sm:text-sm md:text-base w-full px-1 truncate ${
          feedbackStatus === 'error' ? 'text-red-700 font-bold' : ''
        }`}
      >
        {name}
      </p>
      <img
        src={url}
        alt={`sprite of a ${name}`}
        className={`p-2 sm:p-3 md:p-4 h-auto w-auto max-h-[80%] object-contain ${
          feedbackStatus === 'error' && isAnimating
            ? 'animate-[wiggle_0.2s_ease_3]'
            : isDisabled
            ? ''
            : 'hover:scale-110 transition-transform duration-300'
        }`}
        draggable="false"
      />
    </button>
  );
};

Card.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  feedbackStatus: PropTypes.oneOf(['success', 'error', null]),
  isDisabled: PropTypes.bool,
};

Card.defaultProps = {
  isDisabled: false,
};

export default Card;
