import { useCallback, useMemo, useReducer } from 'react'
import {
  DOUBLE_ELIMINATION,
  gameMode,
  gameReducer,
  selectBracketProgress,
  selectGameTeam,
  selectRemaining,
  selectSuddenDeathProgress,
  startGame,
} from './modes.js'

// initialState resumes a saved game; without it a new classic game starts from pool.
export function useHead2Head(pool, initialState) {
  const [state, dispatch] = useReducer(gameReducer, null, () => initialState ?? startGame(pool))

  const pickLeft = useCallback(() => dispatch({ type: 'PICK_CHAMPION' }), [])
  const pickRight = useCallback(() => dispatch({ type: 'PICK_CHALLENGER' }), [])
  const favoriteLeft = useCallback(() => dispatch({ type: 'FAVORITE', side: 'champion' }), [])
  const favoriteRight = useCallback(() => dispatch({ type: 'FAVORITE', side: 'challenger' }), [])
  const unfavorite = useCallback((id) => dispatch({ type: 'UNFAVORITE', id }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART', pool }), [pool])

  const team = useMemo(() => selectGameTeam(state), [state])
  const isOver = state.phase === 'over'
  const actions = { pickLeft, pickRight, favoriteLeft, favoriteRight, unfavorite, restart }

  if (gameMode(state) === DOUBLE_ELIMINATION) {
    const match = state.matches[0]
    return {
      state,
      mode: DOUBLE_ELIMINATION,
      phase: state.phase,
      // The left card, or the winner once the game is over.
      champion: isOver ? (state.ranking[0] ?? null) : (match?.left.pokemon ?? null),
      challenger: match?.right.pokemon ?? null,
      match,
      // The next match's Pokémon, to load their sprites early.
      upcoming: (state.matches[1] ? [state.matches[1].left, state.matches[1].right] : []).map(
        (record) => record.pokemon,
      ),
      bracket: selectBracketProgress(state),
      total: state.total,
      isOver,
      team,
      ...actions,
    }
  }

  return {
    state,
    mode: gameMode(state),
    phase: state.phase,
    champion: state.champion,
    challenger: state.challenger,
    // The next Pokémon to be drawn in the main round, if any.
    upcoming: state.phase === 'main' && state.queue[0] ? [state.queue[0]] : [],
    streak: state.streak,
    total: state.total,
    remaining: selectRemaining(state),
    suddenDeath: selectSuddenDeathProgress(state),
    favorites: state.favorites,
    isOver,
    team,
    ...actions,
  }
}
