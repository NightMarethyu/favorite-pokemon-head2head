import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// The page's #hash, updated when it changes (links, back and forward).
export function useHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash)
}
