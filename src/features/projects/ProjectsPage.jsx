import { useEffect, useState } from 'react'
import Button from '../../shared/Button.jsx'
import Modal from '../../shared/Modal.jsx'
import ProjectForm from './ProjectForm.jsx'
import ProjectList from './ProjectList.jsx'
import { loadAll, createProject } from './projectStore.js'

export default function ProjectsPage() {
  const [state, setState] = useState(loadAll())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setState(loadAll())
  }, [])

  function handleCreate(values) {
    createProject(values)
    setState(loadAll())
    setOpen(false)
  }

  return (
    <div className="grid" style={{gap:20}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Projects</h2>
        <Button kind="primary" onClick={() => setOpen(true)}>New Project</Button>
      </div>
      <ProjectList projects={state.projects} />
      <Modal open={open} title="Create Project" onClose={()=>setOpen(false)}>
        <ProjectForm onSubmit={handleCreate} />
      </Modal>
    </div>
  )
}
