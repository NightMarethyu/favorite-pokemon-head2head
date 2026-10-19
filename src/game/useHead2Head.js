import { useCallback, useMemo, useReducer } from 'react'
import { createGame, reducer, selectRemaining, selectTeam } from './head2head.js'

export function useHead2Head(pool) {
  const [state, dispatch] = useReducer(reducer, pool, createGame)

  const pickLeft = useCallback(() => dispatch({ type: 'PICK_CHAMPION' }), [])
  const pickRight = useCallback(() => dispatch({ type: 'PICK_CHALLENGER' }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART', pool }), [pool])

  const team = useMemo(() => selectTeam(state), [state])

  return {
    champion: state.champion,
    challenger: state.challenger,
    streak: state.streak,
    total: state.total,
    remaining: selectRemaining(state),
    isOver: state.isOver,
    team,
    pickLeft,
    pickRight,
    restart,
  }
}
