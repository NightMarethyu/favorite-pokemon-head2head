import { useMemo } from 'react'
import { GAME_GROUPS } from '../data/filters.js'
import { findTeamGames } from '../data/teamGames.js'
import { useI18n } from '../i18n/useI18n.js'
import GameTile from './GameTile.jsx'

const LEADS = { single: 'teamGamesAll', pair: 'teamGamesPairs', closest: 'teamGamesClosest' }

// Games that have the whole team, grouped by generation. A team from the early
// generations fits in dozens of games, so these are kept small.
function GameGroups({ games }) {
  const { t, gameName, generationLabel } = useI18n()
  const found = new Map(games.map((match) => [match.games[0], match]))
  const groups = GAME_GROUPS.map((group) => ({
    ...group,
    matches: group.games.filter((game) => found.has(game)).map((game) => found.get(game)),
  })).filter((group) => group.matches.length > 0)

  return groups.map((group) => (
    <div key={group.label} className="game-group">
      <h3 className="game-group-title">
        {group.generation ? generationLabel(group.generation) : t('otherGames')}
      </h3>
      <ul className="team-games-grid">
        {group.matches.map(({ games: [game] }) => (
          <li key={game} className="team-games-cell">
            <GameTile game={game} />
            <span className="team-games-name">{gameName(game)}</span>
          </li>
        ))}
      </ul>
    </div>
  ))
}

// Which games the final team could be put together in.
function TeamGames({ team }) {
  const { t, gameName, pokemonName, list } = useI18n()
  const { kind, matches } = useMemo(() => findTeamGames(team), [team])
  if (kind === 'none') return null

  return (
    <section className="team-games" aria-label={t('teamGames')}>
      <h2 className="team-title">{t('teamGames')}</h2>
      <p className="team-games-lead">{t(LEADS[kind])}</p>
      {kind === 'single' ? (
        <GameGroups games={matches} />
      ) : (
        <ul className="team-games-list">
          {matches.map((match) => (
            <li key={match.games.join('+')} className="team-games-item">
              <span className="game-tiles">
                {match.games.map((game) => (
                  <GameTile key={game} game={game} />
                ))}
              </span>
              <span className="team-games-info">
                <span className="team-games-name">
                  {match.games.map(gameName).join(t('versionsJoin'))}
                </span>
                {kind === 'closest' && (
                  <span className="team-games-detail">
                    {t('teamGamesCount', team.length - match.missing.length, team.length)} ·{' '}
                    {t('teamGamesMissing', list(match.missing.map(pokemonName)))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="saves-note">{t('teamGamesNote')}</p>
    </section>
  )
}

export default TeamGames
