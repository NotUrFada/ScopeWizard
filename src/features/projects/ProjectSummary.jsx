import { calculateProjectProgress, countLateTasks, getUpcomingMilestone, sumEffortHours, sumTaskCost, getScheduleMeta } from './projectMetrics.js'

export default function ProjectSummary({ project, tasks }) {
  const progress = calculateProjectProgress(tasks)
  const completed = tasks.filter(t => t.status === 'done').length
  const lateTasks = countLateTasks(tasks)
  const milestone = getUpcomingMilestone(tasks)
  const effort = sumEffortHours(tasks)
  const cost = sumTaskCost(tasks)
  const schedule = getScheduleMeta(project, tasks)
  const budget = Number(project.budget) || 0
  const actual = Number(project.actualSpend) || cost || 0
  const budgetUsed = budget ? Math.min(100, Math.round((actual / budget) * 100)) : 0

  return (
    <div className="grid cols-3 project-summary">
      <div className="card summary-card">
        <div className="summary-title">Progress</div>
        <div className="summary-value">{progress}%</div>
        <div className="sub">{completed}/{tasks.length || 0} tasks complete</div>
        <div className="progress-track small">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card summary-card">
        <div className="summary-title">Schedule</div>
        <div className="summary-value">{schedule.daysRemaining >= 0 ? `${schedule.daysRemaining}d left` : `${Math.abs(schedule.daysRemaining)}d past due`}</div>
        <div className="sub">Timeline progress {schedule.timelineProgress}%</div>
        {lateTasks.length > 0 ? (
          <div className="badge danger" style={{ marginTop: 8 }}>Late tasks: {lateTasks.length}</div>
        ) : (
          <div className="badge ok" style={{ marginTop: 8 }}>On schedule</div>
        )}
        {milestone && (
          <div className="sub" style={{ marginTop: 8 }}>
            Next milestone: <strong>{milestone.title}</strong> ({milestone.endDate})
          </div>
        )}
      </div>

      <div className="card summary-card">
        <div className="summary-title">Budget</div>
        <div className="summary-value">${actual.toLocaleString()}</div>
        <div className="sub">of ${budget ? budget.toLocaleString() : 'N/A'}</div>
        <div className="progress-track small">
          <div className="progress-fill" style={{ width: `${budgetUsed}%` }} />
        </div>
        <div className="sub" style={{ marginTop: 8 }}>Effort: {effort}h - Task cost ${cost.toLocaleString()}</div>
      </div>
    </div>
  )
}
