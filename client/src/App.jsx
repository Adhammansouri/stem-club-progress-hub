import { NavLink, Route, Routes, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  // lock scroll when drawer open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [menuOpen])

  function closeMenu(){ setMenuOpen(false) }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <MouseGlow />
      <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800">
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
          <button className="sm:hidden px-3 py-1.5 rounded-md bg-slate-800/70 border border-slate-700 text-sm" onClick={()=> setMenuOpen(v=> !v)} aria-label="فتح القائمة">
            القائمة
          </button>
        </div>
      </header>

      {/* Side drawer rendered at root (outside header) to avoid clipping */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMenu} />
            <motion.div className="fixed inset-y-0 right-0 z-50 w-10/12 max-w-xs bg-slate-900 border-l border-slate-800 shadow-xl flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="font-bold">القائمة</div>
                <button onClick={closeMenu} className="px-2 py-1 rounded-md bg-slate-800">إغلاق</button>
              </div>
              <div className="p-2 flex-1 overflow-y-auto">
                {logged ? (
                  <div className="flex flex-col gap-1">
                    <NavLink to="/portfolio" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>عرض عام</NavLink>
                    <NavLink to="/" end onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الملف الشخصي</NavLink>
                    <NavLink to="/courses" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الكورسات</NavLink>
                    <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>المشاريع</NavLink>
                    <div className="px-3 py-2"><LogoutButton /></div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <NavLink to="/login" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>دخول</NavLink>
                    <NavLink to="/register" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>إنشاء حساب</NavLink>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
