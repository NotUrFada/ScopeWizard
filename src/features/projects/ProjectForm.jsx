import { useState } from 'react'
import Button from '../../shared/Button.jsx'
import FormField from '../../shared/FormField.jsx'
import { required, dateOrder } from '../../lib/validators.js'

export default function ProjectForm({ onSubmit, initialValues }) {
  const [values, setValues] = useState(() => ({
    name: '', description: '', startDate: '', endDate: '', status: 'planned', budget: '',
    ...(initialValues || {})
  }))
  const [errors, setErrors] = useState({})

  function validate(v) {
    const e = {}
    e.name = required(v.name)
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
      <FormField label="Name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" className="input" value={values.name} onChange={handleChange} required />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <textarea id="description" name="description" className="textarea" rows="3" value={values.description} onChange={handleChange} />
      </FormField>
      <div className="row" style={{gap:12}}>
        <FormField label="Start Date" htmlFor="startDate" error={errors.dateOrder}>
          <input id="startDate" name="startDate" type="date" className="input" value={values.startDate} onChange={handleChange} />
        </FormField>
        <FormField label="End Date" htmlFor="endDate">
          <input id="endDate" name="endDate" type="date" className="input" value={values.endDate} onChange={handleChange} />
        </FormField>
      </div>
      <div className="row" style={{gap:12}}>
        <FormField label="Status" htmlFor="status">
          <select id="status" name="status" className="select" value={values.status} onChange={handleChange}>
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
        </FormField>
        <FormField label="Budget (USD)" htmlFor="budget">
          <input id="budget" name="budget" type="number" className="input" value={values.budget} onChange={handleChange} min="0" step="1" />
        </FormField>
      </div>
      <div className="row" style={{justifyContent:'flex-end', gap:8}}>
        <button className="btn ghost" type="button" onClick={()=>history.back()}>Cancel</button>
        <Button kind="primary" type="submit">Save</Button>
      </div>
    </form>
  )
}
