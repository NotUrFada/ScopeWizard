import { Routes, Route, Outlet } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import Layout from './shared/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import { fetchHolidays } from './lib/holidays.js'
import Loader from './shared/Loader.jsx'
import Alert from './shared/Alert.jsx'

export default function App() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const envCountry = import.meta.env.VITE_HOLIDAY_COUNTRY || 'US'
  const envYear = Number(import.meta.env.VITE_DEFAULT_YEAR) || new Date().getFullYear()
  const [country, setCountry] = useState(envCountry)
  const [year, setYear] = useState(envYear)

  const reload = useCallback(async (ctl) => {
  setError('')
  setLoading(true)
  try {
    const data = await fetchHolidays({ country, year, signal: ctl.signal })
    setHolidays(data)
  } catch (e) {
    // ⬇️ Ignore expected aborts triggered by effect cleanup / StrictMode
    if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) {
      return
    }
    setError(e.message || 'Failed to load holidays')
  } finally {
    setLoading(false)
  }
}, [country, year])


  useEffect(() => {
    const ctl = new AbortController()
    reload(ctl)
    return () => ctl.abort()
  }, [reload])

  const outletCtx = useMemo(() => ({
    holidays, country, year, setCountry, setYear, reload
  }), [holidays, country, year, reload])

  return (
    <Layout>
      {loading && <Loader label="Loading holidays…" />}
      {!!error && <Alert kind="error" message={error} />}
      <Routes>
        <Route element={<Outlet context={outletCtx} />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Layout>
  )
}
