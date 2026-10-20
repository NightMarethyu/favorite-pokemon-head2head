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

const RAW_BY_ID = new Map(rawPokedex.map((entry) => [entry.id, entry]))

// The stats in the order the games show them, keyed as in the data.
export const STATS = ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed']

// "87.5:12.5" (male:female) -> { male: 87.5, female: 12.5 }; null if genderless.
function genderRatio(text) {
  const match = /^([\d.]+):([\d.]+)$/.exec(text ?? '')
  return match ? { male: Number(match[1]), female: Number(match[2]) } : null
}

// The first number in "1.7 m", or null.
const measure = (text) => {
  const value = Number.parseFloat(text)
  return Number.isFinite(value) ? value : null
}

// Everything the wiki shows about one Pokémon. Species, Pokédex text,
// abilities, and evolution methods are only in English in the data.
export function pokemonDetails(id) {
  const entry = RAW_BY_ID.get(id)
  if (!entry) return null
  const profile = entry.profile ?? {}
  const evolution = entry.evolution ?? {}
  return {
    species: entry.species ?? '',
    description: entry.description ?? '',
    stats: STATS.map((stat) => ({ stat, value: entry.base?.[stat] ?? 0 })),
    heightM: measure(profile.height),
    weightKg: measure(profile.weight),
    // "No Eggs Discovered" and "Undiscovered" are the same group.
    eggGroups: [
      ...new Set(
        (profile.egg ?? []).map((group) =>
          group === 'No Eggs Discovered' ? 'Undiscovered' : group,
        ),
      ),
    ],
    abilities: (profile.ability ?? []).map(([name, hidden]) => ({
      name,
      hidden: hidden === 'true',
    })),
    gender: genderRatio(profile.gender),
    // { id, method } for what it evolves from and into.
    evolvesFrom: evolution.prev
      ? { id: Number(evolution.prev[0]), method: evolution.prev[1] }
      : null,
    evolvesTo: (evolution.next ?? []).map(([next, method]) => ({ id: Number(next), method })),
  }
}

// The whole evolution family as stages: [[root], [its evolutions], ...].
export function evolutionStages(id) {
  let root = id
  const seen = new Set([root])
  for (let from = pokemonDetails(root)?.evolvesFrom; from && !seen.has(from.id); ) {
    root = from.id
    seen.add(root)
    from = pokemonDetails(root)?.evolvesFrom
  }
  const stages = []
  let stage = [{ id: root, method: null }]
  const visited = new Set()
  while (stage.length > 0) {
    stages.push(stage)
    stage.forEach((member) => visited.add(member.id))
    stage = stage.flatMap(
      (member) =>
        pokemonDetails(member.id)?.evolvesTo.filter((next) => !visited.has(next.id)) ?? [],
    )
  }
  return stages
}
