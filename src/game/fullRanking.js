// Where every Pokémon in a finished game ended up, for the full ranking table
// and its CSV download. Pure, like the game logic.
//
// Rows are { rank, pokemon, favorite, wins }, best first. Pokémon that got
// equally far share a rank (1, 2, 3, 3, 5).
//
// - Classic: the Sudden Death ranking first, in order. Everyone else is then
//   ranked by how many matchups they won.
// - Double elimination: the champion, then everyone else by the round they went
//   out in, later rounds first, more wins breaking ties.
//
// `favorite` is true or false in classic and null in double elimination, which
// has no favorites.

import { DOUBLE_ELIMINATION, gameMode } from './modes.js'

// Gives tied rows the same rank. `key` says how far a row got; equal keys tie.
function assignRanks(rows, key) {
  let rank = 0
  let previous = null
  return rows.map((row, index) => {
    const current = key(row)
    if (index === 0 || current !== previous) rank = index + 1
    previous = current
    return { ...row, rank }
  })
}

function classicRows(state, pool) {
  // Older saves didn't count wins; a reign's streak is a lower bound for them.
  const wins = new Map()
  for (const { pokemon, streak } of state.reigns) {
    if (pokemon) wins.set(pokemon.id, Math.max(wins.get(pokemon.id) ?? 0, streak))
  }
  for (const [id, count] of Object.entries(state.wins ?? {})) {
    wins.set(Number(id), Math.max(wins.get(Number(id)) ?? 0, count))
  }
  const favorites = new Set(state.favorites.map((pokemon) => pokemon.id))
  const row = (pokemon) => ({
    pokemon,
    favorite: favorites.has(pokemon.id),
    wins: wins.get(pokemon.id) ?? 0,
  })

  const finalists = state.ranking.map((pokemon, index) => ({ ...row(pokemon), place: index }))
  const placed = new Set(state.ranking.map((pokemon) => pokemon.id))
  const others = pool
    .filter((pokemon) => !placed.has(pokemon.id))
    .map(row)
    .sort((a, b) => b.wins - a.wins || a.pokemon.id - b.pokemon.id)

  // Finalists each have their own place; the rest tie on wins.
  return assignRanks([...finalists, ...others], (entry) =>
    entry.place !== undefined ? `final-${entry.place}` : `wins-${entry.wins}`,
  )
}

function bracketRows(state) {
  const records = new Map(state.eliminated.map((record) => [record.pokemon.id, record]))
  const [champion] = state.ranking
  let winner = state.winner
  if (!winner && champion) {
    // Older saves didn't keep the champion's record. Every match has one winner
    // and one loser, so the champion's wins make up the difference.
    const lost = state.eliminated.reduce((sum, record) => sum + record.losses, 0)
    const won = state.eliminated.reduce((sum, record) => sum + record.wins, 0)
    winner = { pokemon: champion, wins: Math.max(0, lost - won) }
  }

  const rows = state.ranking.map((pokemon) => {
    const record = pokemon.id === champion?.id ? winner : records.get(pokemon.id)
    return { pokemon, favorite: null, wins: record?.wins ?? 0, round: record?.round }
  })
  return assignRanks(rows, (entry) =>
    entry.pokemon.id === champion?.id ? 'champion' : `${entry.round}-${entry.wins}`,
  )
}

// Every Pokémon in the game, best first. Only for finished games.
export function selectFullRanking(state, pool) {
  if (state.phase !== 'over') return []
  const rows =
    gameMode(state) === DOUBLE_ELIMINATION ? bracketRows(state) : classicRows(state, pool)
  return rows.map(({ rank, pokemon, favorite, wins }) => ({ rank, pokemon, favorite, wins }))
}

// --- CSV ---

// Quotes a value when it holds a comma, quote, or line break.
function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

// The ranking as a CSV file. Headers stay in English so files from different
// languages can be combined; `name` is in the language the game was played in.
// Double elimination leaves `favorite` empty.
export function rankingCsv(rows, nameOf) {
  const header = ['rank', 'dex_number', 'name', 'favorite', 'victories']
  const lines = rows.map(({ rank, pokemon, favorite, wins }) =>
    [rank, pokemon.id, nameOf(pokemon), favorite === null ? '' : favorite ? 'yes' : 'no', wins]
      .map(csvCell)
      .join(','),
  )
  // The byte order mark lets Excel read Japanese and Chinese names correctly.
  return `﻿${[header.join(','), ...lines].join('\r\n')}\r\n`
}
