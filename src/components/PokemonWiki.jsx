import { useEffect, useMemo, useState } from 'react'
import { GAME_GROUPS, GENERATIONS } from '../data/filters.js'
import { typeChartHash, wikiHash } from '../data/links.js'
import { ALL_POKEMON, evolutionStages, pokemonDetails } from '../data/pokedex.js'
import { ALL_GENERATIONS, searchPokemon } from '../data/search.js'
import { TYPE_LABELS } from '../data/typeArt.js'
import { defenseGroups } from '../data/typeChart.js'
import { useHash } from '../hooks/useHash.js'
import { LANGUAGES } from '../i18n/languages.js'
import { useI18n } from '../i18n/useI18n.js'
import MatchupGroups from './MatchupGroups.jsx'

const BY_ID = new Map(ALL_POKEMON.map((pokemon) => [pokemon.id, pokemon]))
const LAST_ID = Math.max(...BY_ID.keys())
// Base stats top out at 255, so a full bar is 255.
const MAX_STAT = 255

const dexNumber = (id) => `#${String(id).padStart(4, '0')}`

// '#wiki/25' -> 25; anything else -> null (the list).
function idFromHash(hash) {
  const match = /^#wiki\/(\d+)$/.exec(hash)
  return match ? Number(match[1]) : null
}

// Low stats red through high stats blue, like most stat charts.
function statColor(value) {
  if (value < 50) return 'var(--stat-low)'
  if (value < 80) return 'var(--stat-mid)'
  if (value < 110) return 'var(--stat-good)'
  if (value < 140) return 'var(--stat-high)'
  return 'var(--stat-top)'
}

function PokemonLink({ pokemon, children }) {
  const { pokemonName } = useI18n()
  const name = pokemonName(pokemon)
  return (
    <a className="grid-result" href={wikiHash(pokemon.id)} title={name}>
      {pokemon.sprite && <img src={pokemon.sprite} alt="" loading="lazy" />}
      <span>{name}</span>
      {children}
    </a>
  )
}

function WikiList() {
  const { t, generationLabel } = useI18n()
  const [query, setQuery] = useState('')
  const [generation, setGeneration] = useState(ALL_GENERATIONS)
  const results = useMemo(() => searchPokemon(query, generation), [query, generation])

  return (
    <section className="setup wiki" aria-labelledby="wiki-title">
      <h2 id="wiki-title" className="setup-title">
        {t('wikiTitle')}
      </h2>
      <p className="setup-hint">{t('wikiHint')}</p>
      <div className="grid-search">
        <input
          type="search"
          value={query}
          placeholder={t('gridSearch')}
          aria-label={t('gridSearch')}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={generation}
          aria-label={t('generation')}
          onChange={(event) => setGeneration(Number(event.target.value))}
        >
          <option value={ALL_GENERATIONS}>{t('gridAllGenerations')}</option>
          {GENERATIONS.map((gen) => (
            <option key={gen.value} value={gen.value}>
              {generationLabel(gen.value)}
            </option>
          ))}
        </select>
      </div>
      {results.length === 0 ? (
        <p className="saves-empty">{t('gridNoMatches')}</p>
      ) : (
        <ul className="grid-results wiki-results">
          {results.map((pokemon) => (
            <li key={pokemon.id}>
              <PokemonLink pokemon={pokemon}>
                <span className="wiki-number">{dexNumber(pokemon.id)}</span>
              </PokemonLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function StatBars({ stats }) {
  const { t, statName, locale } = useI18n()
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  const total = stats.reduce((sum, { value }) => sum + value, 0)
  return (
    <table className="wiki-stats">
      <tbody>
        {stats.map(({ stat, value }) => (
          <tr key={stat}>
            <th scope="row">{statName(stat)}</th>
            <td className="wiki-stat-value">{value}</td>
            <td className="wiki-stat-bar-cell">
              <span
                className="wiki-stat-bar"
                role="img"
                aria-label={t('wikiStatOf', value, MAX_STAT, percent.format(value / MAX_STAT))}
              >
                <span
                  style={{ width: `${(value / MAX_STAT) * 100}%`, background: statColor(value) }}
                />
              </span>
            </td>
          </tr>
        ))}
        <tr className="wiki-stat-total">
          <th scope="row">{t('wikiTotal')}</th>
          <td className="wiki-stat-value">{total}</td>
          <td />
        </tr>
      </tbody>
    </table>
  )
}

function Evolution({ id }) {
  const { t } = useI18n()
  const stages = evolutionStages(id)
  if (stages.length < 2) return <p className="setup-hint">{t('wikiNoEvolution')}</p>
  return (
    <ol className="wiki-evolution">
      {stages.map((stage, index) => (
        <li key={index} className="wiki-evolution-stage">
          {index > 0 && (
            <span className="wiki-evolution-arrow" aria-hidden="true">
              ➜
            </span>
          )}
          <ul className="wiki-evolution-members">
            {stage.map(({ id: memberId, method }) => {
              const pokemon = BY_ID.get(memberId)
              if (!pokemon) return null
              return (
                <li
                  key={memberId}
                  className={memberId === id ? 'wiki-evolution-current' : undefined}
                >
                  <PokemonLink pokemon={pokemon}>
                    {method && <span className="wiki-evolution-method">{method}</span>}
                  </PokemonLink>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )
}

// The games it's in, by generation. Games where it can be caught, evolved, or
// received stand out from ones it only reaches by trade, event, or transfer.
function GameList({ pokemon }) {
  const { t, gameName, generationLabel } = useI18n()
  const catchable = new Set(pokemon.catchable)
  const groups = GAME_GROUPS.map((group) => ({
    ...group,
    games: group.games.filter((game) => pokemon.games.includes(game)),
  })).filter((group) => group.games.length > 0)
  if (groups.length === 0) return <p className="setup-hint">{t('wikiNoGames')}</p>

  return (
    <>
      <p className="wiki-games-key">
        <span className="wiki-game wiki-game-catchable">{t('wikiGamesCatchable')}</span>
        <span className="wiki-game">{t('wikiGamesTransfer')}</span>
      </p>
      <dl className="wiki-games">
        {groups.map((group) => (
          <div key={group.label} className="wiki-games-group">
            <dt>{group.generation ? generationLabel(group.generation) : t('otherGames')}</dt>
            <dd>
              {group.games.map((game) => (
                <span
                  key={game}
                  className={`wiki-game${catchable.has(game) ? ' wiki-game-catchable' : ''}`}
                  title={t(catchable.has(game) ? 'wikiGamesCatchable' : 'wikiGamesTransfer')}
                >
                  {gameName(game)}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function WikiPage({ pokemon }) {
  const i18n = useI18n()
  const { t, language, locale, pokemonName, typeName, eggGroupName, generationLabel, list } = i18n
  const details = pokemonDetails(pokemon.id)
  const name = pokemonName(pokemon)
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const previous = BY_ID.get(pokemon.id - 1)
  const next = BY_ID.get(pokemon.id + 1)
  // Its name in the other site languages.
  const otherNames = LANGUAGES.filter(
    (entry) => entry.code !== language && pokemon.names[entry.code],
  ).map((entry) => ({ ...entry, name: pokemon.names[entry.code] }))

  return (
    <article className="setup wiki" aria-labelledby="wiki-name">
      <nav className="wiki-nav" aria-label={t('wikiTitle')}>
        <a className="filter-clear" href="#wiki">
          ← {t('wikiAll')}
        </a>
        <span className="wiki-nav-steps">
          {previous && (
            <a
              className="filter-clear"
              href={wikiHash(previous.id)}
              aria-label={t('wikiPrevious', pokemonName(previous))}
            >
              ‹ {dexNumber(previous.id)}
            </a>
          )}
          {next && (
            <a
              className="filter-clear"
              href={wikiHash(next.id)}
              aria-label={t('wikiNext', pokemonName(next))}
            >
              {dexNumber(next.id)} ›
            </a>
          )}
        </span>
      </nav>

      <header className="wiki-hero">
        {pokemon.sprite && (
          <img className="wiki-sprite" src={pokemon.sprite} alt="" width="512" height="512" />
        )}
        <div className="wiki-hero-text">
          <p className="wiki-number">{dexNumber(pokemon.id)}</p>
          <h2 id="wiki-name" className="setup-title">
            {name}
          </h2>
          <p className="wiki-species" lang="en">
            {details.species}
          </p>
          <a className="wiki-types" href={typeChartHash(pokemon.types)} title={t('wikiTypeLink')}>
            {pokemon.types.map((type) =>
              TYPE_LABELS.has(type) ? (
                <img
                  key={type}
                  src={TYPE_LABELS.get(type)}
                  alt={typeName(type)}
                  title={typeName(type)}
                  width="200"
                  height="40"
                />
              ) : (
                <span key={type}>{typeName(type)}</span>
              ),
            )}
          </a>
          {otherNames.length > 0 && (
            <p className="wiki-other-names">
              {otherNames.map((entry) => (
                <span key={entry.code} lang={entry.locale}>
                  {entry.name}
                </span>
              ))}
            </p>
          )}
        </div>
      </header>

      {details.description && (
        <p className="wiki-entry" lang="en">
          {details.description}
        </p>
      )}
      {language !== 'en' && <p className="setup-hint wiki-english-note">{t('wikiEnglishOnly')}</p>}

      <div className="wiki-sections">
        <section className="filter-section wiki-section">
          <h3 className="filter-legend">{t('wikiStats')}</h3>
          <StatBars stats={details.stats} />
        </section>

        <section className="filter-section wiki-section">
          <h3 className="filter-legend">{t('wikiProfile')}</h3>
          <dl className="wiki-facts">
            <div>
              <dt>{t('generation')}</dt>
              <dd>{pokemon.generation ? generationLabel(pokemon.generation) : '—'}</dd>
            </div>
            <div>
              <dt>{t('wikiHeight')}</dt>
              <dd>{details.heightM == null ? '—' : `${number.format(details.heightM)} m`}</dd>
            </div>
            <div>
              <dt>{t('wikiWeight')}</dt>
              <dd>{details.weightKg == null ? '—' : `${number.format(details.weightKg)} kg`}</dd>
            </div>
            <div>
              <dt>{t('wikiGender')}</dt>
              <dd>
                {details.gender ? (
                  <>
                    <span className="wiki-male">♂ {number.format(details.gender.male)}%</span>{' '}
                    <span className="wiki-female">♀ {number.format(details.gender.female)}%</span>
                  </>
                ) : (
                  t('wikiGenderless')
                )}
              </dd>
            </div>
            <div>
              <dt>{t('wikiEggGroups')}</dt>
              <dd>{list(details.eggGroups.map(eggGroupName))}</dd>
            </div>
            <div>
              <dt>{t('wikiAbilities')}</dt>
              <dd>
                <ul className="wiki-abilities" lang="en">
                  {details.abilities.map((ability) => (
                    <li key={ability.name}>
                      {ability.name}
                      {ability.hidden && (
                        <span className="wiki-hidden" lang={locale}>
                          {t('wikiHidden')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        <section className="filter-section wiki-section">
          <h3 className="filter-legend">{t('wikiMatchups')}</h3>
          <MatchupGroups
            groups={defenseGroups(pokemon.types)}
            label={(value) => t('typeTakes', value)}
          />
          <a className="filter-clear wiki-more" href={typeChartHash(pokemon.types)}>
            {t('wikiTypeLink')} →
          </a>
        </section>

        <section className="filter-section wiki-section">
          <h3 className="filter-legend">{t('wikiEvolution')}</h3>
          <Evolution id={pokemon.id} />
        </section>

        <section className="filter-section wiki-section wiki-section-wide">
          <h3 className="filter-legend">{t('wikiGames')}</h3>
          <GameList pokemon={pokemon} />
        </section>
      </div>
    </article>
  )
}

// The wiki tool: a searchable list, and a page per Pokémon at #wiki/<number>.
function PokemonWiki() {
  const { t } = useI18n()
  const id = idFromHash(useHash())
  const pokemon = id == null ? null : BY_ID.get(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (id == null) return <WikiList />
  if (!pokemon) {
    return (
      <section className="setup wiki">
        <p className="setup-hint">{t('wikiNotFound', LAST_ID)}</p>
        <a className="filter-clear wiki-back" href="#wiki">
          ← {t('wikiAll')}
        </a>
      </section>
    )
  }
  return <WikiPage pokemon={pokemon} />
}

export default PokemonWiki
