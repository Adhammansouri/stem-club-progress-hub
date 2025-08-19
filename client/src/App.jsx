import { NavLink, Route, Routes, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProfilePage from './pages/ProfilePage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import MouseGlow from './components/MouseGlow.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import LogoutButton from './components/LogoutButton.jsx'
import { isLoggedIn } from './lib/auth.js'
import RequireAuth from './components/RequireAuth.jsx'

function App() {
  const [logged, setLogged] = useState(isLoggedIn())
  useEffect(() => {
    function onChange(){ setLogged(isLoggedIn()) }
    document.addEventListener('auth:change', onChange)
    return () => document.removeEventListener('auth:change', onChange)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <MouseGlow />
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={logged ? "/portfolio" : "/login"} className="flex items-center gap-2">
            <img src="/stem-club.png" alt="STEM Club" className="h-8 w-auto" />
            <h1 className="text-xl font-bold">منصة STEM Club</h1>
          </Link>
          <nav className="flex items-center gap-4">
            {logged ? (
              <>
                <NavLink to="/portfolio" className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>عرض عام</NavLink>
                <NavLink to="/" end className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>الملف الشخصي</NavLink>
                <NavLink to="/courses" className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>الكورسات</NavLink>
                <NavLink to="/projects" className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>المشاريع</NavLink>
                <LogoutButton />
              </>
            ) : (
              <>
                <NavLink to="/login" className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>دخول</NavLink>
                <NavLink to="/register" className={({isActive}) => `px-3 py-1.5 rounded-md hover:bg-slate-800 ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>إنشاء حساب</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/courses" element={<RequireAuth><CoursesPage /></RequireAuth>} />
          <Route path="/courses/:id" element={<RequireAuth><CourseDetails /></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
          <Route path="/portfolio" element={<RequireAuth><PortfolioPage /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
