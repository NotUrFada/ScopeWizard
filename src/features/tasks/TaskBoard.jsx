import Button from '../../shared/Button.jsx'
import { updateTask } from '../projects/projectStore.js'

const COLUMNS = [
  { key: 'todo', title: 'To Do' },
  { key: 'doing', title: 'In Progress' },
  { key: 'blocked', title: 'Blocked' },
  { key: 'done', title: 'Done' }
]

const STATUS_FLOW = ['todo', 'doing', 'blocked', 'done']

export default function TaskBoard({ tasks = [], onChange = () => {}, resources = [] }) {
  const resourceMap = resources.reduce((acc, resource) => {
    acc[resource.id] = resource
    return acc
  }, {})

  const grouped = COLUMNS.map(col => ({
    ...col,
    tasks: tasks.filter(task => task.status === col.key)
  }))

  async function move(task, direction = 1) {
    const currentIndex = STATUS_FLOW.indexOf(task.status)
    const nextIndex = Math.min(STATUS_FLOW.length - 1, Math.max(0, currentIndex + direction))
    const nextStatus = STATUS_FLOW[nextIndex]
    if (nextStatus === task.status) return
    await updateTask(task.id, { status: nextStatus })
    onChange?.()
  }

  return (
    <div className="task-board">
      {grouped.map(column => (
        <div key={column.key} className="task-column">
          <div className="task-column__header">
            <strong>{column.title}</strong>
            <span className="badge">{column.tasks.length}</span>
          </div>
          <div className="task-column__body">
            {column.tasks.length === 0 && <div className="sub">No tasks</div>}
            {column.tasks.map(task => {
              const assigneeLabel = task.assigneeId && resourceMap[task.assigneeId]
                ? resourceMap[task.assigneeId].name
                : task.assignee || 'Unassigned'
              return (
                <div key={task.id} className={`task-pill ${task.priority}`}>
                  <div className="task-pill__title">{task.title}</div>
                  <div className="task-pill__meta sub">
                    {assigneeLabel}
                    {task.endDate ? ` - Due ${task.endDate}` : ''}
                  </div>
                  <div className="task-pill__actions">
                    <Button kind="ghost" onClick={() => move(task, -1)} disabled={task.status === 'todo'}>{'<'}</Button>
                    <Button kind="ghost" onClick={() => move(task, 1)} disabled={task.status === 'done'}>{'>'}</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
