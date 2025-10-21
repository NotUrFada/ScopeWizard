export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <div style={{color:'#fca5a5', fontSize:12, marginTop:6}}>{error}</div> : null}
    </div>
  )
}
