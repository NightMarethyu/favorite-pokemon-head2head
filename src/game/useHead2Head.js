import { useCallback, useMemo, useReducer } from 'react'
import {
  createGame,
  reducer,
  selectRemaining,
  selectSuddenDeathProgress,
  selectTeam,
} from './head2head.js'

export function useHead2Head(pool) {
  const [state, dispatch] = useReducer(reducer, pool, createGame)

  const pickLeft = useCallback(() => dispatch({ type: 'PICK_CHAMPION' }), [])
  const pickRight = useCallback(() => dispatch({ type: 'PICK_CHALLENGER' }), [])
  const favoriteLeft = useCallback(() => dispatch({ type: 'FAVORITE', side: 'champion' }), [])
  const favoriteRight = useCallback(() => dispatch({ type: 'FAVORITE', side: 'challenger' }), [])
  const unfavorite = useCallback((id) => dispatch({ type: 'UNFAVORITE', id }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART', pool }), [pool])

  const team = useMemo(() => selectTeam(state), [state])

  return {
    phase: state.phase,
    champion: state.champion,
    challenger: state.challenger,
    // The next Pokémon to be drawn in the main round, if any.
    next: state.phase === 'main' ? (state.queue[0] ?? null) : null,
    streak: state.streak,
    total: state.total,
    remaining: selectRemaining(state),
    suddenDeath: selectSuddenDeathProgress(state),
    favorites: state.favorites,
    isOver: state.phase === 'over',
    team,
    pickLeft,
    pickRight,
    favoriteLeft,
    favoriteRight,
    unfavorite,
    restart,
  }
}
