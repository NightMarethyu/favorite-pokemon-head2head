// Addresses of the tools' pages, so any screen can link to them.

// A Pokémon's wiki page: '#wiki/25'.
export const wikiHash = (id) => `#wiki/${id}`

// The type chart with these defending types picked: '#types/Grass/Poison'.
export const typeChartHash = (types) => ['#types', ...types].join('/')
