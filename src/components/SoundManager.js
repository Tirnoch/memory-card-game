/**
 * Sound manager for handling game sound effects
 */
class SoundManager {
  constructor() {
    this.sounds = {
      click: new Audio('/sounds/click.mp3'),
      success: new Audio('/sounds/success.mp3'),
      error: new Audio('/sounds/error.mp3'),
      win: new Audio('/sounds/win.mp3'),
      lose: new Audio('/sounds/lose.mp3'),
    };

    // Initialize sound settings
    this.isMuted = localStorage.getItem('soundMuted') === 'true';

    // Set volume for all sounds
    this.setVolume(0.4);
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  play(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;

    try {
      // Stop and reset the sound before playing
      const sound = this.sounds[soundName];
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.warn(`Error playing sound ${soundName}:`, error);
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }

  /**
   * Set volume for all sounds
   * @param {number} volume - Volume level (0 to 1)
   */
  setVolume(volume) {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = volume;
    });
  }

  /**
   * Toggle mute status
   * @returns {boolean} - New mute status
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('soundMuted', this.isMuted);
    return this.isMuted;
  }

  /**
   * Get current mute status
   * @returns {boolean} - Current mute status
   */
  getMuteStatus() {
    return this.isMuted;
  }

  /**
   * Preload all sounds
   */
  preload() {
    Object.values(this.sounds).forEach((sound) => {
      sound.load();
    });
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager;
