import Button from '../../shared/Button.jsx'
import { updateTask, deleteTask } from '../projects/projectStore.js'

const PRIORITY_COLOR = {
  low: 'badge',
  medium: 'badge',
  high: 'badge warn',
  critical: 'badge danger'
}

export default function TaskItem({ task, onChange, taskMap = {}, resources = [], allocations = [] }) {
  const resourceMap = resources.reduce((acc, r) => {
    acc[r.id] = r
    return acc
  }, {})
  const assigneeName = task.assignee || resourceMap[task.assigneeId]?.name || 'Unassigned'
  const overdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'done'
  const dependencies = (task.dependsOn || []).map(id => taskMap[id]).filter(Boolean)
  const blockedBy = dependencies.filter(dep => dep.status !== 'done')
  const taskAllocations = allocations.filter(a => a.taskId === task.id)
  const progressValue = Number.isFinite(task.progress) ? task.progress : 0

  function setStatus(status) {
    updateTask(task.id, { status })
    onChange?.()
  }

  function remove() {
    deleteTask(task.id)
    onChange?.()
  }

  return (
    <div className="card task-card">
      <div className="task-card__header">
        <div className="task-card__title">
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <strong>{task.title}</strong>
            {task.priority && <span className={PRIORITY_COLOR[task.priority] || 'badge'}>{task.priority}</span>}
            {task.type === 'milestone' && <span className="badge warn">Milestone</span>}
            {task.type === 'deliverable' && <span className="badge">Deliverable</span>}
          </div>
          <div className="sub">
            {assigneeName}
            {(task.startDate || task.endDate) && ` - ${task.startDate || '—'} → ${task.endDate || '—'}`}
          </div>
          {overdue && <div className="badge danger" style={{ marginTop: 6 }}>Overdue</div>}
        </div>
        <div className="task-card__actions">
          <select value={task.status} className="select" onChange={e => setStatus(e.target.value)}>
            <option value="todo">todo</option>
            <option value="doing">doing</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
          </select>
          <Button kind="danger" onClick={remove}>Delete</Button>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressValue}%` }} />
      </div>
      <div className="sub" style={{ marginTop: 4 }}>Progress {progressValue}%</div>

      <div className="task-card__meta">
        {task.effortHours ? <span>Effort: {task.effortHours}h</span> : <span>Effort: —</span>}
        {task.cost ? <span>Cost: ${Number(task.cost).toLocaleString()}</span> : <span>Cost: —</span>}
        {task.durationDays != null ? <span>Duration: {task.durationDays}d</span> : <span>Duration: —</span>}
      </div>

      {taskAllocations.length > 0 && (
        <div className="task-card__allocations">
          {taskAllocations.map(alloc => {
            const res = resourceMap[alloc.resourceId]
            const label = res ? res.name : alloc.resourceId
            const pct = Math.round((alloc.allocation || 0) * 100)
            return <span key={alloc.id} className="badge">{label} - {pct}%</span>
          })}
        </div>
      )}

      {dependencies.length > 0 && (
        <div className="task-card__dependencies">
          <div className="task-card__dependencies-title">Dependencies</div>
          <ul>
            {dependencies.map(dep => (
              <li key={dep.id} className={dep.status === 'done' ? 'done' : ''}>
                {dep.title} <span className="sub">({dep.status})</span>
              </li>
            ))}
          </ul>
          {blockedBy.length > 0 && <div className="badge danger">Blocked by {blockedBy.length} task(s)</div>}
        </div>
      )}

      {task.tags?.length > 0 && (
        <div className="task-card__tags">
          {task.tags.map(tag => <span key={tag} className="badge">#{tag}</span>)}
        </div>
      )}

      {task.notes && <div className="task-card__notes">{task.notes}</div>}
    </div>
  )
}
