import { useEffect, useMemo } from 'react'
import { useHead2Head } from '../game/useHead2Head.js'
import { useI18n } from '../i18n/useI18n.js'
import Arena from './Arena.jsx'
import FavoritesPanel from './FavoritesPanel.jsx'
import GameOver from './GameOver.jsx'
import TeamGames from './TeamGames.jsx'
import TeamPanel from './TeamPanel.jsx'

function teamTitleKey(phase) {
  if (phase === 'over') return 'yourFinalTeam'
  if (phase === 'suddenDeath') return 'rankingSoFar'
  if (phase === 'bracket') return 'bestSoFar'
  return 'yourTeam'
}

// Start loading the next sprites so they show up straight away.
function usePreloadSprites(pokemon) {
  useEffect(() => {
    for (const { sprite } of pokemon) {
      if (!sprite) continue
      const image = new Image()
      image.src = sprite
    }
  }, [pokemon])
}

const BRACKET_TITLES = {
  winners: 'winnersBracket',
  losers: 'losersBracket',
  final: 'final',
  rematch: 'finalRematch',
}

// A Pokémon's card label in double elimination: whether it can still lose once.
const recordLabel = (record, t) => (record.losses === 0 ? t('undefeated') : t('lastChance'))

function Game({ pool, initialState, filterLabel, onSave, onChangeFilters }) {
  const { t } = useI18n()
  const game = useHead2Head(pool, initialState)
  usePreloadSprites(game.upcoming)
  const finalTeam = useMemo(() => game.team.map((member) => member.pokemon), [game.team])

  // Save after every pick so the game can be picked up again later.
  useEffect(() => {
    onSave?.(game.state)
  }, [game.state, onSave])

  return (
    <>
      <p className="filter-summary">{filterLabel}</p>

      {game.isOver ? (
        <GameOver
          champion={game.champion}
          onRestart={game.restart}
          onChangeFilters={onChangeFilters}
        />
      ) : game.phase === 'bracket' ? (
        <>
          <p className="progress">
            <strong className="phase-title">{t(BRACKET_TITLES[game.bracket.bracket])}</strong>
            {t('roundStillIn', game.bracket.round, game.bracket.left, game.bracket.total)}
          </p>
          <Arena
            champion={game.champion}
            challenger={game.challenger}
            leftLabel={recordLabel(game.match.left, t)}
            rightLabel={recordLabel(game.match.right, t)}
            wins={game.match.left.wins}
            rightWins={game.match.right.wins}
            onPickLeft={game.pickLeft}
            onPickRight={game.pickRight}
          />
          <p className="bracket-hint">{t('bracketHint')}</p>
        </>
      ) : game.phase === 'suddenDeath' ? (
        <>
          <p className="progress">
            <strong className="phase-title">{t('suddenDeath')}</strong>
            {t('placing', game.suddenDeath.placing, game.suddenDeath.total)}
          </p>
          <Arena
            champion={game.champion}
            challenger={game.challenger}
            leftLabel={t('finalist')}
            rightLabel={t('finalist')}
            onPickLeft={game.pickLeft}
            onPickRight={game.pickRight}
          />
        </>
      ) : (
        <>
          <p className="progress">{t('left', game.remaining, game.total)}</p>
          <Arena
            champion={game.champion}
            challenger={game.challenger}
            leftLabel={game.streak > 0 ? t('champion') : t('contender')}
            rightLabel={t('challenger')}
            wins={game.streak}
            onPickLeft={game.pickLeft}
            onPickRight={game.pickRight}
            onFavoriteLeft={game.favoriteLeft}
            onFavoriteRight={game.favoriteRight}
          />
        </>
      )}

      <TeamPanel team={game.team} title={t(teamTitleKey(game.phase))} linked={game.isOver} />

      {game.isOver && <TeamGames team={finalTeam} />}

      {game.phase === 'main' && (
        <FavoritesPanel favorites={game.favorites} onRemove={game.unfavorite} />
      )}

      {!game.isOver && (
        <div className="game-actions">
          <button type="button" className="restart restart-subtle" onClick={game.restart}>
            {t('startOver')}
          </button>
          <button type="button" className="restart restart-subtle" onClick={onChangeFilters}>
            {t('changeFilters')}
          </button>
        </div>
      )}
    </>
  )
}

export default Game
