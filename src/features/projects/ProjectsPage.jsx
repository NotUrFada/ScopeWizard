import { useState } from 'react'
import Button from '../../shared/Button.jsx'
import Modal from '../../shared/Modal.jsx'
import ProjectForm from './ProjectForm.jsx'
import ProjectList from './ProjectList.jsx'
import { createProject } from './projectStore.js'
import { usePortfolioData } from './usePortfolioData.js'

export default function ProjectsPage() {
  const portfolio = usePortfolioData()
  const [open, setOpen] = useState(false)

  function handleCreate(values) {
    createProject(values)
    setOpen(false)
  }

  return (
    <div className="grid" style={{gap:20}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Projects</h2>
        <Button kind="primary" onClick={() => setOpen(true)}>New Project</Button>
      </div>
      <ProjectList projects={portfolio.projects} />
      <Modal open={open} title="Create Project" onClose={()=>setOpen(false)}>
        <ProjectForm onSubmit={handleCreate} />
      </Modal>
    </div>
  )
}
