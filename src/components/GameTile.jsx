import { gameArt, gameInitials } from '../data/gameArt.js'

// The game's art once it has some; until then a tile with its initials. The
// name is always shown beside it, so the tile itself is decorative.
function GameTile({ game }) {
  const art = gameArt(game)
  if (art) return <img className="game-tile game-tile-art" src={art} alt="" draggable={false} />
  return (
    <span className="game-tile" aria-hidden="true">
      {gameInitials(game)}
    </span>
  )
}

export default GameTile
