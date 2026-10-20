import { DEFAULT_LANGUAGE, LANGUAGES } from './languages.js'
import { MESSAGES } from './messages.js'

const english = MESSAGES[DEFAULT_LANGUAGE]

// Text helpers for one language. Plain functions (no React), so data code like
// describeFilters() can use them too.
export function makeTranslator(code) {
  const language = LANGUAGES.find((entry) => entry.code === code) ?? LANGUAGES[0]
  const messages = MESSAGES[language.code]

  function t(key, ...args) {
    const value = messages[key] ?? english[key]
    return typeof value === 'function' ? value(...args) : (value ?? key)
  }

  const lookup = (table) => (name) => messages[table]?.[name] ?? name

  return {
    language: language.code,
    locale: language.locale,
    t,
    typeName: lookup('types'),
    gameName: lookup('games'),
    regionName: lookup('regions'),
    statName: lookup('stats'),
    eggGroupName: lookup('eggGroups'),
    generationLabel: (n) => t('generationLabel', n),
    list: (items) => items.join(t('listSeparator')),
    // Names come from the data; any that are missing fall back to English.
    pokemonName: (pokemon) => pokemon?.names?.[language.code] || pokemon?.name || '',
  }
}

export const ENGLISH = makeTranslator(DEFAULT_LANGUAGE)
