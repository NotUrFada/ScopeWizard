import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  createTask,
  updateProject,
  assignResource
} from '../features/projects/projectStore.js'
import { usePortfolioData } from '../features/projects/usePortfolioData.js'
import { getCriticalTasks } from '../features/projects/projectMetrics.js'
import ProjectSummary from '../features/projects/ProjectSummary.jsx'
import ProjectTimeline from '../features/projects/ProjectTimeline.jsx'
import ProjectActivity from '../features/projects/ProjectActivity.jsx'
import TaskBoard from '../features/tasks/TaskBoard.jsx'
import TaskList from '../features/tasks/TaskList.jsx'
import TaskForm from '../features/tasks/TaskForm.jsx'
import ProjectForm from '../features/projects/ProjectForm.jsx'
import Modal from '../shared/Modal.jsx'
import Button from '../shared/Button.jsx'
import Alert from '../shared/Alert.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const portfolio = usePortfolioData()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [error, setError] = useState('')

  const project = useMemo(() => portfolio.projects.find(p => p.id === id), [portfolio.projects, id])
  const projectTasks = useMemo(() => {
    return portfolio.tasks
      .filter(t => t.projectId === id)
      .sort((a, b) => new Date(a.startDate || a.createdAt || 0) - new Date(b.startDate || b.createdAt || 0))
  }, [portfolio.tasks, id])
  const projectUpdates = useMemo(() => portfolio.updates.filter(u => u.projectId === id), [portfolio.updates, id])
  const criticalTasks = useMemo(() => getCriticalTasks(projectTasks), [projectTasks])

  if (!project) {
    if (!portfolio.projects.length) {
      return <div className="card">Loading project...</div>
    }
    return (
      <div className="card">
        Project not found. <button className="btn ghost" onClick={() => nav('/projects')}>Back</button>
      </div>
    )
  }

  async function handleAddTask(values) {
    try {
      const task = createTask(project.id, values)
      if (values.assigneeId) {
        const resource = portfolio.resources.find(r => r.id === values.assigneeId)
        const capacity = resource?.hoursPerWeek || 40
        const allocation = values.effortHours ? Math.min(1, Number(values.effortHours) / capacity) : 1
        assignResource(task.id, values.assigneeId, allocation)
      }
      setTaskModalOpen(false)
      setError('')
    } catch (err) {
      setError(err?.message || 'Failed to create task')
    }
  }

  async function handleProjectUpdate(values) {
    try {
      updateProject(project.id, {
        ...values,
        budget: values.budget === '' ? project.budget : Number(values.budget),
        actualSpend: values.actualSpend === '' ? project.actualSpend : Number(values.actualSpend)
      }, { logMessage: 'Project details updated' })
      setEditModalOpen(false)
      setError('')
    } catch (err) {
      setError(err?.message || 'Failed to update project')
    }
  }

  function handleStatusChange(nextStatus) {
    updateProject(project.id, { status: nextStatus }, { logMessage: `Status updated to ${nextStatus}` })
  }

  function handleHealthChange(nextHealth) {
    updateProject(project.id, { health: nextHealth }, { logMessage: `Health marked ${nextHealth}` })
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card project-header">
        <div className="project-header__info">
          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0 }}>{project.name}</h2>
            <span className={`badge ${project.health === 'off_track' ? 'danger' : project.health === 'at_risk' ? 'warn' : 'ok'}`}>{project.health}</span>
            <span className={`badge ${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warn' : ''}`}>{project.priority}</span>
          </div>
          <div className="sub" style={{ marginTop: 6 }}>{project.description || 'No description provided.'}</div>
          <div className="project-header__chips">
            <span className="badge">Owner: {project.owner || 'Unassigned'}</span>
            {project.category && <span className="badge">{project.category}</span>}
            <span className="badge">Risk: {project.riskLevel}</span>
            {project.startDate && project.endDate && (
              <span className="badge">{project.startDate} → {project.endDate}</span>
            )}
          </div>
        </div>
        <div className="project-header__actions">
          <Link className="btn ghost" to="/projects">Back</Link>
          <select className="select" value={project.status} onChange={e => handleStatusChange(e.target.value)}>
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
          <select className="select" value={project.health} onChange={e => handleHealthChange(e.target.value)}>
            <option value="on_track">on_track</option>
            <option value="at_risk">at_risk</option>
            <option value="off_track">off_track</option>
          </select>
          <Button kind="ghost" onClick={() => setEditModalOpen(true)}>Edit Project</Button>
          <Button kind="primary" onClick={() => setTaskModalOpen(true)}>Add Task</Button>
        </div>
      </div>

      {error && <Alert kind="error" message={error} />}

      <ProjectSummary project={project} tasks={projectTasks} />

      <div className="grid cols-2" style={{ gap: 20 }}>
        <ProjectTimeline project={project} tasks={projectTasks} />
        <ProjectActivity updates={projectUpdates} criticalTasks={criticalTasks} />
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Kanban Board</strong>
          <span className="sub">Drag-free quick moves</span>
        </div>
        <TaskBoard tasks={projectTasks} onChange={() => {}} resources={portfolio.resources} />
      </div>

      <TaskList
        tasks={projectTasks}
        allTasks={projectTasks}
        resources={portfolio.resources}
        allocations={portfolio.allocations}
        onChange={() => {}}
      />

      <Modal open={taskModalOpen} title="Add Task" onClose={() => setTaskModalOpen(false)}>
        <TaskForm
          onSubmit={handleAddTask}
          existingTasks={projectTasks}
          resources={portfolio.resources}
        />
      </Modal>

      <Modal open={editModalOpen} title="Edit Project" onClose={() => setEditModalOpen(false)}>
        <ProjectForm onSubmit={handleProjectUpdate} initialValues={project} />
      </Modal>
    </div>
  )
}
