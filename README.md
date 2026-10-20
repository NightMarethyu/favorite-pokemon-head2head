# Favorite Pokémon Head-to-Head

A small website for finding your favorite Pokémon by picking between them two at a time.

## The idea

Two Pokémon are shown side by side (stacked on small screens). You pick the one you like more, then a new matchup appears.

## How it plays

The game has two rounds: a main round that goes through every Pokémon you chose, then **Sudden Death** to rank the best of them.

### Choosing your Pokémon

Before the game starts, narrow the pool by **Generation**, **Type**, and **Game**. Leave a section empty to include everything. Within a section, a Pokémon only needs to match one of the selected options; across sections it must match all of them, so Gen I + Fire plays the Fire types from Gen I. The screen shows how many Pokémon match, and you need at least two to play. **Change filters** (during a game or at the end) brings you back here with your last choices kept.

### Main round

- Every Pokémon in the pool appears exactly once, in a random order.
- The winner of each matchup stays on the left (on top on mobile) as the champion. The number in its bottom-left corner counts how many Pokémon it has beaten in a row.
- When a challenger wins, it becomes the new champion with 1 win.
- **★ Favorite** sends a Pokémon straight to Sudden Death and takes it out of the main round. Without this, a Pokémon you love would knock out every other Pokémon you like until it was beaten, so they would end up with few or no wins. Marked favorites are listed under **Favorites**; remove one with **×** to put it back into the draw.
- **Your Team** lists the six Pokémon with the longest win streaks, including the current champion.

### Sudden Death

- Once every Pokémon has been shown, your favorites and the six longest win streaks from the main round face off.
- Each finalist is placed into a ranking by comparing it with Pokémon already ranked (a binary search), so you only make about *n* × log₂ *n* picks. Losing here only moves a Pokémon down the ranking; it is never knocked out.
- **Your Final Team** is the top six of that ranking.

### Saved games

- Every pick is saved in your browser (`localStorage`), so closing the tab or reloading picks up right where you left off.
- You can keep several games going at once. **Change filters** takes you back to the start screen, where **Saved Games** lists each game with its filters, progress, and when you last played it. **Continue** resumes one; **Delete** removes it. Starting a new game never overwrites an old one.
- Finished games stay in the list so you can look at your final team again.
- Saves stay in the browser they were made in. Up to 20 are kept; after that the least recently played is removed.

### Controls

- Click a card, or use the arrow keys (←/↑ for the left card, →/↓ for the right card).
- Hold **Shift** with an arrow key to mark that Pokémon as a favorite.
- Dark mode is the default; the toggle in the header switches to light mode and remembers your choice.

## Status

- [x] Gather the Pokémon data and save it as a static file in the repo
- [x] Plan the matchup logic and the page design
- [x] Build the head-to-head interface (names only)
- [x] Favorites and a Sudden Death round, so a top favorite can't block the Pokémon ranked just below it
- [x] Add Pokémon sprites
- [x] Choose a generation, game, or type to play with
- [x] Save game progress in the browser (`localStorage`), with several saved games at once
- [ ] Double-elimination mode for players who don't know the Pokémon well yet and have no favorites to mark: every Pokémon gets a second chance after its first loss, so one strong early pick can't knock out the rest
- [ ] Show which games (if any) you could build your final team in
- [ ] A 3×3 grid of your favorite Pokémon
- [ ] Multi-language support (the data already has names in English, Japanese, Chinese, and French)
- [ ] Pokémon knowledge quizzes: which has the higher base-stat total, egg groups, abilities, and more
- [ ] Type icons on the type filter (and cards) for more visual impact
- [ ] Game cover art or title logos on the game filter for more visual impact

## Project layout

| Path                         | What it holds                                                        |
| ---------------------------- | -------------------------------------------------------------------- |
| `src/data/`                  | Pokémon JSON; `pokedex.js`, which normalizes it, attaches sprites, and builds the pool (`getPokemonPool(filters)`); `filters.js`, the generation, game, and type options |
| `src/game/`                  | Pure game logic (`head2head.js`), its React hook (`useHead2Head.js`), and saved games in `localStorage` (`saves.js`) |
| `src/components/`            | UI components                                                        |
| `src/hooks/`                 | Dark/light theme state (`useTheme.js`) and the saved games list (`useSaves.js`) |
| `src/assets/images/sprites/` | One sprite per Pokémon, named by Pokédex number (`0001.png`)        |
| `src/assets/fonts/`          | Self-hosted VT323 and Bytesized fonts, with their licenses (OFL)    |

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/) (JavaScript)
- [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting
- Hosted on [GitHub Pages](https://pages.github.com/), built and deployed by GitHub Actions

Pokémon data is fetched ahead of time and committed as a static file, so the site needs no backend. Picks are saved in the visitor's browser. If the project later moves to a full MERN stack, picks would move to a database.

## Getting started

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Then open the local URL Vite prints (by default <http://localhost:5173/favorite-pokemon-head2head/>).

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload           |
| `npm run build`   | Build the production site into `dist/`         |
| `npm run preview` | Serve the `dist/` build locally to check it    |
| `npm run lint`    | Lint the code with oxlint                      |

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which lints, builds, and publishes `dist/` to GitHub Pages. It can also be run by hand from the **Actions** tab.

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

The site is published at <https://nightmarethyu.github.io/favorite-pokemon-head2head/>. Because it is served from a subpath, `base` in `vite.config.js` is set to `/favorite-pokemon-head2head/`. If the repository is renamed or moved to a custom domain, update `base` to match.

## License

See [LICENSE](LICENSE).

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc. This is an unofficial fan project and is not affiliated with or endorsed by them.
