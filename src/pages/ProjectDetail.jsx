import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { loadAll, updateProject, createTask } from '../features/projects/projectStore.js'
import TaskList from '../features/tasks/TaskList.jsx'
import Modal from '../shared/Modal.jsx'
import TaskForm from '../features/tasks/TaskForm.jsx'
import Button from '../shared/Button.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [state, setState] = useState(loadAll())
  const project = state.projects.find(p => p.id === id)

  const projectTasks = useMemo(() => state.tasks.filter(t => t.projectId === id), [state.tasks, id])

  useEffect(() => { setState(loadAll()) }, [])

  const [open, setOpen] = useState(false)

  if (!project) return (
    <div className="card">
      Project not found. <button className="btn ghost" onClick={()=>nav('/projects')}>Back</button>
    </div>
  )

  function handleAddTask(values) {
    createTask(project.id, values)
    setState(loadAll())
    setOpen(false)
  }

  const days = 30
  function calcBar(start, end) {
    if (!start || !end) return { gridColumn: '1 / 2' }
    const s = new Date(start), e = new Date(end)
    const base = project.startDate ? new Date(project.startDate) : new Date()
    const offset = Math.max(0, Math.floor((s - base) / (1000*60*60*24)))
    const span = Math.max(1, Math.floor((e - s) / (1000*60*60*24)))
    const startCol = Math.min(days, offset + 1)
    const endCol = Math.min(days, startCol + span)
    return { gridColumn: `${startCol} / ${endCol}` }
  }

  function setStatus(status) {
    updateProject(project.id, { status })
    setState(loadAll())
  }

  return (
    <div className="grid" style={{gap:16}}>
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
        <h2 style={{margin:0}}>{project.name}</h2>
        <div className="row" style={{gap:8}}>
          <Link className="btn ghost" to="/projects">Back</Link>
          <select className="select" value={project.status} onChange={e=>setStatus(e.target.value)}>
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
          <button className="btn primary" onClick={()=>setOpen(true)}>Add Task</button>
        </div>
      </div>

      <div className="card">
        <strong>Timeline (approx 30-day grid)</strong>
        <div className="space" />
        <div className="timeline">
          {projectTasks.map(t => (
            <div key={t.id} className="bar" style={calcBar(t.startDate, t.endDate)} title={`${t.title}: ${t.startDate || '—'} → ${t.endDate || '—'}`} />
          ))}
        </div>
      </div>

      <TaskList tasks={projectTasks} onChange={()=>setState(loadAll())} />

      <Modal open={open} title="Add Task" onClose={()=>setOpen(false)}>
        <TaskForm onSubmit={handleAddTask} />
      </Modal>
    </div>
  )
}
