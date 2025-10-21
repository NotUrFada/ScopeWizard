import Button from '../../shared/Button.jsx'
import { updateTask, deleteTask } from '../projects/projectStore.js'

export default function TaskItem({ task, onChange }) {
  function setStatus(status) {
    updateTask(task.id, { status })
    onChange?.()
  }
  function remove() {
    deleteTask(task.id)
    onChange?.()
  }
  const overdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'done'

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <strong>{task.title}</strong>
          <div className="sub">{task.assignee || 'Unassigned'}</div>
          {overdue && <div className="badge danger">Overdue</div>}
        </div>
        <div className="row" style={{gap:6}}>
          <select value={task.status} className="select" onChange={e=>setStatus(e.target.value)}>
            <option value="todo">todo</option>
            <option value="doing">doing</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
          </select>
          <Button kind="danger" onClick={remove}>Delete</Button>
        </div>
      </div>
      {(task.startDate || task.endDate) && (
        <div className="sub" style={{marginTop:8}}>
          {task.startDate || '—'} → {task.endDate || '—'}
        </div>
      )}
    </div>
  )
}
