import { useMemo } from 'react'
import { usePortfolioData } from '../features/projects/usePortfolioData.js'
import { getTaskStatusCounts, getHealthCounts, getResourceUtilization, getBudgetTotals } from '../features/projects/projectMetrics.js'

export default function Reports() {
  const portfolio = usePortfolioData()
  const tasks = portfolio.tasks
  const projects = portfolio.projects

  const statusCounts = useMemo(() => getTaskStatusCounts(tasks), [tasks])
  const totalTasks = tasks.length || 1
  const healthCounts = useMemo(() => getHealthCounts(projects), [projects])
  const resourceData = useMemo(() => getResourceUtilization(portfolio.resources, portfolio.allocations, tasks), [portfolio.resources, portfolio.allocations, tasks])
  const budgetTotals = useMemo(() => getBudgetTotals(projects), [projects])
  const projectBudgets = useMemo(() => projects.map(project => ({
    id: project.id,
    name: project.name,
    budget: Number(project.budget) || 0,
    actual: Number(project.actualSpend) || 0,
    percent: project.budget ? Math.round((Number(project.actualSpend) || 0) / Number(project.budget) * 100) : 0
  })), [projects])
  const lateTasks = useMemo(() => tasks.filter(task => {
    if (!task.endDate || task.status === 'done') return false
    return new Date(task.endDate) < new Date()
  }).slice(0, 6), [tasks])

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h2>Reports</h2>

      <div className="grid cols-2" style={{ gap: 16 }}>
        <div className="card">
          <strong>Tasks by status</strong>
          <div className="space" />
          {['todo', 'doing', 'blocked', 'done'].map(status => {
            const count = statusCounts[status] || 0
            return (
              <div key={status} className="row" style={{ alignItems: 'center', gap: 10 }}>
                <div style={{ width: 90 }} className="sub">{status}</div>
                <div className="card" style={{ flex: 1, padding: 0 }}>
                  <div style={{
                    height: 12,
                    width: `${(count / totalTasks) * 100}%`,
                    background: 'linear-gradient(90deg, var(--brand), var(--brand-2))',
                    borderRadius: 6
                  }} />
                </div>
                <div className="badge">{count}</div>
              </div>
            )
          })}
        </div>

        <div className="card">
          <strong>Project health</strong>
          <div className="space" />
          <div className="grid" style={{ gap: 8 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>On track</span>
              <span className="badge ok">{healthCounts.on_track || 0}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>At risk</span>
              <span className="badge warn">{healthCounts.at_risk || 0}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>Off track</span>
              <span className="badge danger">{healthCounts.off_track || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <strong>Portfolio budget</strong>
        <div className="space" />
        <div className="sub">Total ${budgetTotals.totalActual.toLocaleString()} of ${budgetTotals.totalBudget.toLocaleString() || '0'}</div>
        <div className="space" />
        <div className="grid" style={{ gap: 12 }}>
          {projectBudgets.map(item => (
            <div key={item.id} className="project-budget-row">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{item.name}</strong>
                <span className="badge">{item.percent}%</span>
              </div>
              <div className="progress-track small">
                <div className="progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: item.percent > 100 ? 'linear-gradient(135deg,#f97316,#ea580c)' : undefined }} />
              </div>
              <div className="sub">${item.actual.toLocaleString()} of ${item.budget.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid cols-2" style={{ gap: 16 }}>
        <div className="card">
          <strong>Resource utilization</strong>
          <div className="space" />
          {resourceData.length === 0 ? (
            <div className="sub">No assignments recorded.</div>
          ) : (
            <div className="grid" style={{ gap: 8 }}>
              {resourceData.map(entry => (
                <div key={entry.resource.id} className="resource-meter">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span>{entry.resource.name}</span>
                    <span className={`badge ${entry.overCapacity ? 'danger' : ''}`}>{entry.utilizationPercent}%</span>
                  </div>
                  <div className="progress-track small">
                    <div className="progress-fill" style={{ width: `${Math.min(entry.utilizationPercent, 100)}%`, background: entry.overCapacity ? 'linear-gradient(135deg,#f97316,#ea580c)' : undefined }} />
                  </div>
                  <div className="sub">Active tasks: {entry.activeTaskCount}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <strong>Past due tasks</strong>
          <div className="space" />
          {lateTasks.length === 0 ? (
            <div className="sub">No overdue work items.</div>
          ) : (
            <ul>
              {lateTasks.map(task => (
                <li key={task.id}>{task.title} - was due {task.endDate}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
