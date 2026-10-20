import { ALL_POKEMON } from './pokedex.js'

// 0 stands for every generation.
export const ALL_GENERATIONS = 0

// Lowercase without accents, so "flabebe" finds Flabébé.
const fold = (text) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Pokémon with a sprite in a generation, matching a name (in any language) or
// a Pokédex number. Exact names first, then names that start with the search,
// then the rest.
export function searchPokemon(query, generation = ALL_GENERATIONS) {
  const term = fold(query.trim())
  const number = /^#?\d+$/.test(term) ? Number(term.replace('#', '')) : null
  const inGeneration = ALL_POKEMON.filter(
    (pokemon) =>
      pokemon.sprite && (generation === ALL_GENERATIONS || pokemon.generation === generation),
  )
  if (!term) return inGeneration
  if (number != null) return inGeneration.filter((pokemon) => pokemon.id === number)
  const rank = (pokemon) => {
    const names = [pokemon.name, ...Object.values(pokemon.names)].filter(Boolean).map(fold)
    if (names.includes(term)) return 0
    if (names.some((name) => name.startsWith(term))) return 1
    return names.some((name) => name.includes(term)) ? 2 : -1
  }
  return inGeneration
    .map((pokemon) => [rank(pokemon), pokemon])
    .filter(([score]) => score >= 0)
    .sort((a, b) => a[0] - b[0])
    .map(([, pokemon]) => pokemon)
}
