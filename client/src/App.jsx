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
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    function onChange(){ setLogged(isLoggedIn()) }
    document.addEventListener('auth:change', onChange)
    return () => document.removeEventListener('auth:change', onChange)
  }, [])

  function closeMenu(){ setMenuOpen(false) }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <MouseGlow />
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Link to={logged ? "/portfolio" : "/login"} className="flex items-center gap-2" onClick={closeMenu}>
            <img src={import.meta.env.BASE_URL + 'stem-club.png'} alt="STEM Club" className="h-6 sm:h-8 w-auto" />
            <h1 className="text-lg sm:text-xl font-bold">منصة STEM Club</h1>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2 sm:gap-4">
            {logged ? (
              <>
                <NavLink to="/portfolio" onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>عرض عام</NavLink>
                <NavLink to="/" end onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>الملف الشخصي</NavLink>
                <NavLink to="/courses" onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>الكورسات</NavLink>
                <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>المشاريع</NavLink>
                <LogoutButton />
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>دخول</NavLink>
                <NavLink to="/register" onClick={closeMenu} className={({isActive}) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-slate-800 text-sm sm:text-base ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200'}`}>إنشاء حساب</NavLink>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button className="sm:hidden px-3 py-1.5 rounded-md bg-slate-800/70 border border-slate-700 text-sm" onClick={()=> setMenuOpen(v=> !v)}>
            القائمة
          </button>
        </div>
        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-800 bg-slate-900/95">
            <div className="max-w-5xl mx-auto px-3 py-2 flex flex-col gap-2">
              {logged ? (
                <>
                  <NavLink to="/portfolio" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>عرض عام</NavLink>
                  <NavLink to="/" end onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الملف الشخصي</NavLink>
                  <NavLink to="/courses" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الكورسات</NavLink>
                  <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>المشاريع</NavLink>
                  <div className="px-3 py-2"><LogoutButton /></div>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>دخول</NavLink>
                  <NavLink to="/register" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>إنشاء حساب</NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
        <Routes>
          <Route path="/" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/courses" element={<RequireAuth><CoursesPage /></RequireAuth>} />
          <Route path="/courses/:id" element={<RequireAuth><CourseDetails /></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
          <Route path="/portfolio" element={<RequireAuth><PortfolioPage /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
      </div>
  )
}

export default App
