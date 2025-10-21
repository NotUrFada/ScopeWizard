import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="brand">
        <img src={logo} alt="ScopeWizard logo" />
        <span>ScopeWizard</span>
      </div>
      <div className="navlinks">
        <NavLink to="/" end className={({isActive})=>`navlink ${isActive?'active':''}`}>Dashboard</NavLink>
        <NavLink to="/projects" className={({isActive})=>`navlink ${isActive?'active':''}`}>Projects</NavLink>
        <NavLink to="/reports" className={({isActive})=>`navlink ${isActive?'active':''}`}>Reports</NavLink>
        <NavLink to="/settings" className={({isActive})=>`navlink ${isActive?'active':''}`}>Settings</NavLink>
      </div>
    </nav>
  )
}
