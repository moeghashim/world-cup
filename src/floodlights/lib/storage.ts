/* localStorage helpers with the shared `fl:` namespace (ported from site.js) */
export function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem('fl:' + key)
    return s == null ? fallback : (JSON.parse(s) as T)
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem('fl:' + key, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}
