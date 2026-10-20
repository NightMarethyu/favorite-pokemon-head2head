// The ways to play. A game's state records its mode; saves from before modes
// existed have none and are classic.

import {
  CLASSIC,
  createGame,
  reducer,
  selectRemaining,
  selectSuddenDeathProgress,
  selectTeam,
} from './head2head.js'
import {
  DOUBLE_ELIMINATION,
  bracketReducer,
  createBracketGame,
  estimatePicks,
  selectBracketProgress,
  selectBracketTeam,
} from './doubleElimination.js'

export { CLASSIC, DOUBLE_ELIMINATION, estimatePicks }

export const MODES = [CLASSIC, DOUBLE_ELIMINATION]

export function gameMode(state) {
  return state?.mode === DOUBLE_ELIMINATION ? DOUBLE_ELIMINATION : CLASSIC
}

export function startGame(pool, mode = CLASSIC) {
  return mode === DOUBLE_ELIMINATION ? createBracketGame(pool) : createGame(pool)
}

export function gameReducer(state, action) {
  return gameMode(state) === DOUBLE_ELIMINATION
    ? bracketReducer(state, action)
    : reducer(state, action)
}

export function selectGameTeam(state) {
  return gameMode(state) === DOUBLE_ELIMINATION ? selectBracketTeam(state) : selectTeam(state)
}

export { selectBracketProgress, selectRemaining, selectSuddenDeathProgress }
