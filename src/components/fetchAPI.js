export async function fetchAPI() {
  let fetchObj = await fetch(`https://pokeapi.co/api/v2/pokemon/`)
    .then((result) => result.json())
    .then((result) => result.results);
  return fetchObj;
}
