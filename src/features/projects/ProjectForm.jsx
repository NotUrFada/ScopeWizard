import { useState } from 'react'
import Button from '../../shared/Button.jsx'
import FormField from '../../shared/FormField.jsx'
import { required, dateOrder } from '../../lib/validators.js'

export default function ProjectForm({ onSubmit, initialValues }) {
  const [values, setValues] = useState(() => ({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    budget: '',
    owner: '',
    priority: 'medium',
    health: 'on_track',
    category: '',
    riskLevel: 'medium',
    actualSpend: '',
    ...(initialValues || {})
  }))
  const [errors, setErrors] = useState({})

  function validate(v) {
    const e = {}
    e.name = required(v.name)
    e.dateOrder = dateOrder(v.startDate, v.endDate)
    if (v.budget && Number(v.budget) < 0) e.budget = 'Budget cannot be negative'
    if (v.actualSpend && Number(v.actualSpend) < 0) e.actualSpend = 'Actual spend cannot be negative'
    if (v.actualSpend && v.budget && Number(v.actualSpend) > Number(v.budget)) {
      e.actualSpend = 'Actual spend exceeds budget'
    }
    Object.keys(e).forEach(k => !e[k] && delete e[k])
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    const numericFields = ['budget', 'actualSpend']
    setValues(s => ({
      ...s,
      [name]: numericFields.includes(name) ? value.replace(/[^0-9.]/g, '') : value
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const eobj = validate(values)
    setErrors(eobj)
    if (Object.keys(eobj).length) return
    onSubmit?.({
      ...values,
      budget: values.budget === '' ? '' : Number(values.budget),
      actualSpend: values.actualSpend === '' ? '' : Number(values.actualSpend)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      <FormField label="Name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" className="input" value={values.name} onChange={handleChange} required />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <textarea id="description" name="description" className="textarea" rows="3" value={values.description} onChange={handleChange} />
      </FormField>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Owner" htmlFor="owner">
          <input id="owner" name="owner" className="input" value={values.owner} onChange={handleChange} placeholder="e.g. Alex Morgan" />
        </FormField>
        <FormField label="Category" htmlFor="category">
          <input id="category" name="category" className="input" value={values.category} onChange={handleChange} placeholder="Strategic Initiative" />
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
        <FormField label="Status" htmlFor="status">
          <select id="status" name="status" className="select" value={values.status} onChange={handleChange}>
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
        </FormField>
        <FormField label="Priority" htmlFor="priority">
          <select id="priority" name="priority" className="select" value={values.priority} onChange={handleChange}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Health" htmlFor="health">
          <select id="health" name="health" className="select" value={values.health} onChange={handleChange}>
            <option value="on_track">on_track</option>
            <option value="at_risk">at_risk</option>
            <option value="off_track">off_track</option>
          </select>
        </FormField>
        <FormField label="Risk Level" htmlFor="riskLevel">
          <select id="riskLevel" name="riskLevel" className="select" value={values.riskLevel} onChange={handleChange}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </FormField>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Budget (USD)" htmlFor="budget" error={errors.budget}>
          <input id="budget" name="budget" type="number" className="input" value={values.budget} onChange={handleChange} min="0" step="1" placeholder="0" />
        </FormField>
        <FormField label="Actual Spend (USD)" htmlFor="actualSpend" error={errors.actualSpend}>
          <input id="actualSpend" name="actualSpend" type="number" className="input" value={values.actualSpend} onChange={handleChange} min="0" step="1" placeholder="0" />
        </FormField>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn ghost" type="button" onClick={() => history.back()}>Cancel</button>
        <Button kind="primary" type="submit">Save</Button>
      </div>
    </form>
  )
}
