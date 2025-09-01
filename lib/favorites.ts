import { Pattern } from './api'

const FAVORITES_KEY = 'viralizes_favorites'

export function getFavorites(): Pattern[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isFavorite(patternId: string): boolean {
  const favorites = getFavorites()
  return favorites.some(p => p.id === patternId)
}

export function addFavorite(pattern: Pattern): void {
  const favorites = getFavorites()
  if (!favorites.some(p => p.id === pattern.id)) {
    favorites.push(pattern)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    window.dispatchEvent(new CustomEvent('favorites-updated'))
  }
}

export function removeFavorite(patternId: string): void {
  const favorites = getFavorites()
  const filtered = favorites.filter(p => p.id !== patternId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
  window.dispatchEvent(new CustomEvent('favorites-updated'))
}

export function toggleFavorite(pattern: Pattern): boolean {
  if (isFavorite(pattern.id)) {
    removeFavorite(pattern.id)
    return false
  } else {
    addFavorite(pattern)
    return true
  }
}

export function clearFavorites(): void {
  localStorage.removeItem(FAVORITES_KEY)
  window.dispatchEvent(new CustomEvent('favorites-updated'))
}

export function getFavoritesCount(): number {
  return getFavorites().length
}