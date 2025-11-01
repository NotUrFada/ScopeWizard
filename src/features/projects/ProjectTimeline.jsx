import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { getTimelineBounds } from './projectMetrics.js'

const STATUS_CLASS = {
  todo: 'timeline-bar todo',
  doing: 'timeline-bar doing',
  blocked: 'timeline-bar blocked',
  done: 'timeline-bar done'
}

export default function ProjectTimeline({ project, tasks = [] }) {
  const { start, end } = getTimelineBounds(project, tasks)
  const totalDays = Math.max(1, differenceInCalendarDays(end, start))

  const bars = tasks.map(task => {
    if (!task.startDate || !task.endDate) return null
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.endDate)
    const offset = Math.max(0, differenceInCalendarDays(taskStart, start))
    const span = Math.max(1, differenceInCalendarDays(taskEnd, taskStart) || 1)
    const width = Math.min(100, (span / totalDays) * 100)
    const left = Math.max(0, Math.min(100, (offset / totalDays) * 100))
    const className = STATUS_CLASS[task.status] || 'timeline-bar'
    return {
      id: task.id,
      title: task.title,
      start: task.startDate,
      end: task.endDate,
      className,
      style: {
        width: `${width}%`,
        left: `${left}%`
      }
    }
  }).filter(Boolean)

  const tickCount = Math.min(12, Math.max(4, Math.round(totalDays / 7)))
  const tickStep = Math.max(1, Math.round(totalDays / tickCount))
  const ticks = []
  for (let i = 0; i <= tickCount; i += 1) {
    const dayOffset = Math.min(totalDays, i * tickStep)
    const date = addDays(start, dayOffset)
    ticks.push({
      label: format(date, 'MMM d'),
      left: `${Math.min(100, (dayOffset / totalDays) * 100)}%`
    })
  }

  return (
    <div className="card timeline-card">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <strong>Project Timeline</strong>
        <div className="sub">{format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')} ({totalDays} days)</div>
      </div>
      <div className="timeline-chart">
        <div className="timeline-axis">
          {ticks.map(tick => (
            <div key={tick.label} className="timeline-tick" style={{ left: tick.left }}>
              <span>{tick.label}</span>
            </div>
          ))}
        </div>
        <div className="timeline-bars">
          {bars.map(bar => (
            <div key={bar.id} className={bar.className} style={bar.style} title={`${bar.title}: ${bar.start} - ${bar.end}`}>
              <span>{bar.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="timeline-legend">
        <span className="legend-item"><span className="swatch todo" />Todo</span>
        <span className="legend-item"><span className="swatch doing" />In Progress</span>
        <span className="legend-item"><span className="swatch blocked" />Blocked</span>
        <span className="legend-item"><span className="swatch done" />Done</span>
      </div>
    </div>
  )
}
