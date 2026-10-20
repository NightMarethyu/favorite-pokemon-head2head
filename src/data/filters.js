import { ENGLISH } from '../i18n/translate.js'
import { ALL_POKEMON } from './pokedex.js'

// Options for the setup screen. The pool itself is built by getPokemonPool().

export const GENERATIONS = [
  { value: 1, label: 'Gen I', region: 'Kanto' },
  { value: 2, label: 'Gen II', region: 'Johto' },
  { value: 3, label: 'Gen III', region: 'Hoenn' },
  { value: 4, label: 'Gen IV', region: 'Sinnoh' },
  { value: 5, label: 'Gen V', region: 'Unova' },
  { value: 6, label: 'Gen VI', region: 'Kalos' },
  { value: 7, label: 'Gen VII', region: 'Alola' },
  { value: 8, label: 'Gen VIII', region: 'Galar' },
  { value: 9, label: 'Gen IX', region: 'Paldea' },
]

export const TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
]

// Main-series games in release order, grouped by the generation they came out in.
// `generation` is null for the "Other" group.
const CURATED_GAME_GROUPS = [
  { label: 'Gen I', generation: 1, games: ['Red', 'Blue', 'Blue (Japan)', 'Yellow'] },
  { label: 'Gen II', generation: 2, games: ['Gold', 'Silver', 'Crystal'] },
  {
    label: 'Gen III',
    generation: 3,
    games: ['Ruby', 'Sapphire', 'Emerald', 'FireRed', 'LeafGreen'],
  },
  {
    label: 'Gen IV',
    generation: 4,
    games: ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver'],
  },
  { label: 'Gen V', generation: 5, games: ['Black', 'White', 'Black 2', 'White 2'] },
  { label: 'Gen VI', generation: 6, games: ['X', 'Y', 'Omega Ruby', 'Alpha Sapphire'] },
  {
    label: 'Gen VII',
    generation: 7,
    games: ['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon', "Let's Go Pikachu", "Let's Go Eevee"],
  },
  {
    label: 'Gen VIII',
    generation: 8,
    games: [
      'Sword',
      'Shield',
      'Sword Expansion Pass',
      'Shield Expansion Pass',
      'Brilliant Diamond',
      'Shining Pearl',
      'Legends: Arceus',
    ],
  },
  {
    label: 'Gen IX',
    generation: 9,
    games: [
      'Scarlet',
      'Violet',
      'The Hidden Treasure of Area Zero (Scarlet)',
      'The Hidden Treasure of Area Zero (Violet)',
      'Legends: Z-A',
    ],
  },
  { label: 'Other', generation: null, games: ['Colosseum', 'XD', 'Pokéwalker', 'Dream World'] },
]

// Only list games that appear in the data, and put any game the list above
// doesn't know about under "Other" so it can still be picked.
function buildGameGroups() {
  const known = new Set(ALL_POKEMON.flatMap((pokemon) => pokemon.games))
  const listed = new Set(CURATED_GAME_GROUPS.flatMap((group) => group.games))
  const unlisted = [...known].filter((game) => !listed.has(game))
  return CURATED_GAME_GROUPS.map((group) => ({
    ...group,
    games: [
      ...group.games.filter((game) => known.has(game)),
      ...(group.label === 'Other' ? unlisted : []),
    ],
  })).filter((group) => group.games.length > 0)
}

export const GAME_GROUPS = buildGameGroups()

export const EMPTY_FILTERS = { generations: [], games: [], types: [] }

export function hasFilters(filters) {
  return Object.values(filters).some((values) => values.length > 0)
}

// Short description of the chosen filters, e.g. "Gen I · Fire, Water", in the
// translator's language (English by default).
export function describeFilters({ generations, games, types }, i18n = ENGLISH) {
  const parts = [
    i18n.list(generations.map(i18n.generationLabel)),
    i18n.list(games.map(i18n.gameName)),
    i18n.list(types.map(i18n.typeName)),
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : i18n.t('allPokemon')
}
