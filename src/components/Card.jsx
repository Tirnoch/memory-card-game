import PropTypes from 'prop-types';
import { useState, useEffect, memo } from 'react';

const Card = ({ url, name, handleClick, feedbackStatus, isDisabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    const baseClasses = `pokemon-card relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300 ${
      isHovered && !isDisabled ? 'float-animation' : ''
    }`;

    // First decide on disabled state
    const disabledClasses = isDisabled
      ? 'opacity-70 cursor-not-allowed pointer-events-none'
      : '';

    if (feedbackStatus === 'error') {
      // Enhanced error animation
      return `${baseClasses} pokemon-card-error ${
        isAnimating ? 'animate-shake scale-105' : ''
      } ${disabledClasses}`;
    } else {
      return `${baseClasses} ${
        isDisabled
          ? disabledClasses
          : 'hover:scale-105 active:scale-95 focus:ring-2 focus:ring-yellow-400 focus:outline-none'
      } ${isHovered && !isDisabled ? 'scale-105 pokemon-card-hover' : ''}`;
    }
  };

  // Handle image load error
  const handleImageError = () => {
    console.error(`Failed to load image for ${name}`);
    setImageError(true);
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

  // Fallback URL in case of error
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
    Math.floor(Math.random() * 800) + 1
  }.png`;

  return (
    <button
      className={getFeedbackClass()}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      {...restAriaAttributes}
      style={{ minHeight: '120px' }}
    >
      <span id={descId} className="sr-only">
        {description}
      </span>

      <div className="card-content">
        <div className="card-header">
          <p
            className={`card-name capitalize ${
              feedbackStatus === 'error' ? 'text-red-700 font-bold' : ''
            }`}
          >
            {name}
          </p>
        </div>

        <div className="card-image-container" style={{ minHeight: '70px' }}>
          <img
            src={imageError ? fallbackUrl : url}
            alt={`sprite of Pokemon ${name}`}
            className={`card-image ${
              feedbackStatus === 'error' && isAnimating
                ? 'animate-[wiggle_0.2s_ease_3]'
                : ''
            }`}
            draggable="false"
            onError={handleImageError}
            style={{
              display: 'block',
              width: '70%',
              height: 'auto',
              position: 'relative',
              zIndex: 999,
            }}
          />
        </div>
      </div>
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
