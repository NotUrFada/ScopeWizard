import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onChange }) {
  if (!tasks?.length) return <div className="card">No tasks yet.</div>
  return (
    <div className="grid cols-2">
      {tasks.map(t => <TaskItem key={t.id} task={t} onChange={onChange} />)}
    </div>
  )
}
