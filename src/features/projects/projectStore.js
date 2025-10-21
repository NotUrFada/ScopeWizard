import { nanoid } from 'nanoid'

const PKEY = 'projects'
const TKEY = 'tasks'

export function loadAll() {
  const projects = JSON.parse(localStorage.getItem(PKEY) || '[]')
  const tasks = JSON.parse(localStorage.getItem(TKEY) || '[]')
  return { projects, tasks }
}

export function saveAll({ projects, tasks }) {
  localStorage.setItem(PKEY, JSON.stringify(projects))
  localStorage.setItem(TKEY, JSON.stringify(tasks))
}

export function createProject(data) {
  const { projects, tasks } = loadAll()
  const project = {
    id: `p_${nanoid(8)}`,
    name: data.name,
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    status: data.status || 'planned',
    budget: Number(data.budget || 0),
    tasks: []
  }
  projects.push(project)
  saveAll({ projects, tasks })
  return project
}

export function updateProject(id, patch) {
  const { projects, tasks } = loadAll()
  const i = projects.findIndex(p => p.id === id)
  if (i === -1) return null
  projects[i] = { ...projects[i], ...patch }
  saveAll({ projects, tasks })
  return projects[i]
}

export function deleteProject(id) {
  let { projects, tasks } = loadAll()
  projects = projects.filter(p => p.id !== id)
  tasks = tasks.filter(t => t.projectId !== id)
  saveAll({ projects, tasks })
}

export function createTask(projectId, data) {
  const { projects, tasks } = loadAll()
  const task = {
    id: `t_${nanoid(8)}`,
    projectId,
    title: data.title,
    assignee: data.assignee || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    status: data.status || 'todo',
    notes: data.notes || '',
    dependsOn: data.dependsOn || []
  }
  tasks.push(task)
  const p = projects.find(p => p.id === projectId)
  if (p && !p.tasks.includes(task.id)) p.tasks.push(task.id)
  saveAll({ projects, tasks })
  return task
}

export function updateTask(id, patch) {
  const { projects, tasks } = loadAll()
  const i = tasks.findIndex(t => t.id === id)
  if (i === -1) return null
  tasks[i] = { ...tasks[i], ...patch }
  saveAll({ projects, tasks })
  return tasks[i]
}

export function deleteTask(id) {
  const state = loadAll()
  state.tasks = state.tasks.filter(t => t.id !== id)
  state.projects = state.projects.map(p => ({ ...p, tasks: p.tasks.filter(tid => tid !== id) }))
  saveAll(state)
}
