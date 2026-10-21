// Saved games, kept in the browser's localStorage so a game survives a reload
// and several games can be in progress at once.
//
// A saved game stores Pokémon by Pokédex number rather than as full objects:
// it keeps the save small, and sprite URLs (hashed by Vite) can change between
// builds. Numbers are turned back into Pokémon when a save is opened.
//
// Every write reads the latest store first and changes only one save, so two
// open tabs don't wipe out each other's games.

import { ALL_POKEMON, getPokemonPool } from '../data/pokedex.js'
import { DOUBLE_ELIMINATION, gameMode } from './modes.js'

const STORAGE_KEY = 'head2head-saves'
const VERSION = 1

// The oldest saves are dropped once there are more than this.
export const MAX_SAVES = 20

const POKEMON_BY_ID = new Map(ALL_POKEMON.map((pokemon) => [pokemon.id, pokemon]))

// --- Game state <-> stored form ---

const toId = (pokemon) => pokemon?.id ?? null
const toIds = (list) => list.map(toId)

function toPokemon(id) {
  if (id == null) return null
  const pokemon = POKEMON_BY_ID.get(id)
  if (!pokemon) throw new Error(`Unknown Pokémon #${id}`)
  return pokemon
}
const toPokemonList = (ids) => ids.map(toPokemon)

// Double elimination keeps records ({ pokemon, wins, losses, round? }).
const mapRecord = (record, convert) => ({ ...record, pokemon: convert(record.pokemon) })
const mapRecords = (records, convert) => records.map((record) => mapRecord(record, convert))
const mapMatches = (matches, convert) =>
  matches.map((match) => ({
    ...match,
    left: mapRecord(match.left, convert),
    right: mapRecord(match.right, convert),
  }))

function convertBracket(state, convert) {
  return {
    ...state,
    winners: mapRecords(state.winners, convert),
    losers: mapRecords(state.losers, convert),
    matches: mapMatches(state.matches, convert),
    eliminated: mapRecords(state.eliminated, convert),
    ranking: state.ranking.map(convert),
    ...(state.winner && { winner: mapRecord(state.winner, convert) }),
  }
}

export function serializeGame(state) {
  if (gameMode(state) === DOUBLE_ELIMINATION) return convertBracket(state, toId)
  return {
    ...state,
    champion: toId(state.champion),
    challenger: toId(state.challenger),
    queue: toIds(state.queue),
    reigns: state.reigns.map(({ pokemon, streak }) => ({ pokemon: toId(pokemon), streak })),
    favorites: toIds(state.favorites),
    suddenDeath: state.suddenDeath && {
      ...state.suddenDeath,
      ranked: toIds(state.suddenDeath.ranked),
      pending: toIds(state.suddenDeath.pending),
    },
    ranking: toIds(state.ranking),
  }
}

// Throws if the save names a Pokémon that is no longer in the Pokédex.
export function deserializeGame(data) {
  if (gameMode(data) === DOUBLE_ELIMINATION) return convertBracket(data, toPokemon)
  return {
    ...data,
    champion: toPokemon(data.champion),
    challenger: toPokemon(data.challenger),
    queue: toPokemonList(data.queue),
    reigns: data.reigns.map(({ pokemon, streak }) => ({ pokemon: toPokemon(pokemon), streak })),
    favorites: toPokemonList(data.favorites),
    suddenDeath: data.suddenDeath && {
      ...data.suddenDeath,
      ranked: toPokemonList(data.suddenDeath.ranked),
      pending: toPokemonList(data.suddenDeath.pending),
    },
    ranking: toPokemonList(data.ranking),
  }
}

// A save ready to play: { id, filters, pool, state }, or null if it can't be read.
export function openSave(save) {
  if (!save) return null
  try {
    return {
      id: save.id,
      filters: save.filters,
      pool: getPokemonPool(save.filters),
      state: deserializeGame(save.state),
    }
  } catch {
    return null
  }
}

// What the saved games list shows, read straight from the stored form.
// `progress` is { phase, placing?, left?, total? }; the list words it.
export function summarizeSave(save) {
  const { phase, total, champion, queue, suddenDeath, ranking } = save.state
  const mode = gameMode(save.state)
  let progress
  let leaderId
  if (phase === 'over') {
    progress = { phase }
    leaderId = ranking[0]
  } else if (phase === 'suddenDeath') {
    progress = { phase, placing: suddenDeath.ranked.length + 1, total: suddenDeath.total }
    leaderId = suddenDeath.ranked[0]
  } else if (phase === 'bracket') {
    const { round, left, leader } = summarizeBracket(save.state)
    progress = { phase, round, left, total }
    leaderId = leader
  } else {
    progress = { phase, left: queue.length, total }
    leaderId = champion
  }
  return {
    id: save.id,
    mode,
    filters: save.filters,
    updatedAt: save.updatedAt,
    isOver: phase === 'over',
    progress,
    leader: POKEMON_BY_ID.get(leaderId) ?? null,
  }
}

// Round, how many are still in, and who is doing best (fewest losses, then most wins).
function summarizeBracket({ round, winners, losers, matches }) {
  const records = [...matches.flatMap((match) => [match.left, match.right]), ...winners, ...losers]
  const best = records.reduce(
    (top, record) =>
      !top || record.losses < top.losses || (record.losses === top.losses && record.wins > top.wins)
        ? record
        : top,
    null,
  )
  return { round, left: records.length, leader: best?.pokemon ?? null }
}

// --- Storage ---

function emptyStore() {
  return { version: VERSION, activeId: null, saves: [] }
}

function readStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored?.version === VERSION && Array.isArray(stored.saves)) return stored
  } catch {
    // Missing, unreadable, or storage is unavailable: start empty.
  }
  return emptyStore()
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Storage can be unavailable (private mode) or full; the game still plays.
  }
  return store
}

// Newest first, at most MAX_SAVES. The active save is never dropped.
function trim(saves, activeId) {
  const sorted = [...saves].sort((a, b) => b.updatedAt - a.updatedAt)
  const keep = sorted.slice(0, MAX_SAVES)
  const active = sorted.find((save) => save.id === activeId)
  if (active && !keep.includes(active)) keep[keep.length - 1] = active
  return keep
}

// Reads the store and drops saves that can no longer be opened (for example
// a Pokémon was removed from the data).
export function loadStore() {
  const store = readStore()
  const saves = store.saves.filter((save) => openSave(save))
  if (saves.length === store.saves.length) return store
  const activeId = saves.some((save) => save.id === store.activeId) ? store.activeId : null
  return writeStore({ ...store, activeId, saves })
}

export function createSave(id, filters, state) {
  const store = readStore()
  const now = Date.now()
  const save = { id, filters, createdAt: now, updatedAt: now, state: serializeGame(state) }
  return writeStore({ ...store, activeId: id, saves: trim([save, ...store.saves], id) })
}

export function updateSave(id, state) {
  const store = readStore()
  if (!store.saves.some((save) => save.id === id)) return store
  const saves = store.saves.map((save) =>
    save.id === id ? { ...save, updatedAt: Date.now(), state: serializeGame(state) } : save,
  )
  return writeStore({ ...store, saves })
}

export function deleteSave(id) {
  const store = readStore()
  return writeStore({
    ...store,
    activeId: store.activeId === id ? null : store.activeId,
    saves: store.saves.filter((save) => save.id !== id),
  })
}

// The save open when the page was left, resumed on the next visit. null means
// the setup screen.
export function setActiveSave(id) {
  return writeStore({ ...readStore(), activeId: id })
}

// --- Export and import ---
//
// An export file holds saves in the same form as localStorage, so a game can
// move to another browser or device.

const EXPORT_FORMAT = 'favorite-pokemon-head2head-saves'
const PHASES = ['main', 'suddenDeath', 'bracket', 'over']

// All saves, or only those whose id is listed.
export function exportSaves(ids) {
  const saves = readStore().saves.filter((save) => !ids || ids.includes(save.id))
  return { format: EXPORT_FORMAT, version: VERSION, exportedAt: Date.now(), saves }
}

function isValidSave(save) {
  const filters = save?.filters
  return (
    typeof save?.id === 'string' &&
    Number.isFinite(save.updatedAt) &&
    ['generations', 'games', 'types'].every((key) => Array.isArray(filters?.[key])) &&
    PHASES.includes(save.state?.phase) &&
    (save.state.phase !== 'suddenDeath' || save.state.suddenDeath) &&
    (gameMode(save.state) !== DOUBLE_ELIMINATION ||
      ['winners', 'losers', 'matches', 'eliminated'].every((key) =>
        Array.isArray(save.state[key]),
      )) &&
    openSave(save) !== null
  )
}

// Adds the saves in an export file. A save that is already here (same id) is
// replaced only if the imported copy was played more recently. Throws if the
// file isn't an export.
export function importSaves(data) {
  if (data?.format !== EXPORT_FORMAT || data.version !== VERSION || !Array.isArray(data.saves)) {
    throw new Error('Not a saved games file')
  }
  const incoming = data.saves.filter(isValidSave)
  const store = readStore()
  const byId = new Map(store.saves.map((save) => [save.id, save]))
  let imported = 0
  for (const save of incoming) {
    const current = byId.get(save.id)
    if (current && current.updatedAt >= save.updatedAt) continue
    byId.set(save.id, save)
    imported++
  }
  const next = writeStore({ ...store, saves: trim([...byId.values()], store.activeId) })
  return { store: next, imported, skipped: data.saves.length - imported }
}

export function newSaveId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
