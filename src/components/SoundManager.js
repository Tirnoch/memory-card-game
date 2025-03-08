/**
 * Sound manager for handling game sound effects
 */
class SoundManager {
  constructor() {
    this.sounds = {
      click: new Audio('/sounds/click.mp3'),
      win: new Audio('/sounds/win.mp3'),
      lose: new Audio('/sounds/lose.mp3'),
    };

    // Cache for Pokemon cry sounds
    this.pokemonSoundCache = {};

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
   * Play a Pokemon cry sound
   * @param {string} pokemonName - Name of the Pokemon
   * @param {boolean} isDefeatSound - Whether to play defeat sound instead of normal cry
   */
  async playPokemonSound(pokemonName, isDefeatSound = false) {
    if (this.isMuted) return;

    try {
      // Check if we already have this sound cached
      const cacheKey = `${pokemonName}-${isDefeatSound ? 'defeat' : 'cry'}`;

      if (!this.pokemonSoundCache[cacheKey]) {
        // Fetch Pokemon data to get ID
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
        );

        if (!response.ok) {
          console.warn(`Could not find Pokemon: ${pokemonName}`);
          // Play a fallback sound
          this.play(isDefeatSound ? 'lose' : 'click');
          return;
        }

        // Verification succeeds if we get to this point, meaning it's a valid Pokemon
        await response.json();

        // Create audio element for the Pokemon cry
        // For defeat sound, we'll use a different format or fallback to the default lose sound
        if (isDefeatSound) {
          // No specific defeat sounds in PokeAPI, so we'll play a low-pitched version of the cry
          const audio = new Audio(
            `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase()}.mp3`
          );
          audio.playbackRate = 0.7; // Slow it down to sound like defeat
          audio.volume = this.sounds.lose.volume * 0.7;
          this.pokemonSoundCache[cacheKey] = audio;
        } else {
          // For normal cry, use the Pokemon Showdown cry sounds which are more distinguishable
          const audio = new Audio(
            `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase()}.mp3`
          );
          audio.volume = this.sounds.click.volume;
          this.pokemonSoundCache[cacheKey] = audio;
        }
      }

      // Play the sound from cache
      const sound = this.pokemonSoundCache[cacheKey];
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.warn(`Error playing Pokemon sound for ${pokemonName}:`, error);
        // Fallback to regular sounds
        this.play(isDefeatSound ? 'lose' : 'click');
      });
    } catch (error) {
      console.error(`Error playing Pokemon sound for ${pokemonName}:`, error);
      // Fallback to regular sounds
      this.play(isDefeatSound ? 'lose' : 'click');
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

    // Also update volume for any cached Pokemon sounds
    Object.values(this.pokemonSoundCache).forEach((sound) => {
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
