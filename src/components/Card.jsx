import PropTypes from 'prop-types';
import { useState, memo } from 'react';

const Card = ({ url, name, handleClick, feedbackStatus, isDisabled }) => {
  const [imageError, setImageError] = useState(false);

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

  // Fallback URL in case of error
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
    Math.floor(Math.random() * 800) + 1
  }.png`;

  // Simple styles directly applied
  const cardStyle = {
    border:
      feedbackStatus === 'error' ? '3px solid #f44336' : '3px solid #ffeb3b',
    borderRadius: '8px',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.7 : 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    position: 'relative',
    minHeight: '120px',
    width: '100%',
    zIndex: 10,
  };

  const imageContainerStyle = {
    width: '100%',
    height: '70%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    borderRadius: '50%',
    margin: '4px 0',
    zIndex: 20,
  };

  const imageStyle = {
    display: 'block',
    maxWidth: '70%',
    maxHeight: '70%',
    zIndex: 30,
  };

  const nameStyle = {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'capitalize',
    marginTop: '4px',
    zIndex: 20,
  };

  return (
    <div
      style={cardStyle}
      onClick={handleCardClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
    >
      <p style={nameStyle}>{name}</p>
      <div style={imageContainerStyle}>
        <img
          src={imageError ? fallbackUrl : url}
          alt={`sprite of Pokemon ${name}`}
          style={imageStyle}
          draggable="false"
          onError={handleImageError}
        />
      </div>
    </div>
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

export default memo(Card);
