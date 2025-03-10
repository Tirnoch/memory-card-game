import PropTypes from 'prop-types';
import { useState, useEffect, memo } from 'react';

const Card = ({ url, name, handleClick, feedbackStatus, isDisabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    const baseClasses = `rounded-xl border-2 relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300 ${
      isHovered && !isDisabled ? 'float-animation' : ''
    }`;

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
          : 'hover:bg-slate-300 hover:border-sky-400 active:bg-slate-200 hover:shadow-md hover:scale-105 focus:ring-2 focus:ring-sky-500 focus:outline-none'
      } border-stone-600 ${
        isHovered && !isDisabled
          ? 'bg-slate-100 scale-105 shadow-md border-sky-400'
          : 'bg-white'
      }`;
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

  // Handle keyboard interactions for accessibility
  const handleKeyDown = (e) => {
    if (isDisabled) return;

    // Activate on Enter or Space
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault(); // Prevent scrolling on Space
      handleClick();
    }
  };

  // Handle hover events
  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Determine appropriate ARIA attributes based on card state
  const getAriaAttributes = () => {
    let description = `Pokemon ${name}. Click to select this card.`;

    if (feedbackStatus === 'error') {
      description = `Pokemon ${name}. Error, this card was already selected.`;
    } else if (isDisabled) {
      description = `Pokemon ${name}. Card is currently disabled.`;
    }

    const descId = `description-${name.replace(/\s+/g, '-')}`;

    return {
      'aria-label': `Pokemon ${name}`,
      'aria-disabled': isDisabled,
      'aria-pressed': feedbackStatus === 'success',
      role: 'button',
      'aria-describedby': descId,
      tabIndex: isDisabled ? -1 : 0,
      descId: descId,
      description: description,
    };
  };

  const ariaAttributes = getAriaAttributes();
  const { descId, description, ...restAriaAttributes } = ariaAttributes;

  return (
    <button
      className={getFeedbackClass()}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      {...restAriaAttributes}
    >
      <span id={descId} className="sr-only">
        {description}
      </span>

      <p
        className={`text-center font-medium text-xs sm:text-sm md:text-base w-full px-1 truncate capitalize ${
          feedbackStatus === 'error'
            ? 'text-red-700 font-bold'
            : isHovered && !isDisabled
            ? 'text-sky-700'
            : ''
        }`}
      >
        {name}
      </p>
      <img
        src={url}
        alt={`sprite of Pokemon ${name}`}
        className={`p-2 sm:p-3 md:p-4 h-auto w-auto max-h-[80%] object-contain transition-transform ${
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

// Optimize with memo to prevent unnecessary re-renders
export default memo(Card);
