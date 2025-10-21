import ProjectCard from './ProjectCard.jsx'

export default function ProjectList({ projects }) {
  if (!projects?.length) return <div className="card">No projects yet. Click “New Project”.</div>
  return (
    <div className="grid cols-3">
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  )
}
