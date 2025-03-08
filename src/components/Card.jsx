import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Card = ({ url, name, handleClick, feedbackStatus }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Set animation when feedback status changes
  useEffect(() => {
    if (feedbackStatus) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [feedbackStatus]);

  // Generate the appropriate CSS classes based on feedback status
  const getFeedbackClass = () => {
    const baseClasses =
      'rounded-xl border-2 relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300';
    const animationClasses = isAnimating
      ? 'animate-pulse transform scale-105'
      : '';

    if (feedbackStatus === 'success') {
      return `${baseClasses} ${animationClasses} border-green-500 bg-green-100 shadow-lg shadow-green-200`;
    } else if (feedbackStatus === 'error') {
      return `${baseClasses} ${animationClasses} border-red-500 bg-red-100 shadow-lg shadow-red-200 animate-shake`;
    } else {
      return `${baseClasses} hover:bg-slate-300 active:bg-slate-200 hover:shadow-md hover:scale-105 border-stone-600`;
    }
  };

  // Handle click with animation
  const handleCardClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      handleClick();
    }, 100);
  };

  return (
    <button className={getFeedbackClass()} onClick={handleCardClick}>
      <p
        className={`text-center font-medium text-xs sm:text-sm md:text-base w-full px-1 truncate ${
          feedbackStatus === 'success'
            ? 'text-green-700'
            : feedbackStatus === 'error'
            ? 'text-red-700'
            : ''
        }`}
      >
        {name}
      </p>
      <img
        src={url}
        alt={`sprite of a ${name}`}
        className={`p-2 sm:p-3 md:p-4 h-auto w-auto max-h-[80%] object-contain transition-transform duration-300 ${
          isAnimating ? 'animate-bounce' : 'hover:scale-110'
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
};

export default Card;
