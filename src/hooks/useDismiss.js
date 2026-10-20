import { useEffect } from 'react'

// Closes a popup menu on Escape or a click outside `root`. Escape puts focus
// back on the button that opened it.
export function useDismiss(open, close, root) {
  useEffect(() => {
    if (!open) return
    function onEvent(event) {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && root.current?.contains(event.target)) return
      close()
      if (event.type === 'keydown') root.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', onEvent)
    document.addEventListener('keydown', onEvent)
    return () => {
      document.removeEventListener('pointerdown', onEvent)
      document.removeEventListener('keydown', onEvent)
    }
  }, [open, close, root])
}
