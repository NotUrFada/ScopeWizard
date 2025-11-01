import { differenceInCalendarDays, parseISO, isAfter, isBefore, isValid, max, min } from 'date-fns'

function parseDate(value) {
  if (!value) return null
  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value)
  return isValid(parsed) ? parsed : null
}

export function getTimelineBounds(project, tasks = []) {
  const dates = []
  if (project?.startDate) dates.push(parseDate(project.startDate))
  if (project?.endDate) dates.push(parseDate(project.endDate))
  tasks.forEach(task => {
    if (task.startDate) dates.push(parseDate(task.startDate))
    if (task.endDate) dates.push(parseDate(task.endDate))
  })
  const valid = dates.filter(Boolean)
  if (!valid.length) {
    const today = new Date()
    return { start: today, end: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30) }
  }
  return {
    start: valid.reduce((acc, date) => (isBefore(date, acc) ? date : acc), valid[0]),
    end: valid.reduce((acc, date) => (isAfter(date, acc) ? date : acc), valid[0])
  }
}

export function calculateProjectProgress(tasks = []) {
  if (!tasks.length) return 0
  const total = tasks.length
  const sum = tasks.reduce((acc, task) => {
    if (Number.isFinite(task.progress)) return acc + Number(task.progress)
    if (task.status === 'done') return acc + 100
    if (task.status === 'doing') return acc + 50
    return acc
  }, 0)
  return Math.round(sum / total)
}

export function countLateTasks(tasks = [], referenceDate = new Date()) {
  return tasks.filter(task => {
    if (!task.endDate || task.status === 'done') return false
    const end = parseDate(task.endDate)
    return end && isBefore(end, referenceDate)
  })
}

export function getUpcomingMilestone(tasks = [], referenceDate = new Date()) {
  const milestones = tasks.filter(task => task.type === 'milestone' && task.endDate)
  if (!milestones.length) return null
  const ref = parseDate(referenceDate)
  const upcoming = milestones
    .map(task => ({ ...task, endObj: parseDate(task.endDate) }))
    .filter(task => task.endObj && !isBefore(task.endObj, ref))
    .sort((a, b) => a.endObj - b.endObj)
  return upcoming[0] || milestones.sort((a, b) => parseDate(a.endDate) - parseDate(b.endDate))[0]
}

export function sumEffortHours(tasks = []) {
  return tasks.reduce((acc, task) => acc + (Number(task.effortHours) || 0), 0)
}

export function sumTaskCost(tasks = []) {
  return tasks.reduce((acc, task) => acc + (Number(task.cost) || 0), 0)
}

export function getCriticalTasks(tasks = []) {
  // Simple heuristic: tasks with status not done whose dependencies are all done are considered critical next up
  const map = tasks.reduce((acc, task) => {
    acc[task.id] = task
    return acc
  }, {})
  return tasks.filter(task => {
    if (task.status === 'done') return false
    if (!task.dependsOn?.length) return false
    return task.dependsOn.every(id => map[id]?.status === 'done')
  })
}

export function getTaskStatusCounts(tasks = []) {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {})
}

export function getPortfolioDateRange(projects = []) {
  if (!projects.length) return null
  const start = projects
    .map(p => parseDate(p.startDate))
    .filter(Boolean)
    .reduce((acc, date) => min([acc, date]), parseDate(projects[0].startDate) || new Date())
  const end = projects
    .map(p => parseDate(p.endDate))
    .filter(Boolean)
    .reduce((acc, date) => max([acc, date]), parseDate(projects[0].endDate) || new Date())
  return { start, end }
}

export function getScheduleMeta(project, tasks = []) {
  const { start, end } = getTimelineBounds(project, tasks)
  const today = new Date()
  const totalDuration = differenceInCalendarDays(end, start) || 1
  const elapsed = differenceInCalendarDays(today, start)
  const progress = calculateProjectProgress(tasks)
  const timelineProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)))
  return {
    totalDuration,
    elapsed,
    timelineProgress,
    progress,
    daysRemaining: differenceInCalendarDays(end, today),
    start,
    end
  }
}

export function getHealthCounts(projects = []) {
  return projects.reduce((acc, project) => {
    const key = project?.health || 'on_track'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, { on_track: 0, at_risk: 0, off_track: 0 })
}

export function getBudgetTotals(projects = []) {
  const totals = projects.reduce((acc, project) => {
    acc.totalBudget += Number(project?.budget) || 0
    acc.totalActual += Number(project?.actualSpend) || 0
    return acc
  }, { totalBudget: 0, totalActual: 0 })
  const percentUsed = totals.totalBudget ? Math.round((totals.totalActual / totals.totalBudget) * 100) : 0
  return { ...totals, percentUsed }
}

export function getResourceUtilization(resources = [], allocations = [], tasks = []) {
  const taskMap = tasks.reduce((acc, task) => {
    acc[task.id] = task
    return acc
  }, {})

  return resources.map(resource => {
    const resourceAllocations = allocations.filter(a => a.resourceId === resource.id)
    const allocationTaskIds = new Set(resourceAllocations.map(a => a.taskId))
    const directTasks = tasks.filter(task => task.assigneeId === resource.id)
    directTasks.forEach(task => allocationTaskIds.add(task.id))
    const assignedTasks = Array.from(allocationTaskIds)
      .map(id => taskMap[id])
      .filter(Boolean)

    const allocationSum = resourceAllocations.reduce((sum, alloc) => sum + (Number(alloc.allocation) || 0), 0)
    const capacityHours = Number(resource.hoursPerWeek) || 40
    const effortHours = assignedTasks.reduce((sum, task) => sum + (Number(task.effortHours) || 0), 0)
    const utilizationByEffort = capacityHours ? effortHours / capacityHours : 0
    const utilization = Math.max(allocationSum, utilizationByEffort)
    const utilizationPercent = Math.round(Math.min(utilization, 1.5) * 100)
    const activeTasks = assignedTasks.filter(task => task.status !== 'done')
    const upcoming = activeTasks
      .filter(task => task.endDate)
      .map(task => ({ ...task, endObj: parseDate(task.endDate) }))
      .filter(task => task.endObj)
      .sort((a, b) => a.endObj - b.endObj)

    return {
      resource,
      allocation: allocationSum,
      utilization,
      utilizationPercent,
      overCapacity: utilization > 1,
      effortHours,
      capacityHours,
      activeTaskCount: activeTasks.length,
      upcoming: upcoming.slice(0, 3)
    }
  }).sort((a, b) => b.utilization - a.utilization)
}
