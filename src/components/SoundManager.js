/**
 * Sound manager for handling game sound effects
 */
class SoundManager {
  constructor() {
    this.sounds = {
      click: new Audio('/sounds/click.mp3'),
      success: new Audio('/sounds/click.mp3'), // Reuse click sound as success
      error: new Audio('/sounds/error.mp3'), // Make sure error sound exists
      win: new Audio('/sounds/win.mp3'),
      lose: new Audio('/sounds/lose.mp3'),
    };

    // Cache for Pokemon cry sounds
    this.pokemonSoundCache = {};

    // Initialize sound settings
    this.isMuted = localStorage.getItem('soundMuted') === 'true';

    // Set volume for all sounds
    this.setVolume(0.4);

    // Preload sounds to ensure they're ready
    this.preload();
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   * @param {boolean} forceFallback - Whether to force using a fallback if primary sound fails
   */
  play(soundName, forceFallback = true) {
    if (this.isMuted || !this.sounds[soundName]) return;

    try {
      // Stop and reset the sound before playing
      const sound = this.sounds[soundName];
      sound.currentTime = 0;

      // Play with error handling
      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`Error playing sound ${soundName}:`, error);

          // Try fallback for common sounds if enabled
          if (forceFallback) {
            // If win/lose fails, try click as fallback
            if (
              soundName === 'win' ||
              soundName === 'lose' ||
              soundName === 'error'
            ) {
              this.play('click', false); // Prevent infinite recursion
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      // Try fallback
      if (forceFallback && soundName !== 'click') {
        this.play('click', false); // Prevent infinite recursion
      }
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
      // First play a fallback sound immediately for instant feedback
      this.play(isDefeatSound ? 'error' : 'success', false);

      // Check if we already have this sound cached
      const cacheKey = `${pokemonName}-${isDefeatSound ? 'defeat' : 'cry'}`;

      // If the sound isn't cached, don't wait - we already played the fallback
      if (!this.pokemonSoundCache[cacheKey]) {
        // Try to load it in the background for next time
        this.loadPokemonSound(pokemonName, isDefeatSound).catch(() => {
          /* Ignore errors - fallback already played */
        });
        return;
      }

      // We have the sound cached, try to play it
      const sound = this.pokemonSoundCache[cacheKey];
      sound.currentTime = 0;

      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            `Error playing Pokemon sound for ${pokemonName}:`,
            error
          );
          // Fallback already played at start, no need for another one
        });
      }
    } catch (error) {
      console.error(`Error playing Pokemon sound for ${pokemonName}:`, error);
      // Fallback already played at start, no need for another one
    }
  }

  /**
   * Pre-load Pokemon sounds for a list of Pokemon
   * @param {Array} pokemonList - List of Pokemon objects with names
   */
  async preloadPokemonSounds(pokemonList) {
    if (!pokemonList || !pokemonList.length) return;

    // Create a queue of promises to load sounds in parallel (with limits)
    const loadPromises = pokemonList.map((pokemon) =>
      this.loadPokemonSound(pokemon.name)
    );

    // We don't need to await these - they'll load in the background
    Promise.allSettled(loadPromises).then((results) => {
      const successCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      console.log(
        `Preloaded ${successCount}/${pokemonList.length} Pokemon sounds`
      );
    });
  }

  /**
   * Load and cache a Pokemon sound without playing it
   * @param {string} pokemonName - Name of the Pokemon
   * @param {boolean} isDefeatSound - Whether to load defeat sound
   * @returns {Promise} - Promise that resolves when sound is loaded
   */
  async loadPokemonSound(pokemonName, isDefeatSound = false) {
    try {
      const cacheKey = `${pokemonName}-${isDefeatSound ? 'defeat' : 'cry'}`;

      // If already cached, don't reload
      if (this.pokemonSoundCache[cacheKey]) {
        return Promise.resolve(this.pokemonSoundCache[cacheKey]);
      }

      // Direct URL to Pokemon Showdown cry sound
      const soundUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase()}.mp3`;

      // Create audio element
      const audio = new Audio(soundUrl);

      if (isDefeatSound) {
        audio.playbackRate = 0.7; // Slow down for defeat sound
        audio.volume = this.sounds.lose.volume * 0.7;
      } else {
        audio.volume = this.sounds.success.volume;
      }

      // Wait for the audio to be loadable
      return new Promise((resolve, reject) => {
        // Set a timeout to avoid hanging forever
        const timeoutId = setTimeout(() => {
          reject(new Error('Sound loading timed out'));
        }, 5000); // 5 second timeout

        audio.addEventListener(
          'canplaythrough',
          () => {
            clearTimeout(timeoutId);
            this.pokemonSoundCache[cacheKey] = audio;
            resolve(audio);
          },
          { once: true }
        );

        audio.addEventListener(
          'error',
          (e) => {
            clearTimeout(timeoutId);
            console.warn(`Failed to load Pokemon sound for ${pokemonName}:`, e);
            reject(e);
          },
          { once: true }
        );

        // Start loading
        audio.load();
      });
    } catch (error) {
      console.error(`Error loading Pokemon sound for ${pokemonName}:`, error);
      return Promise.reject(error);
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
