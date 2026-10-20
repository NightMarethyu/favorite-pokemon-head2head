// The languages the site can be shown in. `nameKey` is the matching key under
// `name` in the Pokémon data; `locale` formats dates.
export const LANGUAGES = [
  { code: 'en', label: 'English', locale: 'en', nameKey: 'english' },
  { code: 'ja', label: '日本語', locale: 'ja', nameKey: 'japanese' },
  { code: 'zh', label: '中文', locale: 'zh-CN', nameKey: 'chinese' },
  { code: 'fr', label: 'Français', locale: 'fr', nameKey: 'french' },
]

export const DEFAULT_LANGUAGE = 'en'

const CODES = LANGUAGES.map((language) => language.code)

export function isLanguage(code) {
  return CODES.includes(code)
}

// The first of the browser's preferred languages that the site has, matched on
// the base language ('fr-CA' -> 'fr', 'zh-TW' -> 'zh'). Reading these doesn't
// prompt the visitor. Anything else gets English.
export function detectLanguage(preferred = browserLanguages()) {
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }
  return DEFAULT_LANGUAGE
}

function browserLanguages() {
  if (typeof navigator === 'undefined') return []
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}
