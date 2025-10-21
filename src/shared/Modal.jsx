import { useEffect } from 'react'

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center', zIndex:50
    }} onClick={onClose}>
      <div className="card" style={{width:'min(600px, 92vw)'}} onClick={(e)=>e.stopPropagation()}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        <div className="space" />
        {children}
      </div>
    </div>
  )
}
