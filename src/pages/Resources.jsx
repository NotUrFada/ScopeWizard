import { useMemo, useState } from 'react'
import { usePortfolioData } from '../features/projects/usePortfolioData.js'
import { createResource, updateResource, deleteResource } from '../features/projects/projectStore.js'
import { getResourceUtilization } from '../features/projects/projectMetrics.js'
import ResourceList from '../features/resources/ResourceList.jsx'
import ResourceForm from '../features/resources/ResourceForm.jsx'
import Button from '../shared/Button.jsx'
import Modal from '../shared/Modal.jsx'
import Alert from '../shared/Alert.jsx'

export default function Resources() {
  const portfolio = usePortfolioData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const utilization = useMemo(() => (
    getResourceUtilization(portfolio.resources, portfolio.allocations, portfolio.tasks)
  ), [portfolio.resources, portfolio.allocations, portfolio.tasks])

  const metricsById = useMemo(() => (
    utilization.reduce((acc, entry) => {
      acc[entry.resource.id] = entry
      return acc
    }, {})
  ), [utilization])

  const orderedResources = useMemo(() => utilization.map(entry => entry.resource), [utilization])
  const overloaded = utilization.filter(entry => entry.overCapacity)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(resource) {
    setEditing(resource)
    setModalOpen(true)
  }

  function handleDelete(resource) {
    if (typeof window !== 'undefined') {
      const shouldDelete = window.confirm(`Remove ${resource.name}? Assignments will be cleared.`)
      if (!shouldDelete) return
    }
    deleteResource(resource.id)
  }

  function handleSubmit(values) {
    try {
      if (editing) {
        updateResource(editing.id, values)
      } else {
        createResource(values)
      }
      setModalOpen(false)
      setEditing(null)
      setError('')
    } catch (err) {
      setError(err?.message || 'Unable to save resource')
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Resources</h2>
        <Button kind="primary" onClick={openCreate}>Add Resource</Button>
      </div>

      {error && <Alert kind="error" message={error} />}

      {overloaded.length > 0 && (
        <Alert
          kind="warn"
          message={`Capacity warning: ${overloaded.map(entry => entry.resource.name).join(', ')} currently over capacity.`}
        />
      )}

      <ResourceList
        resources={orderedResources}
        metricsById={metricsById}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.name}` : 'Add Resource'}
        onClose={() => setModalOpen(false)}
      >
        <ResourceForm onSubmit={handleSubmit} initialValues={editing} />
      </Modal>
    </div>
  )
}
