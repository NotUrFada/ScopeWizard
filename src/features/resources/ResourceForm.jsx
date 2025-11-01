import { useState } from 'react'
import Button from '../../shared/Button.jsx'
import FormField from '../../shared/FormField.jsx'
import { required } from '../../lib/validators.js'

export default function ResourceForm({ onSubmit, initialValues }) {
  const [values, setValues] = useState(() => ({
    name: '',
    role: '',
    email: '',
    hoursPerWeek: 40,
    costRate: 0,
    location: '',
    ...(initialValues || {})
  }))
  const [errors, setErrors] = useState({})

  function validate(v) {
    const e = {}
    e.name = required(v.name)
    if (Number(v.hoursPerWeek) <= 0) e.hoursPerWeek = 'Capacity must be greater than 0'
    if (Number(v.costRate) < 0) e.costRate = 'Rate cannot be negative'
    Object.keys(e).forEach(key => !e[key] && delete e[key])
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    const numericFields = ['hoursPerWeek', 'costRate']
    setValues(s => ({
      ...s,
      [name]: numericFields.includes(name) ? value.replace(/[^0-9.]/g, '') : value
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const issues = validate(values)
    setErrors(issues)
    if (Object.keys(issues).length) return
    onSubmit?.({
      ...values,
      hoursPerWeek: Number(values.hoursPerWeek) || 0,
      costRate: Number(values.costRate) || 0
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      <FormField label="Name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" className="input" value={values.name} onChange={handleChange} required />
      </FormField>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Role" htmlFor="role">
          <input id="role" name="role" className="input" value={values.role} onChange={handleChange} placeholder="e.g. Engineering Lead" />
        </FormField>
        <FormField label="Location" htmlFor="location">
          <input id="location" name="location" className="input" value={values.location} onChange={handleChange} placeholder="City / Remote" />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email">
        <input id="email" name="email" type="email" className="input" value={values.email} onChange={handleChange} placeholder="name@company.com" />
      </FormField>

      <div className="row" style={{ gap: 12 }}>
        <FormField label="Capacity (hours/week)" htmlFor="hoursPerWeek" error={errors.hoursPerWeek}>
          <input id="hoursPerWeek" name="hoursPerWeek" type="number" className="input" value={values.hoursPerWeek} onChange={handleChange} min="1" />
        </FormField>
        <FormField label="Bill rate ($/hr)" htmlFor="costRate" error={errors.costRate}>
          <input id="costRate" name="costRate" type="number" className="input" value={values.costRate} onChange={handleChange} min="0" step="1" />
        </FormField>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn ghost" type="button" onClick={() => history.back()}>Cancel</button>
        <Button kind="primary" type="submit">Save Resource</Button>
      </div>
    </form>
  )
}
