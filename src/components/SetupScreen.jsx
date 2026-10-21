import { useMemo, useState } from 'react'
import { getPokemonPool } from '../data/pokedex.js'
import { EMPTY_FILTERS, GAME_GROUPS, GENERATIONS, TYPES } from '../data/filters.js'
import { TYPE_LABELS } from '../data/typeArt.js'
import { DOUBLE_ELIMINATION, MODES, estimatePicks } from '../game/modes.js'
import { useI18n } from '../i18n/useI18n.js'
import GameTile from './GameTile.jsx'

const ALL_GAMES = GAME_GROUPS.flatMap((group) => group.games)

// Toggle a value while keeping the selection in the options' display order.
function toggle(selected, value, options) {
  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
  return options.filter((option) => next.includes(option))
}

function Chip({ checked, onChange, children, title, className = 'chip' }) {
  return (
    <label className={`${className}${checked ? ` ${className}-checked` : ''}`} title={title}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

function FilterSection({ legend, count, onClear, children }) {
  const { t } = useI18n()

  return (
    <fieldset className="filter-section">
      <legend className="filter-legend">{legend}</legend>
      <div className="filter-status">
        <span>{count === 0 ? t('any') : t('selected', count)}</span>
        {count > 0 && (
          <button type="button" className="filter-clear" onClick={onClear}>
            {t('clear')}
          </button>
        )}
      </div>
      {children}
    </fieldset>
  )
}

// Above this many Pokémon, double elimination suggests starting with Gen I.
const SUGGEST_ABOVE = 200
const GEN_ONE = { ...EMPTY_FILTERS, generations: [1] }

// How to play and which Pokémon to play with. Within a filter section any
// selected option matches; across sections all must match (Gen I + Fire = Fire
// types from Gen I).
function SetupScreen({ initialFilters, initialMode, onStart, onQuickStart }) {
  const { t, generationLabel, regionName, typeName, gameName } = useI18n()
  const [mode, setMode] = useState(initialMode)
  const [filters, setFilters] = useState(initialFilters)
  const pool = useMemo(() => getPokemonPool(filters), [filters])
  const canStart = pool.length >= 2
  const suggestGenOne = mode === DOUBLE_ELIMINATION && pool.length > SUGGEST_ABOVE

  function update(key, values) {
    setFilters((current) => ({ ...current, [key]: values }))
  }

  const generationValues = GENERATIONS.map((gen) => gen.value)

  return (
    <>
      <section className="setup" aria-label={t('newGame')}>
        <h2 className="setup-title">{t('newGame')}</h2>

        <fieldset className="filter-section">
          <legend className="filter-legend">{t('mode')}</legend>
          <div className="choice-list">
            {MODES.map((value) => (
              <label
                key={value}
                className={`choice-card${mode === value ? ' choice-card-checked' : ''}`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span className="choice-title">{t(`${value}Mode`)}</span>
                <span className="choice-body">{t(`${value}ModeBody`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <h3 className="setup-subtitle">{t('chooseTitle')}</h3>
        <p className="setup-hint">{t('setupHint')}</p>

        <FilterSection
          legend={t('generation')}
          count={filters.generations.length}
          onClear={() => update('generations', [])}
        >
          <div className="chip-list">
            {GENERATIONS.map((gen) => (
              <Chip
                key={gen.value}
                title={regionName(gen.region)}
                checked={filters.generations.includes(gen.value)}
                onChange={() =>
                  update('generations', toggle(filters.generations, gen.value, generationValues))
                }
              >
                {generationLabel(gen.value)}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          legend={t('type')}
          count={filters.types.length}
          onClear={() => update('types', [])}
        >
          <div className={`chip-list type-list${filters.types.length > 0 ? ' type-list-active' : ''}`}>
            {TYPES.map((type) => (
              <Chip
                key={type}
                className="type-chip"
                checked={filters.types.includes(type)}
                onChange={() => update('types', toggle(filters.types, type, TYPES))}
              >
                {TYPE_LABELS.has(type) ? (
                  <img
                    src={TYPE_LABELS.get(type)}
                    alt={typeName(type)}
                    title={typeName(type)}
                    width="200"
                    height="40"
                  />
                ) : (
                  typeName(type)
                )}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          legend={t('game')}
          count={filters.games.length}
          onClear={() => update('games', [])}
        >
          <details className="game-groups" open={initialFilters.games.length > 0}>
            <summary>{t('showGames')}</summary>
            {GAME_GROUPS.map((group) => (
              <div key={group.label} className="game-group">
                <h3 className="game-group-title">
                  {group.generation ? generationLabel(group.generation) : t('otherGames')}
                </h3>
                <div className="game-chip-list">
                  {group.games.map((game) => (
                    <Chip
                      key={game}
                      className="game-chip"
                      checked={filters.games.includes(game)}
                      onChange={() => update('games', toggle(filters.games, game, ALL_GAMES))}
                    >
                      <GameTile game={game} />
                      <span className="game-chip-name">{gameName(game)}</span>
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </details>
        </FilterSection>

        {suggestGenOne && (
          <div className="suggestion" role="note">
            <p>{t('suggestGenOne', pool.length, estimatePicks(pool.length))}</p>
            <button
              type="button"
              className="restart restart-subtle"
              onClick={() => setFilters(GEN_ONE)}
            >
              {t('useGenOne')}
            </button>
          </div>
        )}

        <div className="setup-start">
          <p className="setup-count" aria-live="polite">
            <strong>{pool.length}</strong> {t('pokemonMatch')}
            {!canStart && <span className="setup-warning">{t('pickAtLeastTwo')}</span>}
          </p>
          <button
            type="button"
            className="restart"
            disabled={!canStart}
            onClick={() => onStart(filters, pool, mode)}
          >
            {t('start')}
          </button>
        </div>
        <p className="setup-switch">
          <button type="button" className="link-button" onClick={onQuickStart}>
            {t('tryQuickStart')}
          </button>
        </p>
      </section>
    </>
  )
}

export default SetupScreen
