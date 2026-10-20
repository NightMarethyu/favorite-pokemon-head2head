import { useState } from 'react'
import { describeFilters } from '../data/filters.js'
import { ALL_POKEMON } from '../data/pokedex.js'
import { STARTERS } from '../data/starters.js'
import { shuffle } from '../game/head2head.js'
import { useI18n } from '../i18n/useI18n.js'
import SavedGames from './SavedGames.jsx'

// Two of these face off on the title screen, picked fresh on each visit:
// Pikachu, Eevee, and every generation's starters.
const MASCOT_IDS = [25, 133, ...Object.values(STARTERS).flat()]

function pickMascots() {
  const pool = ALL_POKEMON.filter((pokemon) => MASCOT_IDS.includes(pokemon.id) && pokemon.sprite)
  return shuffle(pool).slice(0, 2)
}

// The title screen: continue the last game, or start one with as many or as
// few options as the player wants.
function HomeScreen({ lastGame, saves, onNewcomer, onExpert, onResume, onDelete, onImport }) {
  const i18n = useI18n()
  const { t } = i18n
  const [mascots] = useState(pickMascots)

  return (
    <>
      <section className="home-hero">
        <h1 className="home-title">{t('siteTitle')}</h1>
        <p className="home-tagline">{t('tagline')}</p>
        {mascots.length === 2 && (
          <div className="home-mascots" aria-hidden="true">
            <img src={mascots[0].sprite} alt="" />
            <span className="versus">{t('versus')}</span>
            <img src={mascots[1].sprite} alt="" />
          </div>
        )}
        {lastGame && (
          <button
            type="button"
            className="restart home-continue"
            onClick={() => onResume(lastGame.id)}
          >
            {t('continueGame', describeFilters(lastGame.filters, i18n))}
          </button>
        )}
      </section>

      <section className="home-choice" aria-labelledby="home-question">
        <h2 id="home-question" className="setup-title">
          {t('familiarQuestion')}
        </h2>
        <div className="choice-list">
          <button type="button" className="choice-card" onClick={onNewcomer}>
            <span className="choice-title">{t('newcomerTitle')}</span>
            <span className="choice-body">{t('newcomerBody')}</span>
          </button>
          <button type="button" className="choice-card" onClick={onExpert}>
            <span className="choice-title">{t('expertTitle')}</span>
            <span className="choice-body">{t('expertBody')}</span>
          </button>
        </div>
      </section>

      <SavedGames saves={saves} onResume={onResume} onDelete={onDelete} onImport={onImport} />
    </>
  )
}

export default HomeScreen
