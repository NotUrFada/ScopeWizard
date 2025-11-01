import { formatDistanceToNow } from 'date-fns'

export default function ProjectActivity({ updates = [], criticalTasks = [] }) {
  return (
    <div className="card project-activity">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Activity & Risks</strong>
        <span className="badge">{updates.length}</span>
      </div>

      {criticalTasks.length > 0 && (
        <div className="activity-section">
          <div className="activity-section__title">Critical Next Tasks</div>
          <ul>
            {criticalTasks.map(task => (
              <li key={task.id}>
                <span>{task.title}</span>
                {task.endDate && <span className="sub"> - due {task.endDate}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="activity-section">
        <div className="activity-section__title">Latest Updates</div>
        {updates.length === 0 && <div className="sub">No updates yet.</div>}
        <ul className="activity-feed">
          {updates.slice(0, 6).map(update => (
            <li key={update.id}>
              <div className="activity-feed__header">
                <span className={`badge ${update.type === 'risk' ? 'danger' : update.type === 'status' ? 'ok' : ''}`}>{update.type}</span>
                <span className="sub">{formatDistanceToNow(new Date(update.createdAt || new Date()), { addSuffix: true })}</span>
              </div>
              <div className="activity-feed__body">{update.message}</div>
              <div className="sub">{update.author || 'System'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
