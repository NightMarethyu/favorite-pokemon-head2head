# Pick-a-Mon

A small website for finding your favorite Pokémon by picking between them two at a time.

## The idea

Two Pokémon are shown side by side (stacked on small screens). You pick the one you like more, then a new matchup appears.

## How it plays

### Home screen

The site opens on the **Pick-a-Mon** title screen. **Continue** picks up the last game you played, if it isn't finished. Otherwise it asks how well you know Pokémon:

- **I'm new to Pokémon** opens the quick start: pick one generation (Gen I, the original 151, is marked as recommended; each tile shows that generation's starters and how many Pokémon it has) and play double elimination. It shows about how many picks that will take.
- **I know my Pokémon** opens the full setup: every filter, and a choice between the two modes.

**Saved Games** are listed on the home screen too. The **Pick-a-Mon** title in the header goes back to it from anywhere.

### Modes

- **Classic**: a main round that goes through every Pokémon you chose, then **Sudden Death** to rank the best of them (below).
- **Double elimination**: a bracket where each Pokémon is out after its second loss (below). It needs no favorites, so it suits players who don't know the Pokémon well yet. It takes about twice as many picks as there are Pokémon, so when the pool is over 200 the setup screen suggests starting with Gen I and has a button to switch to it.

### Choosing your Pokémon

In the full setup, narrow the pool by **Generation**, **Type**, and **Game**. Leave a section empty to include everything. Within a section, a Pokémon only needs to match one of the selected options; across sections it must match all of them, so Gen I + Fire plays the Fire types from Gen I. The screen shows how many Pokémon match, and you need at least two to play. **Change filters** (during a game or at the end) goes back to the screen the game was set up on (quick start or full setup) with your last choices kept.

### Classic: main round

- Every Pokémon in the pool appears exactly once, in a random order.
- The winner of each matchup stays on the left (on top on mobile) as the champion. The number in its bottom-left corner counts how many Pokémon it has beaten in a row.
- When a challenger wins, it becomes the new champion with 1 win.
- **★ Favorite** sends a Pokémon straight to Sudden Death and takes it out of the main round. Without this, a Pokémon you love would knock out every other Pokémon you like until it was beaten, so they would end up with few or no wins. Marked favorites are listed under **Favorites**; remove one with **×** to put it back into the draw.
- **Your Team** lists the six Pokémon with the longest win streaks, including the current champion.

### Classic: Sudden Death

- Once every Pokémon has been shown, your favorites and the six longest win streaks from the main round face off.
- Each finalist is placed into a ranking by comparing it with Pokémon already ranked (a binary search), so you only make about *n* × log₂ *n* picks. Losing here only moves a Pokémon down the ranking; it is never knocked out.
- **Your Final Team** is the top six of that ranking.

### Double elimination

- Every Pokémon starts in the **winners bracket**. Its first loss moves it to the **second chance** bracket; its second loss knocks it out.
- Play goes in rounds. Each round pairs up the Pokémon waiting in each bracket at random (with an odd number, one sits the round out), winners-bracket matches first.
- When one Pokémon is left in each bracket they meet in the **final**. If the second-chance Pokémon wins, both have one loss, so a **final rematch** decides it.
- A pool of *n* Pokémon takes 2*n* − 2 picks (one more if the final goes to a rematch): about 300 for Gen I.
- Each card shows whether the Pokémon is still unbeaten or on its last chance, and its wins. **Doing Best So Far** lists the six still in with the fewest losses, then the most wins.
- **Your Final Team** is the champion, then the rest by how long they lasted (later rounds first, more wins breaking ties).

### Games for your team

When the game ends, **Games for Your Team** lists every main-series game your final team can be put together in, grouped by generation. Only Pokémon you can catch, evolve, or be given in that game count; ones that only arrive by trade, event, or transfer (Pokémon HOME, Poké Transfer, Pal Park) don't. DLC areas count toward their game.

- If no single game has the whole team, it lists paired versions that do when you trade between them (Sword + Shield, for example).
- If not even that works, it shows the games that come closest and which Pokémon each is missing.
- Each game has a placeholder tile with its initials until its art is added (see **Game art** below).

### Languages

The site is in English, Japanese, Chinese (Simplified), and French. On the first visit it uses the first of your browser's preferred languages that it has, without asking, and falls back to English. The language button (next to the theme toggle) switches it and remembers your choice. Pokémon names come from the data; type, game, and region names and the rest of the text are in `src/i18n/messages.js`. The type label cards are images with English text, so they stay in English.

### Saved games

- Every pick is saved in your browser (`localStorage`), so closing the tab or reloading picks up right where you left off.
- You can keep several games going at once. **Saved Games** on the home screen lists each game with its mode, filters, progress, and when you last played it. **Continue** resumes one; **Delete** removes it. Starting a new game never overwrites an old one.
- Finished games stay in the list so you can look at your final team again.
- Saves stay in the browser they were made in. Up to 20 are kept; after that the least recently played is removed.
- To move games to another device or browser, use **Export** on a game (or **Export all**) to download a `.json` save file, then **Import** it on the other device. Importing never duplicates a game: if the same game is already there, the copy played more recently is kept.

### Controls

- Click a card, or use the arrow keys (←/↑ for the left card, →/↓ for the right card).
- In classic mode, hold **Shift** with an arrow key to mark that Pokémon as a favorite.
- Dark mode is the default; the toggle in the header switches to light mode and remembers your choice.

### Game art

Put a cover or logo for a game in `src/assets/images/games/`, named after the game's slug: lowercase, accents and apostrophes dropped, other punctuation and spaces turned into `-` (`sword.png`, `lets-go-pikachu.png`, `legends-arceus.png`, `blue-japan.png`). PNG, JPG, WebP, and SVG all work. It replaces the placeholder tile on the next build; no code change is needed.

## Status

- [x] Gather the Pokémon data and save it as a static file in the repo
- [x] Plan the matchup logic and the page design
- [x] Build the head-to-head interface (names only)
- [x] Favorites and a Sudden Death round, so a top favorite can't block the Pokémon ranked just below it
- [x] Add Pokémon sprites
- [x] Choose a generation, game, or type to play with
- [x] Save game progress in the browser (`localStorage`), with several saved games at once
- [x] Double-elimination mode for players who don't know the Pokémon well yet and have no favorites to mark: every Pokémon gets a second chance after its first loss, so one strong early pick can't knock out the rest
- [x] Pick-a-Mon title screen, with a quick start for newcomers (one generation, Gen I suggested) and the full setup for everyone else
- [x] Show which games (if any) you could build your final team in (game art still to come)
- [ ] A 3×3 grid of your favorite Pokémon
- [x] Multi-language support: English, Japanese, Chinese, and French
- [ ] Pokémon knowledge quizzes: which has the higher base-stat total, egg groups, abilities, and more
- [x] Type label cards on the type filter, and type icons beside each Pokémon's name on the matchup cards
- [ ] Game cover art or title logos on the game filter for more visual impact
- [ ] Link each Pokémon and type to more info: either its Bulbapedia page or a small internal wiki page

## Project layout

| Path                         | What it holds                                                        |
| ---------------------------- | -------------------------------------------------------------------- |
| `src/data/`                  | Pokémon JSON; `pokedex.js`, which normalizes it, attaches sprites, and builds the pool (`getPokemonPool(filters)`); `filters.js`, the generation, game, and type options; `teamGames.js`, which games a team fits in; `gameArt.js` and `typeArt.js`, the artwork |
| `src/game/`                  | Pure game logic (`head2head.js`), its React hook (`useHead2Head.js`), and saved games in `localStorage` (`saves.js`) |
| `src/components/`            | UI components                                                        |
| `src/i18n/`                  | Languages, browser-language detection, every piece of site text per language (`messages.js`), and the `useI18n()` hook |
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
