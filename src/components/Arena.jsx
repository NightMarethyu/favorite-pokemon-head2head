import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n.js'
import MatchupCard from './MatchupCard.jsx'

const LEFT_KEYS = ['ArrowLeft', 'ArrowUp']
const RIGHT_KEYS = ['ArrowRight', 'ArrowDown']

// Shift + arrow marks that side as a favorite (classic main round only).
function Arena({
  champion,
  challenger,
  leftLabel,
  rightLabel,
  wins,
  rightWins,
  onPickLeft,
  onPickRight,
  onFavoriteLeft,
  onFavoriteRight,
}) {
  const { t } = useI18n()

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const isLeft = LEFT_KEYS.includes(event.key)
      const isRight = RIGHT_KEYS.includes(event.key)
      if (!isLeft && !isRight) return
      const handler = event.shiftKey
        ? isLeft
          ? onFavoriteLeft
          : onFavoriteRight
        : isLeft
          ? onPickLeft
          : onPickRight
      if (!handler) return
      event.preventDefault()
      handler()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPickLeft, onPickRight, onFavoriteLeft, onFavoriteRight])

  return (
    <section className="arena" aria-label={t('pickYourFavorite')}>
      <MatchupCard
        pokemon={champion}
        label={leftLabel}
        wins={wins}
        onPick={onPickLeft}
        onFavorite={onFavoriteLeft}
      />
      <span className="versus" aria-hidden="true">
        {t('versus')}
      </span>
      <MatchupCard
        pokemon={challenger}
        label={rightLabel}
        wins={rightWins}
        onPick={onPickRight}
        onFavorite={onFavoriteRight}
      />
    </section>
  )
}

export default Arena
