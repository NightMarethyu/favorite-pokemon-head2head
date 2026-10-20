import { useEffect, useMemo, useRef, useState } from 'react'
import { GENERATIONS } from '../data/filters.js'
import { ALL_POKEMON } from '../data/pokedex.js'
import { useI18n } from '../i18n/useI18n.js'
import { renderGrid } from '../tools/gridImage.js'

const STORAGE_KEY = 'favoritesGrid'
const SLOTS = 9
const EMPTY_GRID = Array(SLOTS).fill(null)
const BY_ID = new Map(ALL_POKEMON.map((pokemon) => [pokemon.id, pokemon]))
const FILE_NAME = 'pick-a-mon-3x3.png'
// 0 stands for every generation.
const ALL = 0

// The grid is kept in this browser so it's still there on the next visit.
function readGrid() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const ids = Array.from({ length: SLOTS }, (_, i) =>
      BY_ID.has(stored?.ids?.[i]) ? stored.ids[i] : null,
    )
    return { ids, title: typeof stored?.title === 'string' ? stored.title : '' }
  } catch {
    return { ids: EMPTY_GRID, title: '' }
  }
}

// Lowercase without accents, so "flabebe" finds Flabébé.
const fold = (text) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function nextEmpty(ids, from) {
  for (let step = 1; step <= SLOTS; step += 1) {
    const index = (from + step) % SLOTS
    if (ids[index] == null) return index
  }
  return from
}

// The 3×3 favorites tool: pick nine Pokémon, then save the grid as an image.
function FavoritesGrid() {
  const i18n = useI18n()
  const { t, pokemonName, generationLabel } = i18n
  const [initial] = useState(readGrid)
  const [ids, setIds] = useState(initial.ids)
  const [title, setTitle] = useState(initial.title)
  const [active, setActive] = useState(() => Math.max(0, initial.ids.indexOf(null)))
  const [query, setQuery] = useState('')
  const [generation, setGeneration] = useState(ALL)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const picker = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, title }))
    } catch {
      // Storage can be unavailable (private mode); the grid still works.
    }
  }, [ids, title])

  const results = useMemo(() => {
    const term = fold(query.trim())
    const number = /^#?\d+$/.test(term) ? Number(term.replace('#', '')) : null
    const inGeneration = ALL_POKEMON.filter(
      (pokemon) => pokemon.sprite && (generation === ALL || pokemon.generation === generation),
    )
    if (!term) return inGeneration
    if (number != null) return inGeneration.filter((pokemon) => pokemon.id === number)
    // Exact names first, then names that start with the search, then the rest.
    const rank = (pokemon) => {
      const names = [pokemon.name, ...Object.values(pokemon.names)].filter(Boolean).map(fold)
      if (names.includes(term)) return 0
      if (names.some((name) => name.startsWith(term))) return 1
      return names.some((name) => name.includes(term)) ? 2 : -1
    }
    return inGeneration
      .map((pokemon) => [rank(pokemon), pokemon])
      .filter(([score]) => score >= 0)
      .sort((a, b) => a[0] - b[0])
      .map(([, pokemon]) => pokemon)
  }, [query, generation])

  const picked = ids.filter((id) => id != null).length
  const shownTitle = title.trim() || t('gridDefaultTitle')

  function place(id) {
    const next = ids.map((value) => (value === id ? null : value))
    next[active] = id
    setIds(next)
    setActive(nextEmpty(next, active))
    setMessage('')
  }

  // On a phone the list is below the grid, so bring it into view.
  function choose(index) {
    setActive(index)
    if (window.matchMedia('(max-width: 760px)').matches) {
      picker.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function remove(index) {
    setIds(ids.map((value, i) => (i === index ? null : value)))
    setActive(index)
    setMessage('')
  }

  function clearAll() {
    if (picked > 0 && !window.confirm(t('gridConfirmClear'))) return
    setIds(EMPTY_GRID)
    setActive(0)
    setMessage('')
  }

  async function makeImage() {
    const slots = ids.map((id) => {
      const pokemon = BY_ID.get(id)
      return pokemon ? { id, sprite: pokemon.sprite, name: pokemonName(pokemon) } : null
    })
    const site = new URL(import.meta.env.BASE_URL, window.location.origin)
    return renderGrid({
      slots,
      title: shownTitle,
      siteTitle: t('siteTitle'),
      credit: `${site.host}${site.pathname}`.replace(/\/$/, ''),
    })
  }

  async function download() {
    setBusy(true)
    try {
      const blob = await makeImage()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = FILE_NAME
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage(t('gridDownloaded'))
    } catch {
      setMessage(t('gridImageFailed'))
    } finally {
      setBusy(false)
    }
  }

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([''], FILE_NAME, { type: 'image/png' })] })

  async function share() {
    setBusy(true)
    try {
      const blob = await makeImage()
      await navigator.share({
        title: shownTitle,
        files: [new File([blob], FILE_NAME, { type: 'image/png' })],
      })
    } catch (error) {
      if (error?.name !== 'AbortError') setMessage(t('gridImageFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="setup grid-tool" aria-labelledby="grid-title">
      <h2 id="grid-title" className="setup-title">
        {t('gridTitle')}
      </h2>
      <p className="setup-hint">{t('gridHint')}</p>

      <label className="grid-name">
        <span className="filter-legend">{t('gridNameLabel')}</span>
        <input
          type="text"
          value={title}
          maxLength={40}
          placeholder={t('gridDefaultTitle')}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <div className="grid-layout">
        <div className="grid-board-wrap">
          <p className="grid-board-title">{shownTitle}</p>
          <ol className="grid-board">
            {ids.map((id, index) => {
              const pokemon = BY_ID.get(id)
              const name = pokemon ? pokemonName(pokemon) : ''
              return (
                <li key={index} className="grid-cell-wrap">
                  <button
                    type="button"
                    className={`grid-cell${index === active ? ' grid-cell-active' : ''}`}
                    aria-pressed={index === active}
                    aria-label={t('gridSlot', index + 1, name)}
                    onClick={() => choose(index)}
                  >
                    {pokemon ? (
                      <>
                        <img src={pokemon.sprite} alt="" />
                        <span className="grid-cell-name">{name}</span>
                      </>
                    ) : (
                      <span className="grid-cell-empty" aria-hidden="true">
                        {index + 1}
                      </span>
                    )}
                  </button>
                  {pokemon && (
                    <button
                      type="button"
                      className="grid-cell-remove"
                      aria-label={t('gridRemove', name)}
                      title={t('gridRemove', name)}
                      onClick={() => remove(index)}
                    >
                      ×
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
          <p className="setup-count">{t('gridPicked', picked, SLOTS)}</p>
          <div className="game-actions">
            <button type="button" className="restart" disabled={busy || picked === 0} onClick={download}>
              {t('gridDownload')}
            </button>
            {canShareFiles && (
              <button
                type="button"
                className="restart restart-subtle"
                disabled={busy || picked === 0}
                onClick={share}
              >
                {t('gridShare')}
              </button>
            )}
            <button
              type="button"
              className="restart restart-subtle"
              disabled={busy || picked === 0}
              onClick={clearAll}
            >
              {t('gridClear')}
            </button>
          </div>
          <p className="grid-message" role="status">
            {message}
          </p>
        </div>

        <div className="grid-picker" ref={picker}>
          <p className="grid-picker-lead">{t('gridChoosing', active + 1)}</p>
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
              <option value={ALL}>{t('gridAllGenerations')}</option>
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
            <ul className="grid-results">
              {results.map((pokemon) => {
                const name = pokemonName(pokemon)
                const inGrid = ids.includes(pokemon.id)
                return (
                  <li key={pokemon.id}>
                    <button
                      type="button"
                      className={`grid-result${inGrid ? ' grid-result-picked' : ''}`}
                      title={name}
                      aria-label={inGrid ? t('gridInGrid', name) : name}
                      onClick={() => place(pokemon.id)}
                    >
                      <img src={pokemon.sprite} alt="" loading="lazy" />
                      <span>{name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default FavoritesGrid
