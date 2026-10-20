// Cover art or logos for games, keyed by game name ('Sword'). Drop an image in
// src/assets/images/games/ named after the game's slug (gameSlug('Sword') is
// 'sword', "Let's Go Pikachu" is 'lets-go-pikachu') and it shows up in place of
// the placeholder. Vite copies the files into the build with hashed names.
const artFiles = import.meta.glob('../assets/images/games/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const ART_BY_SLUG = new Map(
  Object.entries(artFiles).map(([path, url]) => [path.match(/([^/]+)\.\w+$/)[1], url]),
)

export function gameSlug(game) {
  return game
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function gameArt(game) {
  return ART_BY_SLUG.get(gameSlug(game)) ?? null
}

// Short stand-in shown until a game has art: the first letter of each word
// ("Ultra Sun" -> "US", "Black 2" -> "B2"), or the first two letters of a
// one-word name so Sword and Shield differ ("Sw", "Sh").
export function gameInitials(game) {
  const words = game
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2)
  return words
    .map((word) => (/^\d+$/.test(word) ? word : word[0].toUpperCase()))
    .join('')
    .slice(0, 3)
}
