# Favorite Pokémon Head-to-Head

A small static website for finding your favorite Pokémon by picking between them two at a time.

## The idea

Two Pokémon are shown side by side. You choose the one you like more, then a new matchup appears. Over many matchups, your picks narrow down to your favorite.

## Status

🚧 **Coming soon.** The site currently shows a placeholder page. The next steps are:

- [ ] Gather the Pokémon data (names, images, and any other details to show)
- [ ] Plan the matchup logic and the page design
- [ ] Build the head-to-head interface

## Hosting

The site is hosted with [GitHub Pages](https://pages.github.com/) and served as plain static files from the root of the default branch. `index.html` is the entry point, and the empty `.nojekyll` file tells GitHub Pages to serve the files as-is without running Jekyll.

To turn on GitHub Pages for this repository:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder, then save.

Once it is published, the site will be at `https://nightmarethyu.github.io/favorite-pokemon-head2head/`.

## Running locally

No build step is needed. Open `index.html` in a browser, or serve the folder with any static server, for example:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## License

See [LICENSE](LICENSE).

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc. This is an unofficial fan project and is not affiliated with or endorsed by them.
