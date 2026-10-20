import rawPokedex from './pokemon_modified.json'
import { LANGUAGES } from '../i18n/languages.js'

// Sprite URLs keyed by Pokédex number. Files are named by zero-padded number
// (0001.png); Vite copies them into the build with hashed names.
const spriteFiles = import.meta.glob('../assets/images/sprites/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const SPRITES = new Map(
  Object.entries(spriteFiles).map(([path, url]) => [Number(path.match(/(\d+)\.png$/)[1]), url]),
)

// Normalized shape the rest of the app works with. Keeping this mapping in one
// place means the JSON can change without touching the game or UI code.
function normalize(entry) {
  return {
    id: entry.id,
    name: entry.name.english,
    // Name in each site language, keyed by language code ('ja').
    names: Object.fromEntries(
      LANGUAGES.map((language) => [language.code, entry.name[language.nameKey] ?? null]),
    ),
    types: entry.type ?? [],
    generation: entry.generation ?? null,
    games: entry.games ?? [],
    // Games it can be obtained in without a trade, event, or transfer.
    catchable: entry.catchable ?? entry.games ?? [],
    sprite: SPRITES.get(entry.id) ?? null,
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
