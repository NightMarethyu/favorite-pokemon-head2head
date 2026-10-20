// Pure game logic. No React here so it can be reused or tested on its own.
//
// The game has two phases:
//
// 1. Main round ("king of the hill"). The pool is shuffled once. The champion
//    (left) stays until a challenger (right) is picked over it. Each Pokémon
//    is drawn exactly once, so a dethroned champion never comes back.
//    Either Pokémon can instead be marked as a favorite: it leaves the main
//    round straight away and goes to Sudden Death. That stops a favorite from
//    knocking out everything else early, so the Pokémon you like a little less
//    still get a fair run at a streak.
//
// 2. Sudden Death. The favorites and the longest streaks from the main round
//    face off to put them in order. Each finalist is placed into the ranking
//    with a binary search, so it takes about n·log2(n) picks rather than every
//    possible pair. Losing a Sudden Death matchup only moves a Pokémon down the
//    ranking; it is never knocked out.

export const TEAM_SIZE = 6

export const CLASSIC = 'classic'

// How many of the longest main-round streaks join the favorites in Sudden Death.
export const STREAK_FINALISTS = TEAM_SIZE

export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createGame(pool, random = Math.random) {
  const [champion = null, challenger = null, ...queue] = shuffle(pool, random)
  const state = {
    // Saves from before double elimination have no mode; they are classic.
    mode: CLASSIC,
    phase: 'main', // 'main' | 'suddenDeath' | 'over'
    total: pool.length,
    champion,
    challenger,
    streak: 0,
    queue,
    // Finished reigns, in the order they ended: { pokemon, streak }
    reigns: [],
    // Pokémon sent straight to Sudden Death, in the order they were marked.
    favorites: [],
    // Set when Sudden Death starts: { ranked, pending, lo, hi, total }
    suddenDeath: null,
    // Best first. Set when the game is over.
    ranking: [],
  }
  // With fewer than two Pokémon there is no matchup to play.
  return challenger ? state : endMainRound(state)
}

// --- Main round ---

function nextMatchup(state) {
  if (state.queue.length === 0) return endMainRound(state)
  const [challenger, ...queue] = state.queue
  return { ...state, challenger, queue }
}

function pickChampion(state) {
  return nextMatchup({ ...state, streak: state.streak + 1 })
}

function pickChallenger(state) {
  return nextMatchup({
    ...state,
    reigns: [...state.reigns, { pokemon: state.champion, streak: state.streak }],
    champion: state.challenger,
    // The challenger has just beaten the old champion.
    streak: 1,
  })
}

function favorite(state, side) {
  if (side === 'challenger') {
    return nextMatchup({ ...state, favorites: [...state.favorites, state.challenger] })
  }
  // The champion leaves; the challenger takes its place without a win yet.
  return nextMatchup({
    ...state,
    favorites: [...state.favorites, state.champion],
    champion: state.challenger,
    streak: 0,
  })
}

// Undo a favorite during the main round: it goes back into the draw.
function unfavorite(state, id) {
  const pokemon = state.favorites.find((entry) => entry.id === id)
  if (!pokemon) return state
  return {
    ...state,
    favorites: state.favorites.filter((entry) => entry.id !== id),
    queue: [...state.queue, pokemon],
  }
}

// The longest streaks first. Ties keep the earlier reign first.
function topReigns(reigns, size) {
  return reigns
    .filter((reign) => reign.pokemon)
    .map((reign, order) => ({ ...reign, order }))
    .sort((a, b) => b.streak - a.streak || a.order - b.order)
    .slice(0, size)
}

function endMainRound(state) {
  const reigns = state.champion
    ? [...state.reigns, { pokemon: state.champion, streak: state.streak }]
    : state.reigns
  const streakFinalists = topReigns(
    reigns.filter((reign) => reign.streak > 0),
    STREAK_FINALISTS,
  ).map((reign) => reign.pokemon)
  const finalists = [...state.favorites, ...streakFinalists]
  return startSuddenDeath({ ...state, reigns, champion: null, challenger: null }, finalists)
}

// --- Sudden Death ---

function startSuddenDeath(state, finalists) {
  if (finalists.length < 2) return endGame(state, finalists)
  const [first, ...pending] = finalists
  return placeNext({
    ...state,
    phase: 'suddenDeath',
    suddenDeath: { ranked: [first], pending, lo: 0, hi: 1, total: finalists.length },
  })
}

// Show the next comparison, or insert the candidate once its spot is known.
function placeNext(state) {
  const { ranked, pending, lo, hi } = state.suddenDeath
  const [candidate, ...rest] = pending
  if (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    return { ...state, champion: ranked[mid], challenger: candidate }
  }
  const placed = [...ranked.slice(0, lo), candidate, ...ranked.slice(lo)]
  if (rest.length === 0) return endGame(state, placed)
  return placeNext({
    ...state,
    suddenDeath: { ...state.suddenDeath, ranked: placed, pending: rest, lo: 0, hi: placed.length },
  })
}

// The left card is the ranked Pokémon at the midpoint; the right card is the
// one being placed. Picking the right card means it ranks above the midpoint.
function pickInSuddenDeath(state, candidateWins) {
  const { lo, hi } = state.suddenDeath
  const mid = Math.floor((lo + hi) / 2)
  const bounds = candidateWins ? { lo, hi: mid } : { lo: mid + 1, hi }
  return placeNext({ ...state, suddenDeath: { ...state.suddenDeath, ...bounds } })
}

function endGame(state, ranking) {
  return {
    ...state,
    phase: 'over',
    champion: ranking[0] ?? null,
    challenger: null,
    ranking,
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'PICK_CHAMPION':
      if (state.phase === 'main') return pickChampion(state)
      if (state.phase === 'suddenDeath') return pickInSuddenDeath(state, false)
      return state

    case 'PICK_CHALLENGER':
      if (state.phase === 'main') return pickChallenger(state)
      if (state.phase === 'suddenDeath') return pickInSuddenDeath(state, true)
      return state

    case 'FAVORITE':
      if (state.phase !== 'main') return state
      return favorite(state, action.side)

    case 'UNFAVORITE':
      if (state.phase !== 'main') return state
      return unfavorite(state, action.id)

    case 'RESTART':
      return createGame(action.pool)

    default:
      return state
  }
}

// --- Selectors ---

// The team shown under the arena, as { pokemon, streak?, rank? } entries.
//   - Main round: the longest streaks so far, including the champion's.
//   - Sudden Death: the ranking so far.
//   - Over: the final ranking.
export function selectTeam(state, size = TEAM_SIZE) {
  if (state.phase === 'main') {
    return topReigns(
      [...state.reigns, { pokemon: state.champion, streak: state.streak }],
      size,
    ).map(({ pokemon, streak }) => ({ pokemon, streak }))
  }
  const ranked = state.phase === 'over' ? state.ranking : state.suddenDeath.ranked
  return ranked.slice(0, size).map((pokemon, index) => ({ pokemon, rank: index + 1 }))
}

// Pokémon not yet shown (the current pair counts as shown).
export function selectRemaining(state) {
  return state.queue.length
}

// Sudden Death progress: which finalist is being placed, out of how many.
export function selectSuddenDeathProgress(state) {
  if (state.phase !== 'suddenDeath') return null
  const { ranked, total } = state.suddenDeath
  return { placing: ranked.length + 1, total }
}
