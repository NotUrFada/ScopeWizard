import { useMemo, useSyncExternalStore } from 'react'
import { EMPTY_PORTFOLIO_STATE, loadAll } from './projectStore.js'

const EVENT_NAME = 'portfolio:data:updated'

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  const storageHandler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

function getSnapshot() {
  if (typeof window === 'undefined') return EMPTY_PORTFOLIO_STATE
  return loadAll()
}

function getServerSnapshot() {
  return EMPTY_PORTFOLIO_STATE
}

export function usePortfolioData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function usePortfolioSelector(selector) {
  const state = usePortfolioData()
  return useMemo(() => {
    return selector ? selector(state) : state
  }, [selector, state])
}
