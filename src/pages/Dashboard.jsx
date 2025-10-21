import { useOutletContext, Link } from 'react-router-dom'
import { loadAll } from '../features/projects/projectStore.js'

export default function Dashboard() {
  const { holidays } = useOutletContext()
  const { projects, tasks } = loadAll()
  const next7 = tasks
    .filter(t => t.endDate)
    .filter(t => {
      const d = new Date(t.endDate)
      const now = new Date()
      const diff = (d - now) / (1000*60*60*24)
      return diff >= 0 && diff <= 7
    })
    .slice(0, 6)

  const nextHoliday = holidays
    ?.map(h => ({ ...h, dateObj: new Date(h.date) }))
    ?.filter(h => h.dateObj >= new Date())
    ?.sort((a,b) => a.dateObj - b.dateObj)[0]

  return (
    <div className="grid" style={{gap:16}}>
      {nextHoliday && (
        <div className="banner">
          Heads up: {nextHoliday.localName} on {nextHoliday.date}
        </div>
      )}

      <div className="grid cols-3">
        <div className="card">
          <div className="kpi">{projects.length}</div>
          <div className="sub">Projects</div>
        </div>
        <div className="card">
          <div className="kpi">{tasks.length}</div>
          <div className="sub">Tasks</div>
        </div>
        <div className="card">
          <div className="kpi">{tasks.filter(t=>t.status==='done').length}</div>
          <div className="sub">Done</div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
          <strong>Due in next 7 days</strong>
          <Link className="btn ghost" to="/projects">View all</Link>
        </div>
        {next7.length === 0 ? (
          <div className="sub">No upcoming deadlines this week.</div>
        ) : (
          <ul>
            {next7.map(t => (
              <li key={t.id}>{t.title} — due {t.endDate}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
