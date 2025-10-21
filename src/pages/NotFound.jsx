import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Not Found</h2>
      <p className="sub">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn ghost">Go Home</Link>
    </div>
  )
}
