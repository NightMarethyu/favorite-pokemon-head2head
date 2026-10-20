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
const CURATED_GAME_GROUPS = [
  { label: 'Gen I', games: ['Red', 'Blue', 'Blue (Japan)', 'Yellow'] },
  { label: 'Gen II', games: ['Gold', 'Silver', 'Crystal'] },
  { label: 'Gen III', games: ['Ruby', 'Sapphire', 'Emerald', 'FireRed', 'LeafGreen'] },
  { label: 'Gen IV', games: ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver'] },
  { label: 'Gen V', games: ['Black', 'White', 'Black 2', 'White 2'] },
  { label: 'Gen VI', games: ['X', 'Y', 'Omega Ruby', 'Alpha Sapphire'] },
  {
    label: 'Gen VII',
    games: ['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon', "Let's Go Pikachu", "Let's Go Eevee"],
  },
  {
    label: 'Gen VIII',
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
    games: [
      'Scarlet',
      'Violet',
      'The Hidden Treasure of Area Zero (Scarlet)',
      'The Hidden Treasure of Area Zero (Violet)',
      'Legends: Z-A',
    ],
  },
  { label: 'Other', games: ['Colosseum', 'XD', 'Pokéwalker', 'Dream World'] },
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

// Short description of the chosen filters, e.g. "Gen I · Fire, Water".
export function describeFilters({ generations, games, types }) {
  const parts = [
    generations
      .map((value) => GENERATIONS.find((gen) => gen.value === value)?.label ?? `Gen ${value}`)
      .join(', '),
    games.join(', '),
    types.join(', '),
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'All Pokémon'
}
