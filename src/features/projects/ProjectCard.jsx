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

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h3 style={{margin:'0 0 6px 0'}}>{project.name}</h3>
          <div className="sub">{project.description || 'No description'}</div>
        </div>
        <div className={`badge ${overdue?'danger':'ok'}`}>{overdue?'Overdue':'On Track'}</div>
      </div>
      <div className="space" />
      <div className="row" style={{gap:8, alignItems:'center'}}>
        <div className="badge">{project.status}</div>
        <div className="badge">{pct}%</div>
        {project.startDate && project.endDate && (
          <div className="badge">{project.startDate} → {project.endDate}</div>
        )}
      </div>
      <div className="space" />
      <Link className="btn ghost" to={`/projects/${project.id}`}>Open</Link>
    </div>
  )
}
