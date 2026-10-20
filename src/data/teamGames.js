import { GAME_GROUPS } from './filters.js'

// Which games a team could be put together in, using each Pokémon's
// `catchable` games: where it can be caught, evolved, or received in the game
// itself, not only traded or transferred in from another game.
//
// A game counts with its DLC. The data already files most DLC areas under the
// base game; the few listed separately are folded back in here. Pokéwalker and Dream World are add-ons to other games, not
// games of their own, so they aren't offered.

const DLC = {
  Sword: ['Sword Expansion Pass'],
  Shield: ['Shield Expansion Pass'],
  Scarlet: ['The Hidden Treasure of Area Zero (Scarlet)'],
  Violet: ['The Hidden Treasure of Area Zero (Violet)'],
}

const NOT_GAMES = new Set(['Pokéwalker', 'Dream World', ...Object.values(DLC).flat()])

// Versions released together that can trade with each other.
const VERSION_PAIRS = [
  ['Red', 'Blue'],
  ['Gold', 'Silver'],
  ['Ruby', 'Sapphire'],
  ['FireRed', 'LeafGreen'],
  ['Diamond', 'Pearl'],
  ['HeartGold', 'SoulSilver'],
  ['Black', 'White'],
  ['Black 2', 'White 2'],
  ['X', 'Y'],
  ['Omega Ruby', 'Alpha Sapphire'],
  ['Sun', 'Moon'],
  ['Ultra Sun', 'Ultra Moon'],
  ["Let's Go Pikachu", "Let's Go Eevee"],
  ['Sword', 'Shield'],
  ['Brilliant Diamond', 'Shining Pearl'],
  ['Scarlet', 'Violet'],
]

// The games to check, in release order, each with the games it includes.
export const TEAM_GAMES = GAME_GROUPS.flatMap((group) => group.games)
  .filter((game) => !NOT_GAMES.has(game))
  .map((game) => ({ game, includes: [game, ...(DLC[game] ?? [])] }))

const BY_GAME = new Map(TEAM_GAMES.map((entry) => [entry.game, entry]))

// How many of the closest games to show when no game has the whole team.
const CLOSEST_LIMIT = 4

// How a team fits one set of games: which members it can't get.
function check(team, games) {
  const all = new Set(games.flatMap((game) => BY_GAME.get(game)?.includes ?? [game]))
  const missing = team.filter((pokemon) => !pokemon.catchable.some((game) => all.has(game)))
  return { games, missing }
}

/**
 * Where a team of Pokémon can be put together.
 *
 * Returns { kind, matches }:
 *   - kind 'single': one game has every member. matches: [{ games: [game] }]
 *   - kind 'pair': no single game does, but two paired versions trading do.
 *     matches: [{ games: [a, b] }]
 *   - kind 'closest': nothing has every member; the games with the most.
 *     matches: [{ games: [game], missing }], each missing at least one.
 *   - kind 'none': the team is empty.
 */
export function findTeamGames(team) {
  if (team.length === 0) return { kind: 'none', matches: [] }

  const singles = TEAM_GAMES.map(({ game }) => check(team, [game]))
  const full = singles.filter((result) => result.missing.length === 0)
  if (full.length > 0) return { kind: 'single', matches: full }

  const pairs = VERSION_PAIRS.filter((pair) => pair.every((game) => BY_GAME.has(game)))
    .map((pair) => check(team, pair))
    .filter((result) => result.missing.length === 0)
  if (pairs.length > 0) return { kind: 'pair', matches: pairs }

  const best = Math.min(...singles.map((result) => result.missing.length))
  const closest = singles
    .filter((result) => result.missing.length < team.length)
    .sort((a, b) => a.missing.length - b.missing.length)
    .slice(0, CLOSEST_LIMIT)
    // Don't list a game that is much further off than the best one.
    .filter((result) => result.missing.length <= best + 1)
  return { kind: 'closest', matches: closest }
}
