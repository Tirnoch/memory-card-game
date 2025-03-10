import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import soundManager from './SoundManager';

const SoundToggle = ({ isDisabled }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuteStatus());

  const toggleSound = (e) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const newMuteStatus = soundManager.toggleMute();
    setIsMuted(newMuteStatus);
  };

  return (
    <button
      onClick={toggleSound}
      className={`fixed bottom-4 right-4 z-40 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
      title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {isMuted ? (
        // Muted icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
        // Unmuted icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
