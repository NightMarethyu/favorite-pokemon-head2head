import { useEffect } from 'react'
import MatchupCard from './MatchupCard.jsx'

const LEFT_KEYS = ['ArrowLeft', 'ArrowUp']
const RIGHT_KEYS = ['ArrowRight', 'ArrowDown']

function Arena({ champion, challenger, streak, onPickLeft, onPickRight }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (LEFT_KEYS.includes(event.key)) {
        event.preventDefault()
        onPickLeft()
      } else if (RIGHT_KEYS.includes(event.key)) {
        event.preventDefault()
        onPickRight()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPickLeft, onPickRight])

  return (
    <section className="arena" aria-label="Pick your favorite">
      <MatchupCard
        pokemon={champion}
        label={streak > 0 ? 'Champion' : 'Contender'}
        wins={streak}
        onPick={onPickLeft}
      />
      <span className="versus" aria-hidden="true">
        VS
      </span>
      <MatchupCard pokemon={challenger} label="Challenger" onPick={onPickRight} />
    </section>
  )
}

export default Arena
