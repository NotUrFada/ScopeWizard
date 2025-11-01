import { useOutletContext, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { usePortfolioData } from '../features/projects/usePortfolioData.js'
import { calculateProjectProgress, countLateTasks, getHealthCounts, getBudgetTotals, getResourceUtilization } from '../features/projects/projectMetrics.js'

export default function Dashboard() {
  const { holidays } = useOutletContext()
  const portfolio = usePortfolioData()

  const tasks = portfolio.tasks
  const projects = portfolio.projects
  const overallProgress = calculateProjectProgress(tasks)
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const activeTasks = tasks.length - doneTasks
  const lateTasks = countLateTasks(tasks)

  const next7 = useMemo(() => (
    tasks
      .filter(task => task.endDate)
      .filter(task => {
        const due = new Date(task.endDate)
        const now = new Date()
        const diff = (due - now) / (1000 * 60 * 60 * 24)
        return diff >= 0 && diff <= 7
      })
      .slice(0, 6)
  ), [tasks])

  const healthCounts = useMemo(() => getHealthCounts(projects), [projects])
  const budgetTotals = useMemo(() => getBudgetTotals(projects), [projects])
  const topResources = useMemo(() => (
    getResourceUtilization(portfolio.resources, portfolio.allocations, tasks).slice(0, 3)
  ), [portfolio.resources, portfolio.allocations, tasks])

  const nextHoliday = holidays
    ?.map(h => ({ ...h, dateObj: new Date(h.date) }))
    ?.filter(h => h.dateObj >= new Date())
    ?.sort((a, b) => a.dateObj - b.dateObj)[0]

  return (
    <div className="grid" style={{ gap: 16 }}>
      {nextHoliday && (
        <div className="banner">
          Heads up: {nextHoliday.localName} on {nextHoliday.date}
        </div>
      )}

      <div className="grid cols-3">
        <div className="card">
          <div className="kpi">{projects.length}</div>
          <div className="sub">Projects in portfolio</div>
        </div>
        <div className="card">
          <div className="kpi">{activeTasks}</div>
          <div className="sub">Active tasks (Done {doneTasks})</div>
        </div>
        <div className="card">
          <div className="kpi">{overallProgress}%</div>
          <div className="sub">Portfolio progress</div>
        </div>
      </div>

      <div className="grid cols-3" style={{ gap: 16 }}>
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

        <div className="card">
          <strong>Budget burn</strong>
          <div className="space" />
          <div className="progress-track small">
            <div className="progress-fill" style={{ width: `${Math.min(100, budgetTotals.percentUsed)}%`, background: 'linear-gradient(135deg,#f97316,#ea580c)' }} />
          </div>
          <div className="sub" style={{ marginTop: 8 }}>
            Spent ${budgetTotals.totalActual.toLocaleString()} of ${budgetTotals.totalBudget.toLocaleString() || '0'}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Resource load</strong>
            <Link className="btn ghost" to="/resources">Manage</Link>
          </div>
          <div className="space" />
          {topResources.length === 0 ? (
            <div className="sub">No resource assignments yet.</div>
          ) : (
            <div className="grid" style={{ gap: 10 }}>
              {topResources.map(entry => (
                <div key={entry.resource.id} className="resource-meter">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span>{entry.resource.name}</span>
                    <span className={`badge ${entry.overCapacity ? 'danger' : ''}`}>{entry.utilizationPercent}%</span>
                  </div>
                  <div className="progress-track small">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(entry.utilizationPercent, 100)}%`,
                        background: entry.overCapacity ? 'linear-gradient(135deg,#f97316,#ea580c)' : undefined
                      }}
                    />
                  </div>
                  <div className="sub">Open tasks: {entry.activeTaskCount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <strong>Due in next 7 days</strong>
          <Link className="btn ghost" to="/projects">View all</Link>
        </div>
        {next7.length === 0 ? (
          <div className="sub">No upcoming deadlines this week.</div>
        ) : (
          <ul>
            {next7.map(task => (
              <li key={task.id}>{task.title} - due {task.endDate}</li>
            ))}
          </ul>
        )}
        {lateTasks.length > 0 && (
          <div className="badge danger" style={{ marginTop: 8 }}>Past due tasks: {lateTasks.length}</div>
        )}
      </div>
    </div>
  )
}
