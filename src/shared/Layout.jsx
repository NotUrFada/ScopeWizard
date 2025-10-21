import NavBar from './NavBar.jsx'

export default function Layout({ children }) {
  return (
    <>
      <NavBar />
      <main className="container">{children}</main>
    </>
  )
}
