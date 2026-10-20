import { useMemo, useState } from 'react'
import { getPokemonPool } from '../data/pokedex.js'
import { GAME_GROUPS, GENERATIONS, TYPES } from '../data/filters.js'

const ALL_GAMES = GAME_GROUPS.flatMap((group) => group.games)

// Toggle a value while keeping the selection in the options' display order.
function toggle(selected, value, options) {
  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
  return options.filter((option) => next.includes(option))
}

function Chip({ checked, onChange, children, title }) {
  return (
    <label className={`chip${checked ? ' chip-checked' : ''}`} title={title}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

function FilterSection({ legend, count, onClear, children }) {
  return (
    <fieldset className="filter-section">
      <legend className="filter-legend">{legend}</legend>
      <div className="filter-status">
        <span>{count === 0 ? 'Any' : `${count} selected`}</span>
        {count > 0 && (
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {children}
    </fieldset>
  )
}

// Choose which Pokémon to play with. Within a section any selected option
// matches; across sections all must match (Gen I + Fire = Fire types from Gen I).
function SetupScreen({ initialFilters, onStart }) {
  const [filters, setFilters] = useState(initialFilters)
  const pool = useMemo(() => getPokemonPool(filters), [filters])
  const canStart = pool.length >= 2

  function update(key, values) {
    setFilters((current) => ({ ...current, [key]: values }))
  }

  const generationValues = GENERATIONS.map((gen) => gen.value)

  return (
    <section className="setup" aria-label="Choose your Pokémon">
      <h2 className="setup-title">Choose your Pokémon</h2>
      <p className="setup-hint">
        Leave a section empty to include everything. Sections combine: Gen I + Fire plays the
        Fire types from Gen I.
      </p>

      <FilterSection
        legend="Generation"
        count={filters.generations.length}
        onClear={() => update('generations', [])}
      >
        <div className="chip-list">
          {GENERATIONS.map((gen) => (
            <Chip
              key={gen.value}
              title={gen.region}
              checked={filters.generations.includes(gen.value)}
              onChange={() =>
                update('generations', toggle(filters.generations, gen.value, generationValues))
              }
            >
              {gen.label}
            </Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection legend="Type" count={filters.types.length} onClear={() => update('types', [])}>
        <div className="chip-list">
          {TYPES.map((type) => (
            <Chip
              key={type}
              checked={filters.types.includes(type)}
              onChange={() => update('types', toggle(filters.types, type, TYPES))}
            >
              {type}
            </Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection legend="Game" count={filters.games.length} onClear={() => update('games', [])}>
        <details className="game-groups" open={initialFilters.games.length > 0}>
          <summary>Show games</summary>
          {GAME_GROUPS.map((group) => (
            <div key={group.label} className="game-group">
              <h3 className="game-group-title">{group.label}</h3>
              <div className="chip-list">
                {group.games.map((game) => (
                  <Chip
                    key={game}
                    checked={filters.games.includes(game)}
                    onChange={() => update('games', toggle(filters.games, game, ALL_GAMES))}
                  >
                    {game}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </details>
      </FilterSection>

      <div className="setup-start">
        <p className="setup-count" aria-live="polite">
          <strong>{pool.length}</strong> Pokémon match
          {!canStart && <span className="setup-warning"> — pick at least 2 to play</span>}
        </p>
        <button
          type="button"
          className="restart"
          disabled={!canStart}
          onClick={() => onStart(filters, pool)}
        >
          Start
        </button>
      </div>
    </section>
  )
}

export default SetupScreen
