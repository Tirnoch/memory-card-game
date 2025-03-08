/**
 * Get the number of cards based on difficulty level
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @returns {number} - Number of cards for the selected difficulty
 */
export function getCardCountByDifficulty(difficulty = 'medium') {
  switch (difficulty) {
    case 'easy':
      return 8;
    case 'medium':
      return 12;
    case 'hard':
      return 16;
    default:
      return 12;
  }
}

/**
 * Fetches a list of Pokemon with detailed information including sprites
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {number} offset - Starting index for fetching Pokemon (default: random offset)
 * @returns {Promise<Array>} - Array of Pokemon objects with name, url, and sprite URLs
 */
export async function fetchPokemonData(difficulty = 'medium', offset = null) {
  try {
    // Get number of cards based on difficulty
    const limit = getCardCountByDifficulty(difficulty);

    // Generate a random offset between 1 and 800 if not provided
    // This ensures we get different Pokemon each time
    const randomOffset =
      offset !== null ? offset : Math.floor(Math.random() * 800) + 1;

    // Get list of Pokemon
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${randomOffset}`
    );
    if (!response.ok) throw new Error('Failed to fetch Pokemon list');

    const data = await response.json();
    const pokemonList = data.results;

    // Fetch detailed info for each Pokemon in parallel
    const detailedPokemonPromises = pokemonList.map(async (pokemon, index) => {
      try {
        const detailResponse = await fetch(pokemon.url);
        if (!detailResponse.ok)
          throw new Error(`Failed to fetch details for ${pokemon.name}`);

        const pokemonData = await detailResponse.json();

        return {
          id: index,
          name: pokemon.name,
          url: pokemonData.sprites.front_default,
          clicked: false,
        };
      } catch (error) {
        console.error(`Error fetching details for ${pokemon.name}:`, error);
        // Return a fallback object if fetching details fails
        return {
          id: index,
          name: pokemon.name,
          // Fallback to a placeholder image if sprite fetch fails
          url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
            randomOffset + index + 1
          }.png`,
          clicked: false,
        };
      }
    });

    return await Promise.all(detailedPokemonPromises);
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);

    // Get fallback count based on difficulty
    const limit = getCardCountByDifficulty(difficulty);

    // Fallback to generate placeholder data if the API is down
    return Array.from({ length: limit }, (_, i) => ({
      id: i,
      name: `pokemon-${i + 1}`,
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
        i + 1
      }.png`,
      clicked: false,
    }));
  }
}
