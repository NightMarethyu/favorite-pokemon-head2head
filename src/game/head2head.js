// Pure "king of the hill" game logic. No React here so it can be reused or
// tested on its own.
//
// The pool is shuffled once. The champion (left) stays until a challenger
// (right) is picked over it. Each Pokémon is drawn exactly once, so a
// dethroned champion never comes back.

export const TEAM_SIZE = 6

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
    total: pool.length,
    champion,
    challenger,
    streak: 0,
    queue,
    // Finished reigns, in the order they ended: { pokemon, streak }
    reigns: [],
    isOver: false,
  }
  // With fewer than two Pokémon there is no matchup to play.
  return challenger ? state : endGame(state)
}

function endGame(state) {
  return {
    ...state,
    reigns: state.champion
      ? [...state.reigns, { pokemon: state.champion, streak: state.streak }]
      : state.reigns,
    challenger: null,
    isOver: true,
  }
}

function nextMatchup(state) {
  if (state.queue.length === 0) return endGame(state)
  const [challenger, ...queue] = state.queue
  return { ...state, challenger, queue }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'PICK_CHAMPION':
      if (state.isOver) return state
      return nextMatchup({ ...state, streak: state.streak + 1 })

    case 'PICK_CHALLENGER':
      if (state.isOver) return state
      return nextMatchup({
        ...state,
        reigns: [...state.reigns, { pokemon: state.champion, streak: state.streak }],
        champion: state.challenger,
        // The challenger has just beaten the old champion.
        streak: 1,
      })

    case 'RESTART':
      return createGame(action.pool)

    default:
      return state
  }
}

// The longest streaks so far, including the current champion's live streak.
// Ties keep the earlier reign first.
export function selectTeam(state, size = TEAM_SIZE) {
  const reigns = state.isOver
    ? state.reigns
    : [...state.reigns, { pokemon: state.champion, streak: state.streak }]
  return reigns
    .filter((reign) => reign.pokemon)
    .map((reign, order) => ({ ...reign, order }))
    .sort((a, b) => b.streak - a.streak || a.order - b.order)
    .slice(0, size)
}

// Pokémon not yet shown (the current pair counts as shown).
export function selectRemaining(state) {
  return state.queue.length
}
