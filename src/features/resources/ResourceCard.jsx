import Button from '../../shared/Button.jsx'

export default function ResourceCard({ resource, metrics, onEdit, onDelete }) {
  const utilization = Math.min(metrics?.utilizationPercent ?? 0, 150)
  const overCapacity = metrics?.overCapacity
  const activeTasks = metrics?.upcoming || []

  return (
    <div className="card resource-card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>{resource.name}</h3>
          <div className="sub">{resource.role || 'No role specified'}{resource.location ? ` - ${resource.location}` : ''}</div>
          {resource.email && <div className="sub">{resource.email}</div>}
        </div>
        <div className={`badge ${overCapacity ? 'danger' : 'ok'}`}>{utilization}% utilized</div>
      </div>

      <div className="progress-track small" style={{ marginTop: 10 }}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(utilization, 100)}%`,
            background: overCapacity ? 'linear-gradient(135deg,#f97316,#ea580c)' : undefined
          }}
        />
      </div>
      <div className="sub" style={{ marginTop: 8 }}>
        Capacity {metrics?.capacityHours || 0}h - Assigned {metrics?.effortHours || 0}h
      </div>

      {activeTasks.length > 0 && (
        <div className="resource-card__tasks">
          <div className="sub">Upcoming tasks</div>
          <ul>
            {activeTasks.map(task => (
              <li key={task.id}>{task.title}{task.endDate ? ` (due ${task.endDate})` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <Button kind="ghost" onClick={onEdit}>Edit</Button>
        <Button kind="danger" onClick={onDelete}>Remove</Button>
      </div>
    </div>
  )
}
