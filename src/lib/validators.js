export function required(v, msg = 'Required') {
  return v?.toString().trim() ? null : msg
}
export function dateOrder(start, end) {
  if (!start || !end) return null
  return new Date(start) <= new Date(end) ? null : 'Start must be before end'
}
