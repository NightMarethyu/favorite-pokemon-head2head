import { TYPES } from './filters.js'

// How much damage a move of one type does to a Pokémon of another, as in the
// games from Gen VI on. Only the matchups that aren't 1× are listed.
const MATCHUPS = {
  Normal: { half: ['Rock', 'Steel'], none: ['Ghost'] },
  Fire: { double: ['Grass', 'Ice', 'Bug', 'Steel'], half: ['Fire', 'Water', 'Rock', 'Dragon'] },
  Water: { double: ['Fire', 'Ground', 'Rock'], half: ['Water', 'Grass', 'Dragon'] },
  Grass: {
    double: ['Water', 'Ground', 'Rock'],
    half: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
  },
  Electric: {
    double: ['Water', 'Flying'],
    half: ['Electric', 'Grass', 'Dragon'],
    none: ['Ground'],
  },
  Ice: { double: ['Grass', 'Ground', 'Flying', 'Dragon'], half: ['Fire', 'Water', 'Ice', 'Steel'] },
  Fighting: {
    double: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
    half: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
    none: ['Ghost'],
  },
  Poison: {
    double: ['Grass', 'Fairy'],
    half: ['Poison', 'Ground', 'Rock', 'Ghost'],
    none: ['Steel'],
  },
  Ground: {
    double: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
    half: ['Grass', 'Bug'],
    none: ['Flying'],
  },
  Flying: { double: ['Grass', 'Fighting', 'Bug'], half: ['Electric', 'Rock', 'Steel'] },
  Psychic: { double: ['Fighting', 'Poison'], half: ['Psychic', 'Steel'], none: ['Dark'] },
  Bug: {
    double: ['Grass', 'Psychic', 'Dark'],
    half: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
  },
  Rock: { double: ['Fire', 'Ice', 'Flying', 'Bug'], half: ['Fighting', 'Ground', 'Steel'] },
  Ghost: { double: ['Psychic', 'Ghost'], half: ['Dark'], none: ['Normal'] },
  Dragon: { double: ['Dragon'], half: ['Steel'], none: ['Fairy'] },
  Dark: { double: ['Psychic', 'Ghost'], half: ['Fighting', 'Dark', 'Fairy'] },
  Steel: { double: ['Ice', 'Rock', 'Fairy'], half: ['Fire', 'Water', 'Electric', 'Steel'] },
  Fairy: { double: ['Fighting', 'Dragon', 'Dark'], half: ['Fire', 'Poison', 'Steel'] },
}

// The multiplier for one attacking type against one defending type.
export function effectiveness(attack, defend) {
  const matchup = MATCHUPS[attack]
  if (!matchup) return 1
  if (matchup.double?.includes(defend)) return 2
  if (matchup.half?.includes(defend)) return 0.5
  if (matchup.none?.includes(defend)) return 0
  return 1
}

// The multiplier against a Pokémon with one or two types.
export function effectivenessAgainst(attack, defendTypes) {
  return defendTypes.reduce((total, type) => total * effectiveness(attack, type), 1)
}

// Multipliers shown in the lists, strongest first.
export const MULTIPLIERS = [4, 2, 0.5, 0.25, 0]

// Every attacking type's multiplier against these types, grouped by
// multiplier ({ 2: ['Fire', ...], ... }). 1× is left out.
export function defenseGroups(defendTypes) {
  const groups = {}
  for (const attack of TYPES) {
    const value = effectivenessAgainst(attack, defendTypes)
    if (value !== 1) (groups[value] ??= []).push(attack)
  }
  return groups
}

// What one attacking type does to each single type, grouped the same way.
export function attackGroups(attack) {
  const groups = {}
  for (const defend of TYPES) {
    const value = effectiveness(attack, defend)
    if (value !== 1) (groups[value] ??= []).push(defend)
  }
  return groups
}

// 0.5 -> '½×'
export function multiplierText(value) {
  return `${{ 0.5: '½', 0.25: '¼' }[value] ?? value}×`
}
