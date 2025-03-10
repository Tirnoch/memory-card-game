import PropTypes from 'prop-types';
import { useState, useEffect, memo } from 'react';
import soundManager from './SoundManager';

const SoundToggle = ({ isDisabled }) => {
  const [isMuted, setIsMuted] = useState(() => soundManager.isMuted());

  // Update state when external mute changes (via soundManager)
  useEffect(() => {
    const handleMuteChange = (muted) => {
      setIsMuted(muted);
    };

    soundManager.on('muteChange', handleMuteChange);
    return () => {
      soundManager.off('muteChange', handleMuteChange);
    };
  }, []);

  const toggleSound = (e) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    setIsMuted((prev) => {
      const newState = !prev;
      soundManager.setMuted(newState);
      soundManager.play('click');
      return newState;
    });
  };

  return (
    <button
      onClick={toggleSound}
      disabled={isDisabled}
      className={`bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-md focus:outline-none focus:ring-1 focus:ring-red-300 transition-colors w-7 h-7 p-1 sm:w-8 sm:h-8 sm:p-1.5 ${
        isDisabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
};

SoundToggle.propTypes = {
  isDisabled: PropTypes.bool,
};

SoundToggle.defaultProps = {
  isDisabled: false,
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(SoundToggle);
