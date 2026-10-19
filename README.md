# Favorite Pokémon Head-to-Head

A small website for finding your favorite Pokémon by picking between them two at a time.

## The idea

Two Pokémon are shown side by side. You choose the one you like more, then a new matchup appears. Over many matchups, your picks narrow down to your favorite.

## Status

🚧 **Coming soon.** The site currently shows a placeholder page. The next steps are:

- [ ] Gather the Pokémon data and save it as a static file in the repo
- [ ] Decide how to handle Pokémon images (link to an external source or keep copies in the repo)
- [ ] Plan the matchup logic and the page design
- [ ] Build the head-to-head interface
- [ ] Save picks in the browser (`localStorage`)

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
