import { loadAll } from '../features/projects/projectStore.js'

export default function Reports() {
  const { tasks } = loadAll()
  const total = tasks.length
  const byStatus = ['todo','doing','blocked','done'].map(s => ({
    s, n: tasks.filter(t => t.status === s).length
  }))
  return (
    <div className="grid" style={{gap:16}}>
      <h2>Reports</h2>
      <div className="card">
        <strong>Tasks by status</strong>
        <div className="space" />
        {byStatus.map(({s,n}) => (
          <div key={s} className="row" style={{alignItems:'center', gap:10}}>
            <div style={{width:90}} className="sub">{s}</div>
            <div className="card" style={{flex:1, padding:0}}>
              <div style={{
                height:12, width: total? `${(n/total)*100}%` : '0%',
                background: 'linear-gradient(90deg, var(--brand), var(--brand-2))',
                borderRadius: 6
              }} />
            </div>
            <div className="badge">{n}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
