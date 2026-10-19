import { useEffect } from 'react'
import MatchupCard from './MatchupCard.jsx'

const LEFT_KEYS = ['ArrowLeft', 'ArrowUp']
const RIGHT_KEYS = ['ArrowRight', 'ArrowDown']

// Shift + arrow marks that side as a favorite (main round only).
function Arena({
  champion,
  challenger,
  leftLabel,
  rightLabel,
  wins,
  onPickLeft,
  onPickRight,
  onFavoriteLeft,
  onFavoriteRight,
}) {
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
    <section className="arena" aria-label="Pick your favorite">
      <MatchupCard
        pokemon={champion}
        label={leftLabel}
        wins={wins}
        onPick={onPickLeft}
        onFavorite={onFavoriteLeft}
      />
      <span className="versus" aria-hidden="true">
        VS
      </span>
      <MatchupCard
        pokemon={challenger}
        label={rightLabel}
        onPick={onPickRight}
        onFavorite={onFavoriteRight}
      />
    </section>
  )
}

export default Arena
