import rawPokedex from './pokemon_modified.json'

// Normalized shape the rest of the app works with. Keeping this mapping in one
// place means the JSON can change without touching the game or UI code.
function normalize(entry) {
  return {
    id: entry.id,
    name: entry.name.english,
    types: entry.type ?? [],
    generation: entry.generation ?? null,
    games: entry.games ?? [],
  }
}

export const ALL_POKEMON = rawPokedex.map(normalize)

function matchesAny(selected, values) {
  if (!selected || selected.length === 0) return true
  return values.some((value) => selected.includes(value))
}

/**
 * Returns the Pokémon to use for a game.
 *
 * Each filter is optional; an empty or missing filter matches everything.
 *   - generations: e.g. [1, 2]
 *   - games: e.g. ['Red', 'Blue']
 *   - types: e.g. ['Fire', 'Water'] (matches if the Pokémon has any of them)
 */
export function getPokemonPool({ generations, games, types } = {}) {
  return ALL_POKEMON.filter(
    (pokemon) =>
      matchesAny(generations, pokemon.generation == null ? [] : [pokemon.generation]) &&
      matchesAny(games, pokemon.games) &&
      matchesAny(types, pokemon.types),
  )
}
