const base = 'https://date.nager.at/api/v3'

export async function fetchHolidays({ country, year, signal }) {
  const cacheKey = `holidays:${year}:${country}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) } catch {}
  }

  const res = await fetch(`${base}/PublicHolidays/${year}/${country}`, { signal })
  if (!res.ok) throw new Error(`Holiday API error: ${res.status}`)
  const data = await res.json()
  localStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}
