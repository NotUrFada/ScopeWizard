import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onChange = () => {}, allTasks, resources = [], allocations = [] }) {
  if (!tasks?.length) return <div className="card">No tasks yet.</div>
  const reference = allTasks && allTasks.length ? allTasks : tasks
  const taskMap = reference.reduce((acc, task) => {
    acc[task.id] = task
    return acc
  }, {})

  return (
    <div className="grid cols-2">
      {tasks.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          taskMap={taskMap}
          onChange={onChange}
          resources={resources}
          allocations={allocations}
        />
      ))}
    </div>
  )
}
