import { useState } from 'react'
import Button from '../../shared/Button.jsx'
import FormField from '../../shared/FormField.jsx'
import { required, dateOrder } from '../../lib/validators.js'

export default function TaskForm({ onSubmit }) {
  const [values, setValues] = useState({
    title: '', assignee: '', startDate: '', endDate: '', status: 'todo', notes: ''
  })
  const [errors, setErrors] = useState({})

  function validate(v) {
    const e = {}
    e.title = required(v.title)
    e.dateOrder = dateOrder(v.startDate, v.endDate)
    Object.keys(e).forEach(k => !e[k] && delete e[k])
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setValues(s => ({ ...s, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const eobj = validate(values)
    setErrors(eobj)
    if (Object.keys(eobj).length) return
    onSubmit?.(values)
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{gap:12}}>
      <FormField label="Title" htmlFor="title" error={errors.title}>
        <input id="title" name="title" className="input" value={values.title} onChange={handleChange} required />
      </FormField>
      <FormField label="Assignee" htmlFor="assignee">
        <input id="assignee" name="assignee" className="input" value={values.assignee} onChange={handleChange} />
      </FormField>
      <div className="row" style={{gap:12}}>
        <FormField label="Start Date" htmlFor="startDate" error={errors.dateOrder}>
          <input id="startDate" name="startDate" type="date" className="input" value={values.startDate} onChange={handleChange} />
        </FormField>
        <FormField label="End Date" htmlFor="endDate">
          <input id="endDate" name="endDate" type="date" className="input" value={values.endDate} onChange={handleChange} />
        </FormField>
      </div>
      <FormField label="Status" htmlFor="status">
        <select id="status" name="status" className="select" value={values.status} onChange={handleChange}>
          <option value="todo">todo</option>
          <option value="doing">doing</option>
          <option value="blocked">blocked</option>
          <option value="done">done</option>
        </select>
      </FormField>
      <FormField label="Notes" htmlFor="notes">
        <textarea id="notes" name="notes" className="textarea" rows="3" value={values.notes} onChange={handleChange} />
      </FormField>
      <div className="row" style={{justifyContent:'flex-end', gap:8}}>
        <button className="btn ghost" type="button" onClick={()=>history.back()}>Cancel</button>
        <Button kind="primary" type="submit">Add Task</Button>
      </div>
    </form>
  )
}
