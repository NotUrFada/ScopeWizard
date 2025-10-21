export default function Loader({ label='Loading…' }) {
  return (
    <div className="card" role="status" aria-live="polite" style={{margin:'12px 0'}}>
      <div className="row">
        <div className="badge">⏳</div>
        <div>{label}</div>
      </div>
    </div>
  )
}
