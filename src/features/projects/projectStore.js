import { nanoid } from 'nanoid'

export const EMPTY_PORTFOLIO_STATE = Object.freeze({
  projects: [],
  tasks: [],
  resources: [],
  allocations: [],
  updates: []
})

const STORAGE_KEYS = {
  projects: 'projects',
  tasks: 'tasks',
  resources: 'resources',
  allocations: 'allocations',
  updates: 'project_updates'
}

const DEFAULT_STATE = {
  projects: [],
  tasks: [],
  resources: [],
  allocations: [],
  updates: []
}

const SEED_VERSION_KEY = 'portfolio_seed_v1'

function safeParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to parse stored data', err)
    return fallback
  }
}

function read(key, fallback) {
  return safeParse(localStorage.getItem(key), fallback)
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function nowIso() {
  return new Date().toISOString()
}

function unique(list = []) {
  return Array.from(new Set(list.filter(Boolean)))
}

function calcDurationDays(startDate, endDate) {
  if (!startDate || !endDate) return null
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function randomColor() {
  const palette = ['#4f46e5', '#7c3aed', '#0ea5e9', '#059669', '#f97316', '#ef4444', '#14b8a6']
  return palette[Math.floor(Math.random() * palette.length)]
}

export function loadAll() {
  return {
    projects: read(STORAGE_KEYS.projects, DEFAULT_STATE.projects),
    tasks: read(STORAGE_KEYS.tasks, DEFAULT_STATE.tasks),
    resources: read(STORAGE_KEYS.resources, DEFAULT_STATE.resources),
    allocations: read(STORAGE_KEYS.allocations, DEFAULT_STATE.allocations),
    updates: read(STORAGE_KEYS.updates, DEFAULT_STATE.updates)
  }
}

export function saveAll(patch = {}) {
  const current = loadAll()
  const next = { ...current, ...patch }
  Object.entries(STORAGE_KEYS).forEach(([stateKey, storageKey]) => {
    const value = next[stateKey] ?? DEFAULT_STATE[stateKey]
    write(storageKey, value)
  })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio:data:updated', { detail: next }))
  }
  return next
}

export function resetAll() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  localStorage.removeItem(SEED_VERSION_KEY)
}

export function ensureSeedData() {
  if (localStorage.getItem(SEED_VERSION_KEY)) return loadAll()
  const seed = buildSeedData()
  saveAll(seed)
  localStorage.setItem(SEED_VERSION_KEY, '1')
  return seed
}

export function createProject(data) {
  const state = loadAll()
  const now = nowIso()
  const project = {
    id: data?.id || `p_${nanoid(8)}`,
    name: data?.name?.trim() || 'Untitled Project',
    description: data?.description || '',
    startDate: data?.startDate || '',
    endDate: data?.endDate || '',
    status: data?.status || 'planned',
    budget: Number(data?.budget || 0),
    owner: data?.owner || '',
    priority: data?.priority || 'medium',
    health: data?.health || 'on_track',
    category: data?.category || 'strategic',
    riskLevel: data?.riskLevel || 'medium',
    actualSpend: Number(data?.actualSpend || 0),
    tasks: unique(data?.tasks || []),
    createdAt: now,
    updatedAt: now
  }
  const projects = [...state.projects, project]
  saveAll({ projects })
  logProjectUpdate(project.id, {
    type: 'status',
    message: `Project created (${project.status.replace(/_/g, ' ')})`,
    author: data?.author || 'System'
  })
  return project
}

export function updateProject(id, patch = {}, options = {}) {
  const state = loadAll()
  const index = state.projects.findIndex(p => p.id === id)
  if (index === -1) return null
  const now = nowIso()
  const prev = state.projects[index]
  const updated = {
    ...prev,
    ...patch,
    updatedAt: now
  }
  const projects = [...state.projects]
  projects[index] = updated
  saveAll({ projects })
  if (!options?.skipLog) {
    const statusChanged = patch.status && patch.status !== prev.status
    const message = options?.logMessage
      || (statusChanged ? `Status changed: ${prev.status} -> ${patch.status}` : 'Project updated')
    logProjectUpdate(id, {
      type: statusChanged ? 'status' : 'note',
      message,
      author: options?.author || 'System'
    })
  }
  return updated
}

export function deleteProject(id) {
  const state = loadAll()
  const remainingProjects = state.projects.filter(p => p.id !== id)
  const removedTaskIds = state.tasks.filter(t => t.projectId === id).map(t => t.id)
  const remainingTasks = state.tasks.filter(t => t.projectId !== id)
  const remainingAllocations = state.allocations.filter(a => !removedTaskIds.includes(a.taskId))
  const remainingUpdates = state.updates.filter(u => u.projectId !== id)
  saveAll({
    projects: remainingProjects,
    tasks: remainingTasks,
    allocations: remainingAllocations,
    updates: remainingUpdates
  })
}

export function createTask(projectId, data) {
  const state = loadAll()
  const project = state.projects.find(p => p.id === projectId)
  if (!project) throw new Error(`Project ${projectId} not found`)
  const now = nowIso()
  const task = {
    id: data?.id || `t_${nanoid(8)}`,
    projectId,
    title: data?.title?.trim() || 'Untitled Task',
    assignee: data?.assignee || '',
    assigneeId: data?.assigneeId || '',
    startDate: data?.startDate || '',
    endDate: data?.endDate || '',
    status: data?.status || 'todo',
    notes: data?.notes || '',
    dependsOn: unique(data?.dependsOn || []),
    effortHours: Number(data?.effortHours || 0),
    cost: Number(data?.cost || 0),
    type: data?.type || 'task',
    progress: Number(data?.progress ?? 0),
    priority: data?.priority || 'medium',
    tags: data?.tags || [],
    durationDays: calcDurationDays(data?.startDate, data?.endDate),
    createdAt: now,
    updatedAt: now
  }

  const tasks = [...state.tasks, task]
  const projects = state.projects.map(p => (
    p.id === projectId
      ? { ...p, tasks: unique([...(p.tasks || []), task.id]), updatedAt: now }
      : p
  ))

  let allocations = state.allocations
  if (Array.isArray(data?.assignments) && data.assignments.length) {
    const assignments = data.assignments
      .filter(a => a?.resourceId)
      .map(a => ({
        id: a.id || `a_${nanoid(6)}`,
        taskId: task.id,
        resourceId: a.resourceId,
        allocation: typeof a.allocation === 'number' ? a.allocation : 1,
        role: a.role || '',
        createdAt: now
      }))
    allocations = [...state.allocations, ...assignments]
  }

  saveAll({ tasks, projects, allocations })
  logProjectUpdate(projectId, {
    type: 'task',
    message: `Task created: ${task.title}`,
    author: data?.author || 'System'
  })
  return task
}

export function updateTask(id, patch = {}, options = {}) {
  const state = loadAll()
  const index = state.tasks.findIndex(t => t.id === id)
  if (index === -1) return null
  const now = nowIso()
  const prev = state.tasks[index]
  const updated = {
    ...prev,
    ...patch,
    dependsOn: patch.dependsOn ? unique(patch.dependsOn) : prev.dependsOn,
    durationDays: patch.startDate || patch.endDate
      ? calcDurationDays(patch.startDate ?? prev.startDate, patch.endDate ?? prev.endDate)
      : prev.durationDays,
    updatedAt: now
  }

  const tasks = [...state.tasks]
  tasks[index] = updated

  let allocations = state.allocations
  if (Array.isArray(options?.assignments)) {
    const filtered = state.allocations.filter(a => a.taskId !== id)
    const assignments = options.assignments
      .filter(a => a?.resourceId)
      .map(a => ({
        id: a.id || `a_${nanoid(6)}`,
        taskId: id,
        resourceId: a.resourceId,
        allocation: typeof a.allocation === 'number' ? a.allocation : 1,
        role: a.role || '',
        createdAt: now
      }))
    allocations = [...filtered, ...assignments]
  }

  saveAll({ tasks, allocations })

  if (!options?.skipLog) {
    const statusChanged = patch.status && patch.status !== prev.status
    const message = options?.logMessage
      || (statusChanged
        ? `Task status changed: ${prev.title} (${prev.status} -> ${patch.status})`
        : `Task updated: ${prev.title}`)
    logProjectUpdate(prev.projectId, {
      type: statusChanged ? 'task' : 'note',
      message,
      author: options?.author || 'System'
    })
  }

  return updated
}

export function deleteTask(id) {
  const state = loadAll()
  const task = state.tasks.find(t => t.id === id)
  if (!task) return
  const tasks = state.tasks.filter(t => t.id !== id)
  const projects = state.projects.map(p => (
    p.id === task.projectId
      ? { ...p, tasks: (p.tasks || []).filter(tid => tid !== id), updatedAt: nowIso() }
      : p
  ))
  const allocations = state.allocations.filter(a => a.taskId !== id)
  saveAll({ tasks, projects, allocations })
  logProjectUpdate(task.projectId, {
    type: 'task',
    message: `Task removed: ${task.title}`
  })
}

export function createResource(data) {
  const state = loadAll()
  const resource = {
    id: data?.id || `r_${nanoid(8)}`,
    name: data?.name?.trim() || 'Unnamed Resource',
    role: data?.role || '',
    email: data?.email || '',
    hoursPerWeek: Number(data?.hoursPerWeek || 40),
    costRate: Number(data?.costRate || 0),
    color: data?.color || randomColor(),
    active: data?.active ?? true,
    location: data?.location || '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
  const resources = [...state.resources, resource]
  saveAll({ resources })
  return resource
}

export function updateResource(id, patch = {}) {
  const state = loadAll()
  const index = state.resources.findIndex(r => r.id === id)
  if (index === -1) return null
  const resource = {
    ...state.resources[index],
    ...patch,
    updatedAt: nowIso()
  }
  const resources = [...state.resources]
  resources[index] = resource
  saveAll({ resources })
  return resource
}

export function deleteResource(id) {
  const state = loadAll()
  const resources = state.resources.filter(r => r.id !== id)
  const allocations = state.allocations.filter(a => a.resourceId !== id)
  const tasks = state.tasks.map(t => (
    t.assigneeId === id
      ? { ...t, assigneeId: '', assignee: '', updatedAt: nowIso() }
      : t
  ))
  saveAll({ resources, allocations, tasks })
}

export function assignResource(taskId, resourceId, allocation = 1) {
  const state = loadAll()
  const task = state.tasks.find(t => t.id === taskId)
  const resource = state.resources.find(r => r.id === resourceId)
  if (!task || !resource) return null
  const filtered = state.allocations.filter(a => !(a.taskId === taskId && a.resourceId === resourceId))
  const record = {
    id: `a_${nanoid(6)}`,
    taskId,
    resourceId,
    allocation: Math.max(0, Math.min(1, allocation)),
    role: resource.role || '',
    createdAt: nowIso()
  }
  const allocations = [...filtered, record]
  saveAll({ allocations })
  updateTask(taskId, { assigneeId: resourceId, assignee: resource.name }, { skipLog: true })
  logProjectUpdate(task.projectId, {
    type: 'resource',
    message: `Assigned ${resource.name} to ${task.title}`
  })
  return record
}

export function unassignResource(taskId, resourceId) {
  const state = loadAll()
  const task = state.tasks.find(t => t.id === taskId)
  if (!task) return
  const allocations = state.allocations.filter(a => !(a.taskId === taskId && a.resourceId === resourceId))
  saveAll({ allocations })
  if (task.assigneeId === resourceId) {
    updateTask(taskId, { assigneeId: '', assignee: '' }, { skipLog: true })
    logProjectUpdate(task.projectId, {
      type: 'resource',
      message: `Unassigned resource from ${task.title}`
    })
  }
}

export function logProjectUpdate(projectId, data) {
  if (!projectId || !data?.message) return null
  const state = loadAll()
  const update = {
    id: data?.id || `u_${nanoid(8)}`,
    projectId,
    type: data?.type || 'note',
    message: data.message,
    author: data?.author || 'System',
    createdAt: data?.createdAt || nowIso()
  }
  const updates = [update, ...state.updates]
    .filter((item, index, arr) => index === arr.findIndex(other => other.id === item.id))
    .slice(0, 200)
  saveAll({ updates })
  return update
}

function buildSeedData() {
  const today = new Date()
  const format = offset => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return d.toISOString().slice(0, 10)
  }

  const resources = [
    {
      id: 'r_alex',
      name: 'Alex Morgan',
      role: 'Program Manager',
      email: 'alex@scopewizard.io',
      hoursPerWeek: 40,
      costRate: 120,
      color: '#4f46e5',
      active: true,
      location: 'New York',
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 'r_bella',
      name: 'Bella Chen',
      role: 'Design Lead',
      email: 'bella@scopewizard.io',
      hoursPerWeek: 35,
      costRate: 95,
      color: '#7c3aed',
      active: true,
      location: 'Remote',
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 'r_carlos',
      name: 'Carlos Rivera',
      role: 'Engineering Lead',
      email: 'carlos@scopewizard.io',
      hoursPerWeek: 40,
      costRate: 110,
      color: '#0ea5e9',
      active: true,
      location: 'Austin',
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 'r_danika',
      name: 'Danika Patel',
      role: 'QA Lead',
      email: 'danika@scopewizard.io',
      hoursPerWeek: 30,
      costRate: 85,
      color: '#059669',
      active: true,
      location: 'Toronto',
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
  ]

  const projects = [
    {
      id: 'p_launch',
      name: 'Product Launch 2025',
      description: 'Coordinate cross-functional launch activities, enablement, and GTM assets.',
      startDate: format(-21),
      endDate: format(65),
      status: 'in_progress',
      budget: 250000,
      owner: 'Alex Morgan',
      priority: 'high',
      health: 'on_track',
      category: 'Strategic Initiative',
      riskLevel: 'medium',
      actualSpend: 72000,
      tasks: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 'p_infra',
      name: 'Platform Modernization',
      description: 'Refactor monolith, migrate workloads to microservices, improve observability.',
      startDate: format(-45),
      endDate: format(120),
      status: 'in_progress',
      budget: 480000,
      owner: 'Carlos Rivera',
      priority: 'critical',
      health: 'at_risk',
      category: 'Engineering',
      riskLevel: 'high',
      actualSpend: 160000,
      tasks: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 'p_success',
      name: 'Customer Success Playbook',
      description: 'Build repeatable onboarding, QBR, and renewals motions for enterprise segment.',
      startDate: format(-10),
      endDate: format(45),
      status: 'planned',
      budget: 90000,
      owner: 'Bella Chen',
      priority: 'medium',
      health: 'on_track',
      category: 'Go To Market',
      riskLevel: 'low',
      actualSpend: 1000,
      tasks: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
  ]

  const tasks = [
    // Product Launch 2025 tasks
    {
      id: 't_launch_brief',
      projectId: 'p_launch',
      title: 'Finalize launch brief',
      assignee: 'Alex Morgan',
      assigneeId: 'r_alex',
      startDate: format(-14),
      endDate: format(-7),
      status: 'done',
      notes: 'Approved by leadership team',
      dependsOn: [],
      effortHours: 16,
      cost: 1920,
      type: 'task',
      progress: 100,
      priority: 'high',
      tags: ['brief'],
      durationDays: calcDurationDays(format(-14), format(-7)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_launch_assets',
      projectId: 'p_launch',
      title: 'Produce marketing assets',
      assignee: 'Bella Chen',
      assigneeId: 'r_bella',
      startDate: format(-7),
      endDate: format(14),
      status: 'doing',
      notes: 'Landing page draft ready',
      dependsOn: ['t_launch_brief'],
      effortHours: 80,
      cost: 7600,
      type: 'task',
      progress: 45,
      priority: 'high',
      tags: ['design'],
      durationDays: calcDurationDays(format(-7), format(14)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_launch_enablement',
      projectId: 'p_launch',
      title: 'Schedule enablement sessions',
      assignee: 'Alex Morgan',
      assigneeId: 'r_alex',
      startDate: format(7),
      endDate: format(21),
      status: 'todo',
      notes: 'Coordinate with CS leads',
      dependsOn: ['t_launch_brief'],
      effortHours: 24,
      cost: 2880,
      type: 'task',
      progress: 10,
      priority: 'medium',
      tags: ['enablement'],
      durationDays: calcDurationDays(format(7), format(21)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_launch_event',
      projectId: 'p_launch',
      title: 'Virtual launch event',
      assignee: 'Bella Chen',
      assigneeId: 'r_bella',
      startDate: format(28),
      endDate: format(28),
      status: 'planned',
      notes: 'Broadcast via Zoom webinars',
      dependsOn: ['t_launch_assets'],
      effortHours: 40,
      cost: 3800,
      type: 'milestone',
      progress: 0,
      priority: 'high',
      tags: ['event'],
      durationDays: calcDurationDays(format(28), format(28)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },

    // Platform Modernization tasks
    {
      id: 't_infra_observe',
      projectId: 'p_infra',
      title: 'Observability baseline',
      assignee: 'Carlos Rivera',
      assigneeId: 'r_carlos',
      startDate: format(-30),
      endDate: format(-5),
      status: 'done',
      notes: 'Metrics + tracing instrumented',
      dependsOn: [],
      effortHours: 120,
      cost: 13200,
      type: 'task',
      progress: 100,
      priority: 'high',
      tags: ['platform'],
      durationDays: calcDurationDays(format(-30), format(-5)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_infra_service_split',
      projectId: 'p_infra',
      title: 'Split billing service',
      assignee: 'Carlos Rivera',
      assigneeId: 'r_carlos',
      startDate: format(-5),
      endDate: format(40),
      status: 'doing',
      notes: 'Beta release planned next sprint',
      dependsOn: ['t_infra_observe'],
      effortHours: 200,
      cost: 22000,
      type: 'task',
      progress: 35,
      priority: 'critical',
      tags: ['platform', 'architecture'],
      durationDays: calcDurationDays(format(-5), format(40)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_infra_ci',
      projectId: 'p_infra',
      title: 'Harden CI pipeline',
      assignee: 'Danika Patel',
      assigneeId: 'r_danika',
      startDate: format(5),
      endDate: format(32),
      status: 'todo',
      notes: 'Introduce parallel smoke suite',
      dependsOn: ['t_infra_observe'],
      effortHours: 90,
      cost: 7650,
      type: 'task',
      progress: 5,
      priority: 'high',
      tags: ['quality'],
      durationDays: calcDurationDays(format(5), format(32)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_infra_cutover',
      projectId: 'p_infra',
      title: 'Cutover planning',
      assignee: 'Alex Morgan',
      assigneeId: 'r_alex',
      startDate: format(40),
      endDate: format(70),
      status: 'planned',
      notes: 'Need runbook + rollback steps',
      dependsOn: ['t_infra_service_split', 't_infra_ci'],
      effortHours: 60,
      cost: 7200,
      type: 'task',
      progress: 0,
      priority: 'medium',
      tags: ['cutover'],
      durationDays: calcDurationDays(format(40), format(70)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },

    // Customer Success Playbook tasks
    {
      id: 't_success_research',
      projectId: 'p_success',
      title: 'Interview top accounts',
      assignee: 'Bella Chen',
      assigneeId: 'r_bella',
      startDate: format(0),
      endDate: format(14),
      status: 'in_progress',
      notes: 'Schedule 6 interviews',
      dependsOn: [],
      effortHours: 40,
      cost: 3800,
      type: 'task',
      progress: 25,
      priority: 'medium',
      tags: ['research'],
      durationDays: calcDurationDays(format(0), format(14)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      id: 't_success_playbook',
      projectId: 'p_success',
      title: 'Draft success playbook',
      assignee: 'Alex Morgan',
      assigneeId: 'r_alex',
      startDate: format(14),
      endDate: format(35),
      status: 'planned',
      notes: 'Outline onboarding, adoption, renewal motions',
      dependsOn: ['t_success_research'],
      effortHours: 80,
      cost: 9600,
      type: 'task',
      progress: 0,
      priority: 'medium',
      tags: ['playbook'],
      durationDays: calcDurationDays(format(14), format(35)),
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
  ]

  const allocations = [
    { id: 'a_launch_1', taskId: 't_launch_brief', resourceId: 'r_alex', allocation: 0.35, role: 'Program Manager', createdAt: nowIso() },
    { id: 'a_launch_2', taskId: 't_launch_assets', resourceId: 'r_bella', allocation: 0.6, role: 'Design Lead', createdAt: nowIso() },
    { id: 'a_launch_3', taskId: 't_launch_enablement', resourceId: 'r_alex', allocation: 0.25, role: 'Program Manager', createdAt: nowIso() },
    { id: 'a_infra_1', taskId: 't_infra_observe', resourceId: 'r_carlos', allocation: 0.75, role: 'Engineering Lead', createdAt: nowIso() },
    { id: 'a_infra_2', taskId: 't_infra_service_split', resourceId: 'r_carlos', allocation: 0.85, role: 'Engineering Lead', createdAt: nowIso() },
    { id: 'a_infra_3', taskId: 't_infra_ci', resourceId: 'r_danika', allocation: 0.5, role: 'QA Lead', createdAt: nowIso() },
    { id: 'a_success_1', taskId: 't_success_research', resourceId: 'r_bella', allocation: 0.4, role: 'Design Lead', createdAt: nowIso() }
  ]

  const projectTasksMap = tasks.reduce((acc, task) => {
    acc[task.projectId] = acc[task.projectId] || []
    acc[task.projectId].push(task.id)
    return acc
  }, {})

  const enrichedProjects = projects.map(project => ({
    ...project,
    tasks: unique([...(project.tasks || []), ...(projectTasksMap[project.id] || [])])
  }))

  const updates = [
    {
      id: 'u_launch_1',
      projectId: 'p_launch',
      type: 'status',
      message: 'Kickoff completed and workstreams mobilized.',
      author: 'Alex Morgan',
      createdAt: nowIso()
    },
    {
      id: 'u_infra_1',
      projectId: 'p_infra',
      type: 'risk',
      message: 'Migration blocked by vendor API limits - mitigation plan drafted.',
      author: 'Carlos Rivera',
      createdAt: nowIso()
    },
    {
      id: 'u_success_1',
      projectId: 'p_success',
      type: 'note',
      message: 'Awaiting interview availability from 3 customers.',
      author: 'Bella Chen',
      createdAt: nowIso()
    }
  ]

  return {
    projects: enrichedProjects,
    tasks,
    resources,
    allocations,
    updates
  }
}
