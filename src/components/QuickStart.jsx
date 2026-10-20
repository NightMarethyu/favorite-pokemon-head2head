import { useMemo, useState } from 'react'
import { EMPTY_FILTERS, GENERATIONS } from '../data/filters.js'
import { ALL_POKEMON, getPokemonPool } from '../data/pokedex.js'
import { DOUBLE_ELIMINATION, estimatePicks } from '../game/modes.js'
import { useI18n } from '../i18n/useI18n.js'

// Each generation's three starter Pokémon, shown on its tile.
const STARTERS = {
  1: [1, 4, 7],
  2: [152, 155, 158],
  3: [252, 255, 258],
  4: [387, 390, 393],
  5: [495, 498, 501],
  6: [650, 653, 656],
  7: [722, 725, 728],
  8: [810, 813, 816],
  9: [906, 909, 912],
}

const SPRITES = new Map(ALL_POKEMON.map((pokemon) => [pokemon.id, pokemon.sprite]))

// 0 stands for every generation.
const ALL = 0
const RECOMMENDED = 1

const filtersFor = (generation) =>
  generation === ALL ? EMPTY_FILTERS : { ...EMPTY_FILTERS, generations: [generation] }

// A previous single-generation choice is kept; anything else starts on Gen I.
function initialChoice(filters) {
  const { generations, games, types } = filters
  if (games.length > 0 || types.length > 0 || generations.length > 1) return RECOMMENDED
  return generations[0] ?? RECOMMENDED
}

// The short way in for players who don't know many Pokémon: pick one
// generation (Gen I suggested) and play double elimination.
function QuickStart({ initialFilters, onStart, onMoreOptions }) {
  const { t, generationLabel, regionName } = useI18n()
  const [choice, setChoice] = useState(() => initialChoice(initialFilters))
  const counts = useMemo(
    () =>
      new Map(
        [ALL, ...GENERATIONS.map((gen) => gen.value)].map((value) => [
          value,
          getPokemonPool(filtersFor(value)).length,
        ]),
      ),
    [],
  )
  const options = [...GENERATIONS.map((gen) => gen.value), ALL]

  function start() {
    const filters = filtersFor(choice)
    onStart(filters, getPokemonPool(filters), DOUBLE_ELIMINATION)
  }

  return (
    <section className="setup quick" aria-labelledby="quick-title">
      <h2 id="quick-title" className="setup-title">
        {t('quickTitle')}
      </h2>
      <p className="setup-hint">{t('quickHint')}</p>

      <div className="group-list" role="radiogroup" aria-labelledby="quick-title">
        {options.map((value) => {
          const gen = GENERATIONS.find((entry) => entry.value === value)
          const checked = choice === value
          return (
            <label key={value} className={`group-tile${checked ? ' group-tile-checked' : ''}`}>
              <input
                type="radio"
                name="quick-group"
                checked={checked}
                onChange={() => setChoice(value)}
              />
              <span className="group-name">
                {gen ? generationLabel(value) : t('allPokemon')}
                {value === RECOMMENDED && <span className="badge">{t('recommended')}</span>}
              </span>
              <span className="group-detail">
                {gen && `${regionName(gen.region)} · `}
                {t('pokemonCount', counts.get(value))}
              </span>
              {STARTERS[value] && (
                <span className="group-sprites" aria-hidden="true">
                  {STARTERS[value].map(
                    (id) => SPRITES.get(id) && <img key={id} src={SPRITES.get(id)} alt="" />,
                  )}
                </span>
              )}
            </label>
          )
        })}
      </div>

      <div className="how-it-plays">
        <h3 className="how-title">{t('howItPlays')}</h3>
        <p>{t('doubleEliminationHow')}</p>
      </div>

      <div className="setup-start">
        <p className="setup-count" aria-live="polite">
          {t('aboutPicks', estimatePicks(counts.get(choice)))}
        </p>
        <button type="button" className="restart" onClick={start}>
          {t('start')}
        </button>
      </div>
      <p className="setup-switch">
        <button type="button" className="link-button" onClick={onMoreOptions}>
          {t('moreOptions')}
        </button>
      </p>
    </section>
  )
}

export default QuickStart
