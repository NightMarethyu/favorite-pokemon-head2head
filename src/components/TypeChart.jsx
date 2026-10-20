import { useEffect, useState } from 'react'
import { TYPES } from '../data/filters.js'
import { typeChartHash } from '../data/links.js'
import { TYPE_ICONS, TYPE_LABELS } from '../data/typeArt.js'
import { attackGroups, defenseGroups, effectiveness, multiplierText } from '../data/typeChart.js'
import { useI18n } from '../i18n/useI18n.js'
import MatchupGroups from './MatchupGroups.jsx'

const DEFEND = 'defend'
const ATTACK = 'attack'

const CELL_TEXT = { 2: '2', 0.5: '½', 0: '0' }

// '#types/Grass/Poison' -> ['Grass', 'Poison'], so other pages can link here
// with types picked.
function typesFromHash(hash) {
  const [, ...types] = hash.split('/')
  return types
    .map(decodeURIComponent)
    .filter((type) => TYPES.includes(type))
    .slice(0, 2)
}

// The type chart tool: what one or two types are weak to, what one type hits
// hard, and the whole 18 × 18 chart.
function TypeChart() {
  const { t, typeName } = useI18n()
  const [side, setSide] = useState(DEFEND)
  const [picked, setPicked] = useState(() => typesFromHash(window.location.hash))

  // Keep the address in step with the defending types, so it can be shared.
  useEffect(() => {
    const hash = typeChartHash(side === DEFEND ? picked : [])
    if (window.location.hash === hash) return
    const { pathname, search } = window.location
    window.history.replaceState(null, '', `${pathname}${search}${hash}`)
  }, [side, picked])

  const limit = side === DEFEND ? 2 : 1

  function choose(nextSide) {
    setSide(nextSide)
    if (nextSide === ATTACK) setPicked((current) => current.slice(-1))
  }

  // A third pick replaces the oldest, so switching types is one tap.
  function toggle(type) {
    setPicked((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type].slice(-limit),
    )
  }

  const names = picked.map(typeName).join(' / ')

  return (
    <section className="setup type-tool" aria-labelledby="type-chart-title">
      <h2 id="type-chart-title" className="setup-title">
        {t('typeChartTitle')}
      </h2>
      <p className="setup-hint">{t('typeChartHint')}</p>

      <div className="type-side" role="group" aria-label={t('typeChartTitle')}>
        {[DEFEND, ATTACK].map((value) => (
          <button
            key={value}
            type="button"
            className={`chip${side === value ? ' chip-checked' : ''}`}
            aria-pressed={side === value}
            onClick={() => choose(value)}
          >
            {t(value === DEFEND ? 'typeDefending' : 'typeAttacking')}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <p className="filter-status">
          {t(side === DEFEND ? 'typePickDefend' : 'typePickAttack')}
          {picked.length > 0 && (
            <button type="button" className="filter-clear" onClick={() => setPicked([])}>
              {t('clear')}
            </button>
          )}
        </p>
        <div className={`chip-list type-list${picked.length > 0 ? ' type-list-active' : ''}`}>
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`type-chip type-chip-button${picked.includes(type) ? ' type-chip-checked' : ''}`}
              aria-pressed={picked.includes(type)}
              onClick={() => toggle(type)}
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
            </button>
          ))}
        </div>
      </div>

      {picked.length > 0 && (
        <div className="filter-section type-result" aria-live="polite">
          <h3 className="filter-legend type-result-title">
            {t(side === DEFEND ? 'typeDefendTitle' : 'typeAttackTitle', names)}
          </h3>
          {side === DEFEND ? (
            <MatchupGroups
              groups={defenseGroups(picked)}
              label={(value) => t('typeTakes', value)}
            />
          ) : (
            <MatchupGroups
              groups={attackGroups(picked[0])}
              label={(value) => t('typeDeals', value)}
            />
          )}
        </div>
      )}

      <div className="filter-section">
        <h3 className="filter-legend type-result-title">{t('typeFullChart')}</h3>
        <p className="setup-hint">{t('typeChartAxes')}</p>
        <div className="type-table-wrap">
          <table className="type-table">
            <thead>
              <tr>
                <th scope="col" className="type-table-corner">
                  <span aria-hidden="true">⚔ → 🛡</span>
                </th>
                {TYPES.map((defend) => (
                  <th
                    key={defend}
                    scope="col"
                    className={
                      side === DEFEND && picked.includes(defend) ? 'type-table-on' : undefined
                    }
                  >
                    <img
                      src={TYPE_ICONS.get(defend)}
                      alt={typeName(defend)}
                      title={typeName(defend)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TYPES.map((attack) => (
                <tr
                  key={attack}
                  className={
                    side === ATTACK && picked.includes(attack) ? 'type-table-on' : undefined
                  }
                >
                  <th scope="row">
                    <img
                      src={TYPE_ICONS.get(attack)}
                      alt={typeName(attack)}
                      title={typeName(attack)}
                    />
                  </th>
                  {TYPES.map((defend) => {
                    const value = effectiveness(attack, defend)
                    const on = side === DEFEND && picked.includes(defend)
                    return (
                      <td
                        key={defend}
                        className={`type-cell-${String(value).replace('.', '')}${on ? ' type-table-on' : ''}`}
                        title={t(
                          'typeCell',
                          typeName(attack),
                          typeName(defend),
                          multiplierText(value),
                        )}
                      >
                        {CELL_TEXT[value] ?? ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default TypeChart
