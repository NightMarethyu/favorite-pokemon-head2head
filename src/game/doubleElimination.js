// Double elimination. Pure game logic, like head2head.js.
//
// Every Pokémon starts in the winners bracket. Losing once moves it to the
// second-chance bracket; losing twice knocks it out. So one strong early pick
// can't knock out everything else, and nobody needs to know the Pokémon well
// enough to mark favorites first.
//
// The game is played in rounds. Each round pairs up the Pokémon waiting in
// each bracket (an odd one out sits the round out). Winners-bracket matches
// come first, then second-chance matches. When one Pokémon is left in each
// bracket they meet in the final; if the second-chance Pokémon wins, both have
// one loss and a rematch decides it.
//
// The final ranking is the champion, then everyone else by how long they
// lasted: later rounds first, more wins breaking ties.

import { TEAM_SIZE, shuffle } from './head2head.js'

export const DOUBLE_ELIMINATION = 'doubleElimination'

// A pool of n Pokémon takes 2n - 2 picks, or 2n - 1 if the final goes to a rematch.
export function estimatePicks(size) {
  return Math.max(0, 2 * size - 2)
}

const entry = (pokemon) => ({ pokemon, wins: 0, losses: 0 })

export function createBracketGame(pool, random = Math.random) {
  return startRound(
    {
      mode: DOUBLE_ELIMINATION,
      phase: 'bracket', // 'bracket' | 'over'
      total: pool.length,
      round: 0,
      // Pokémon waiting for their next match, as { pokemon, wins, losses }.
      winners: shuffle(pool, random).map(entry),
      losers: [],
      // This round's matches, the current one first: { bracket, left, right }.
      // bracket is 'winners' | 'losers' | 'final' | 'rematch'.
      matches: [],
      // Knocked out, in order, with the round they went out in.
      eliminated: [],
      // Best first. Set when the game is over.
      ranking: [],
    },
    random,
  )
}

// Pairs the list in order; an odd one out is left waiting.
function pairUp(entries, bracket) {
  const matches = []
  for (let i = 0; i + 1 < entries.length; i += 2) {
    matches.push({ bracket, left: entries[i], right: entries[i + 1] })
  }
  return { matches, waiting: entries.length % 2 ? [entries[entries.length - 1]] : [] }
}

function startRound(state, random = Math.random) {
  const { winners, losers } = state
  if (winners.length + losers.length < 2) return endGame(state, [...winners, ...losers][0])
  const round = state.round + 1
  if (winners.length === 1 && losers.length === 1) {
    return {
      ...state,
      round,
      winners: [],
      losers: [],
      matches: [{ bracket: 'final', left: winners[0], right: losers[0] }],
    }
  }
  // Shuffle each round so the same Pokémon doesn't always sit a round out.
  const top = pairUp(shuffle(winners, random), 'winners')
  const bottom = pairUp(shuffle(losers, random), 'losers')
  return {
    ...state,
    round,
    winners: top.waiting,
    losers: bottom.waiting,
    matches: [...top.matches, ...bottom.matches],
  }
}

const win = (record) => ({ ...record, wins: record.wins + 1 })
const lose = (record) => ({ ...record, losses: record.losses + 1 })

function pick(state, leftWins) {
  const [match, ...matches] = state.matches
  if (!match) return state
  const winner = win(leftWins ? match.left : match.right)
  const loser = lose(leftWins ? match.right : match.left)
  const out = (record) => [...state.eliminated, { ...record, round: state.round }]

  if (match.bracket === 'final' || match.bracket === 'rematch') {
    // The winners-bracket Pokémon (left) losing the final means both have one
    // loss, so they play once more.
    if (match.bracket === 'final' && !leftWins) {
      return { ...state, matches: [{ bracket: 'rematch', left: loser, right: winner }] }
    }
    return endGame({ ...state, matches: [], eliminated: out(loser) }, winner)
  }

  let next = { ...state, matches }
  if (match.bracket === 'winners') {
    next = { ...next, winners: [...next.winners, winner], losers: [...next.losers, loser] }
  } else {
    next = { ...next, losers: [...next.losers, winner], eliminated: out(loser) }
  }
  return matches.length > 0 ? next : startRound(next)
}

function endGame(state, champion) {
  const others = state.eliminated
    .map((record, order) => ({ ...record, order }))
    .sort((a, b) => b.round - a.round || b.wins - a.wins || b.order - a.order)
  const ranking = [...(champion ? [champion] : []), ...others].map((record) => record.pokemon)
  return { ...state, phase: 'over', winners: [], losers: [], matches: [], ranking }
}

export function bracketReducer(state, action) {
  switch (action.type) {
    case 'PICK_CHAMPION':
      return state.phase === 'bracket' ? pick(state, true) : state
    case 'PICK_CHALLENGER':
      return state.phase === 'bracket' ? pick(state, false) : state
    case 'RESTART':
      return createBracketGame(action.pool)
    default:
      return state
  }
}

// --- Selectors ---

// Everyone still in, as { pokemon, wins, losses }.
function stillIn(state) {
  return [
    ...state.matches.flatMap((match) => [match.left, match.right]),
    ...state.winners,
    ...state.losers,
  ]
}

// The team shown under the arena: while playing, the Pokémon doing best so far
// (fewest losses, then most wins); once over, the top of the final ranking.
export function selectBracketTeam(state, size = TEAM_SIZE) {
  if (state.phase === 'over') {
    return state.ranking.slice(0, size).map((pokemon, index) => ({ pokemon, rank: index + 1 }))
  }
  return stillIn(state)
    .map((record, order) => ({ ...record, order }))
    .sort((a, b) => a.losses - b.losses || b.wins - a.wins || a.order - b.order)
    .slice(0, size)
    .map(({ pokemon, wins, losses }) => ({ pokemon, wins, losses }))
}

export function selectBracketProgress(state) {
  return {
    round: state.round,
    bracket: state.matches[0]?.bracket ?? null,
    left: stillIn(state).length,
    total: state.total,
  }
}
