export default function Alert({ kind='info', message }) {
  const color = kind === 'error' ? 'var(--danger)' : kind === 'warn' ? 'var(--warn)' : 'var(--ok)'
  return (
    <div className="card" style={{ borderColor: color, margin:'12px 0' }}>
      <div>{message}</div>
    </div>
  )
}
