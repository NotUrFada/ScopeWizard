import { Link } from 'react-router-dom'

function progressFor(project, allTasks) {
  const tasks = allTasks.filter(t => t.projectId === project.id)
  const total = tasks.length || 1
  const done = tasks.filter(t => t.status === 'done').length
  return Math.round((done / total) * 100)
}

export default function ProjectCard({ project }) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
  const pct = progressFor(project, tasks)
  const overdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'done'
  const budget = Number(project.budget) || 0
  const actual = Number(project.actualSpend) || 0
  const budgetPct = budget ? Math.min(100, Math.round((actual / budget) * 100)) : 0
  const healthClass = project.health === 'off_track' ? 'badge danger' : project.health === 'at_risk' ? 'badge warn' : 'badge ok'

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <h3 style={{margin:'0 0 6px 0'}}>{project.name}</h3>
          <div className="sub">{project.description || 'No description'}</div>
          <div className="sub" style={{marginTop:6}}>Owner: {project.owner || 'Unassigned'}{project.category ? ` - ${project.category}` : ''}</div>
        </div>
        <div className="grid" style={{ gap: 6, justifyItems: 'end' }}>
          <div className={`badge ${overdue ? 'danger' : 'ok'}`}>{overdue ? 'Overdue' : 'On Track'}</div>
          <div className={healthClass}>{project.health || 'on_track'}</div>
        </div>
      </div>
      <div className="space" />
      <div className="grid" style={{ gap: 10 }}>
        <div>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sub">Progress</div>
            <div className="badge">{pct}%</div>
          </div>
          <div className="progress-track small" style={{ marginTop: 6 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sub">Budget</div>
            <div className="badge">${actual.toLocaleString()}</div>
          </div>
          <div className="progress-track small" style={{ marginTop: 6 }}>
            <div className="progress-fill" style={{ width: `${budgetPct}%`, background: 'linear-gradient(135deg,#f97316,#ea580c)' }} />
          </div>
        </div>
        <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="badge">{project.status}</div>
          {project.startDate && project.endDate && (
            <div className="badge">{project.startDate} → {project.endDate}</div>
          )}
        </div>
      </div>
      <div className="space" />
      <Link className="btn ghost" to={`/projects/${project.id}`}>Open</Link>
    </div>
  )
}
