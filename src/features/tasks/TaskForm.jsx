import { useMemo, useState } from 'react'
import Button from '../../shared/Button.jsx'
import FormField from '../../shared/FormField.jsx'
import { required, dateOrder } from '../../lib/validators.js'

const STATUS_OPTIONS = ['todo', 'doing', 'blocked', 'done']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']
const TYPE_OPTIONS = ['task', 'milestone', 'deliverable']

export default function TaskForm({ onSubmit, existingTasks = [], resources = [] }) {
  const [values, setValues] = useState({
    title: '',
    assignee: '',
    assigneeId: '',
    startDate: '',
    endDate: '',
    status: 'todo',
    notes: '',
    dependsOn: [],
    effortHours: '',
    cost: '',
    progress: 0,
    priority: 'medium',
    type: 'task',
    tags: ''
  })
  const [errors, setErrors] = useState({})

  const dependencyOptions = useMemo(() => existingTasks.map(t => ({ id: t.id, title: t.title })), [existingTasks])

  function validate(v) {
    const e = {}
    e.title = required(v.title)
    e.dateOrder = dateOrder(v.startDate, v.endDate)
    if (v.progress < 0 || v.progress > 100) e.progress = 'Progress must be 0-100'
    if (v.effortHours && Number(v.effortHours) < 0) e.effortHours = 'Effort cannot be negative'
    if (v.cost && Number(v.cost) < 0) e.cost = 'Cost cannot be negative'
    Object.keys(e).forEach(k => !e[k] && delete e[k])
    return e
  }

  function handleChange(e) {
    const { name, value, selectedOptions } = e.target
    if (name === 'assigneeId') {
      const resource = resources.find(r => r.id === value)
      setValues(s => ({ ...s, assigneeId: value, assignee: resource ? resource.name : '' }))
      return
    }
    if (name === 'dependsOn') {
      const next = Array.from(selectedOptions).map(opt => opt.value)
      setValues(s => ({ ...s, dependsOn: next }))
      return
    }
    if (name === 'progress') {
      setValues(s => ({ ...s, progress: Number(value) }))
      return
    }
    const numericFields = ['effortHours', 'cost']
    if (numericFields.includes(name)) {
      const sanitized = value === '' ? '' : value.replace(/[^0-9.]/g, '')
      setValues(s => ({ ...s, [name]: sanitized }))
      return
    }
    setValues(s => ({ ...s, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const eobj = validate(values)
    setErrors(eobj)
    if (Object.keys(eobj).length) return
    const payload = {
      ...values,
      effortHours: values.effortHours === '' ? 0 : Number(values.effortHours),
      cost: values.cost === '' ? 0 : Number(values.cost),
      progress: Number(values.progress || 0),
      tags: values.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    }
    onSubmit?.(payload)
  }

  function handleAssigneeNameChange(e) {
    const { value } = e.target
    setValues(s => ({ ...s, assignee: value, assigneeId: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      <FormField label="Title" htmlFor="title" error={errors.title}>
        <input id="title" name="title" className="input" value={values.title} onChange={handleChange} required />
      </FormField>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Type" htmlFor="type">
          <select id="type" name="type" className="select" value={values.type} onChange={handleChange}>
            {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Priority" htmlFor="priority">
          <select id="priority" name="priority" className="select" value={values.priority} onChange={handleChange}>
            {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Status" htmlFor="status">
          <select id="status" name="status" className="select" value={values.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Progress" htmlFor="progress" error={errors.progress}>
          <input id="progress" name="progress" type="range" min="0" max="100" step="5" value={values.progress} onChange={handleChange} />
          <div className="sub">{values.progress}%</div>
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Resource Assignee" htmlFor="assigneeId">
          <select id="assigneeId" name="assigneeId" className="select" value={values.assigneeId} onChange={handleChange}>
            <option value="">Unassigned</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}{r.role ? ` - ${r.role}` : ''}</option>)}
          </select>
        </FormField>
        <FormField label="External/Custom Owner" htmlFor="assignee">
          <input id="assignee" name="assignee" className="input" value={values.assignee} onChange={handleAssigneeNameChange} placeholder="Optional name" />
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Start Date" htmlFor="startDate" error={errors.dateOrder}>
          <input id="startDate" name="startDate" type="date" className="input" value={values.startDate} onChange={handleChange} />
        </FormField>
        <FormField label="End Date" htmlFor="endDate">
          <input id="endDate" name="endDate" type="date" className="input" value={values.endDate} onChange={handleChange} />
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Effort (hours)" htmlFor="effortHours" error={errors.effortHours}>
          <input id="effortHours" name="effortHours" type="number" className="input" value={values.effortHours} onChange={handleChange} min="0" />
        </FormField>
        <FormField label="Cost (USD)" htmlFor="cost" error={errors.cost}>
          <input id="cost" name="cost" type="number" className="input" value={values.cost} onChange={handleChange} min="0" />
        </FormField>
      </div>

      {dependencyOptions.length > 0 && (
        <FormField label="Depends On" htmlFor="dependsOn">
          <select id="dependsOn" name="dependsOn" className="select" multiple value={values.dependsOn} onChange={handleChange} size={Math.min(6, dependencyOptions.length)}>
            {dependencyOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.title}</option>
            ))}
          </select>
          <div className="sub">Hold Cmd/Ctrl to select multiple tasks</div>
        </FormField>
      )}

      <FormField label="Tags" htmlFor="tags">
        <input id="tags" name="tags" className="input" value={values.tags} onChange={handleChange} placeholder="comma separated" />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <textarea id="notes" name="notes" className="textarea" rows="3" value={values.notes} onChange={handleChange} />
      </FormField>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn ghost" type="button" onClick={() => history.back()}>Cancel</button>
        <Button kind="primary" type="submit">Add Task</Button>
      </div>
    </form>
  )
}
