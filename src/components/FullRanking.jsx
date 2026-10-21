import { useMemo, useState } from 'react'
import { wikiHash } from '../data/links.js'
import { rankingCsv, selectFullRanking } from '../game/fullRanking.js'
import { CLASSIC, gameMode } from '../game/modes.js'
import { useI18n } from '../i18n/useI18n.js'

// Hands the browser a CSV file to save.
function downloadCsv(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// pick-a-mon-ranking-2026-10-21.csv
function csvFilename() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `pick-a-mon-ranking-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`
}

// Every Pokémon in a finished game, ranked, behind a button. Also downloads as CSV.
function FullRanking({ state, pool }) {
  const { t, pokemonName } = useI18n()
  const [open, setOpen] = useState(false)
  const rows = useMemo(() => selectFullRanking(state, pool), [state, pool])
  const showFavorite = gameMode(state) === CLASSIC
  if (rows.length === 0) return null

  return (
    <section className="full-ranking" aria-label={t('fullRanking')}>
      <h2 className="team-title">{t('fullRanking')}</h2>
      <p className="full-ranking-lead">
        {t(showFavorite ? 'fullRankingLeadClassic' : 'fullRankingLeadBracket')}
      </p>
      <div className="game-actions">
        <button
          type="button"
          className="restart"
          aria-expanded={open}
          aria-controls="full-ranking-table"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t('hideFullRanking') : t('showFullRanking', rows.length)}
        </button>
        <button
          type="button"
          className="restart restart-subtle"
          onClick={() => downloadCsv(rankingCsv(rows, pokemonName), csvFilename())}
        >
          {t('downloadCsv')}
        </button>
      </div>
      {open && (
        <div className="full-ranking-wrap" id="full-ranking-table">
          <table className="full-ranking-table">
            <thead>
              <tr>
                <th scope="col" className="full-ranking-num">
                  {t('rankingRank')}
                </th>
                <th scope="col">{t('rankingName')}</th>
                {showFavorite && (
                  // Just the star on phones, where the word would squeeze the names.
                  <th scope="col" className="full-ranking-fav" title={t('rankingFavorite')}>
                    <span className="full-ranking-fav-star" aria-hidden="true">
                      ★
                    </span>
                    <span className="full-ranking-fav-word">{t('rankingFavorite')}</span>
                  </th>
                )}
                <th scope="col" className="full-ranking-num">
                  {t('rankingWins')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ rank, pokemon, favorite, wins }) => {
                const name = pokemonName(pokemon)
                return (
                  <tr key={pokemon.id}>
                    <td className="full-ranking-num">{rank}</td>
                    <td>
                      <a
                        className="full-ranking-link"
                        href={wikiHash(pokemon.id)}
                        title={t('wikiOpen', name)}
                      >
                        {pokemon.sprite && (
                          <img
                            className="full-ranking-sprite"
                            src={pokemon.sprite}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span>{name}</span>
                      </a>
                    </td>
                    {showFavorite && (
                      <td className="full-ranking-fav">
                        {favorite && <span aria-label={t('rankingFavorite')}>★</span>}
                      </td>
                    )}
                    <td className="full-ranking-num">{wins}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default FullRanking
