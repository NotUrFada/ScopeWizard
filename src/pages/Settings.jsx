import { useOutletContext } from 'react-router-dom'
import { useState } from 'react'
import Button from '../shared/Button.jsx'
import FormField from '../shared/FormField.jsx'

export default function Settings() {
  const { country, year, setCountry, setYear, reload } = useOutletContext()
  const [values, setValues] = useState({ country, year })
  function handleChange(e) {
    const { name, value } = e.target
    setValues(s => ({ ...s, [name]: name==='year'? Number(value) : value }))
  }
  async function save() {
    setCountry(values.country)
    setYear(values.year)
    await reload(new AbortController())
  }
  return (
    <div className="grid" style={{gap:16, maxWidth:520}}>
      <h2>Settings</h2>
      <FormField label="Holiday Country (ISO)" htmlFor="country">
        <input id="country" name="country" className="input" value={values.country} onChange={handleChange} />
      </FormField>
      <FormField label="Holiday Year" htmlFor="year">
        <input id="year" name="year" type="number" className="input" value={values.year} onChange={handleChange} />
      </FormField>
      <div className="row" style={{gap:8}}>
        <Button kind="primary" onClick={save}>Save & Reload Holidays</Button>
      </div>
      <div className="sub">Env defaults via <code>.env.local</code> (see <code>.env.local.example</code>).</div>
    </div>
  )
}
