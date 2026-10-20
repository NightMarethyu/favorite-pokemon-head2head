import { useI18n } from '../i18n/useI18n.js'

function GameOver({ champion, onRestart, onChangeFilters }) {
  const { t, pokemonName } = useI18n()

  return (
    <section className="game-over">
      <h2>{t('allDone')}</h2>
      {champion && (
        <>
          {champion.sprite && <img className="game-over-sprite" src={champion.sprite} alt="" />}
          <p>
            {t('yourFavorite')}
            <strong>{pokemonName(champion)}</strong>
          </p>
        </>
      )}
      <div className="game-actions">
        <button type="button" className="restart" onClick={onRestart}>
          {t('playAgain')}
        </button>
        <button type="button" className="restart restart-subtle" onClick={onChangeFilters}>
          {t('changeFilters')}
        </button>
      </div>
    </section>
  )
}

export default GameOver
