import { describeFilters } from '../data/filters.js'
import { ALL_POKEMON } from '../data/pokedex.js'
import { useI18n } from '../i18n/useI18n.js'
import SavedGames from './SavedGames.jsx'

const byId = (id) => ALL_POKEMON.find((pokemon) => pokemon.id === id)
// Pikachu and Eevee face off on the title screen.
const MASCOTS = [byId(25), byId(133)].filter(Boolean)

// The title screen: continue the last game, or start one with as many or as
// few options as the player wants.
function HomeScreen({ lastGame, saves, onNewcomer, onExpert, onResume, onDelete, onImport }) {
  const i18n = useI18n()
  const { t } = i18n

  return (
    <>
      <section className="home-hero">
        <h1 className="home-title">{t('siteTitle')}</h1>
        <p className="home-tagline">{t('tagline')}</p>
        {MASCOTS.length === 2 && (
          <div className="home-mascots" aria-hidden="true">
            <img src={MASCOTS[0].sprite} alt="" />
            <span className="versus">{t('versus')}</span>
            <img src={MASCOTS[1].sprite} alt="" />
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
