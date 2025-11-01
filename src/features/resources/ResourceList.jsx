import ResourceCard from './ResourceCard.jsx'

export default function ResourceList({ resources, metricsById, onEdit, onDelete }) {
  if (!resources?.length) {
    return <div className="card">No resources yet. Click "Add Resource" to get started.</div>
  }

  return (
    <div className="grid cols-2 resource-grid">
      {resources.map(resource => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          metrics={metricsById[resource.id]}
          onEdit={() => onEdit(resource)}
          onDelete={() => onDelete(resource)}
        />
      ))}
    </div>
  )
}
