import { useCallback, useMemo, useState } from 'react'
import {
  createSave,
  deleteSave,
  importSaves,
  loadStore,
  newSaveId,
  setActiveSave,
  summarizeSave,
  updateSave,
} from '../game/saves.js'

// Saved games in localStorage, mirrored in React state for the saved games list.
export function useSaves() {
  const [store, setStore] = useState(loadStore)

  const create = useCallback((filters, state) => {
    const id = newSaveId()
    setStore(createSave(id, filters, state))
    return id
  }, [])
  const update = useCallback((id, state) => setStore(updateSave(id, state)), [])
  const remove = useCallback((id) => setStore(deleteSave(id)), [])
  const setActive = useCallback((id) => setStore(setActiveSave(id)), [])
  // Returns { imported, skipped }; throws if the data isn't a saved games file.
  const importData = useCallback((data) => {
    const { store: next, imported, skipped } = importSaves(data)
    setStore(next)
    return { imported, skipped }
  }, [])

  const summaries = useMemo(
    () => [...store.saves].sort((a, b) => b.updatedAt - a.updatedAt).map(summarizeSave),
    [store.saves],
  )
  const activeSave = store.saves.find((save) => save.id === store.activeId) ?? null

  return {
    saves: store.saves,
    summaries,
    activeSave,
    create,
    update,
    remove,
    setActive,
    importData,
  }
}
