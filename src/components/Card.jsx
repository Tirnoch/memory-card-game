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
    const baseClasses = `pokemon-card transition-all duration-300 ${
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
        isDisabled ? disabledClasses : 'hover:scale-105 active:scale-95'
      } ${isHovered && !isDisabled ? 'scale-105 pokemon-card-hover' : ''}`;
    }
  };

  // Handle card click
  const handleCardClick = (e) => {
    e.preventDefault();
    if (!isDisabled) {
      handleClick();
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (e) => {
    // Handle keyboard navigation - Enter or Space to activate
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault();
      handleClick();
    }
  };

  // Handle mouse enter for hover effect
  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  // Handle mouse leave to remove hover effect
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Get ARIA attributes for better accessibility
  const getAriaAttributes = () => {
    return {
      role: 'button',
      'aria-label': `Pokemon ${name}`,
      'aria-disabled': isDisabled,
      'aria-pressed': feedbackStatus === 'success',
    };
  };

  return (
    <div
      className={getFeedbackClass()}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={isDisabled ? -1 : 0}
      {...getAriaAttributes()}
    >
      <div className="card-content w-full h-full flex flex-col">
        <div className="card-header">
          <h3 className="card-name">{name}</h3>
        </div>
        <div className="card-image-container">
          <img
            src={url}
            alt={`${name} Pokemon`}
            className="card-image"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  feedbackStatus: PropTypes.oneOf(['', 'success', 'error']),
  isDisabled: PropTypes.bool,
};

Card.defaultProps = {
  feedbackStatus: '',
  isDisabled: false,
};

// Use React.memo to prevent unnecessary re-renders
export default memo(Card);
