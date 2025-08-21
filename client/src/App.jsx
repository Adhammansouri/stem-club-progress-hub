import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react'
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
import LogoLoader from './components/LogoLoader.jsx'
import { isLoggedIn } from './lib/auth.js'
import RequireAuth from './components/RequireAuth.jsx'
import HomeworkPage from './pages/HomeworkPage.jsx'
import InstructorDashboard from './pages/InstructorDashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import { RequireInstructor } from './components/RequireAuth.jsx'

function App() {
  const [logged, setLogged] = useState(isLoggedIn())
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    function onChange(){
      setLogged(isLoggedIn())
      try { setUser(JSON.parse(localStorage.getItem('user') || 'null')) } catch { setUser(null) }
    }
    document.addEventListener('auth:change', onChange)
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { document.removeEventListener('auth:change', onChange); window.removeEventListener('scroll', onScroll) }
  }, [])

  // Measure header height and keep spacer in sync
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => setHeaderHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // show loader briefly on route changes
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(()=> setLoading(false), 500)
    return () => clearTimeout(t)
  }, [location.pathname])

  // lock scroll when drawer open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [menuOpen])

  function closeMenu(){ setMenuOpen(false) }

  const linkBase = (isActive) => `px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-sm sm:text-base transition-colors ${isActive ? 'bg-slate-800 text-brand' : 'text-slate-200 hover:text-white hover:bg-slate-800/70'}`

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <MouseGlow />
      <LogoLoader show={loading} />
      {/* Top progress bar */}
      <AnimatePresence>
        {loading && (
          <motion.div className="fixed top-0 inset-x-0 z-40 h-0.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.5 }} style={{ transformOrigin: '0% 50%' }} />
        )}
      </AnimatePresence>
      <header ref={headerRef} className={`fixed top-0 inset-x-0 z-30 border-b border-slate-800 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-slate-900/60 backdrop-blur'}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Link to={logged ? "/portfolio" : "/login"} className="flex items-center gap-2" onClick={closeMenu}>
            <img src={import.meta.env.BASE_URL + 'stem-club.png'} alt="STEM Club" className="h-6 sm:h-8 w-auto" />
            <h1 className="text-lg sm:text-xl font-bold">منصة STEM Club</h1>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2 sm:gap-3">
            {logged ? (
              <>
                {user?.role === 'instructor' ? (
                  <NavLink to="/instructor" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>المدرّس</NavLink>
                ) : (
                  <>
                    <NavLink to="/portfolio" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>عرض عام</NavLink>
                    <NavLink to="/" end onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>الملف الشخصي</NavLink>
                    <NavLink to="/courses" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>الكورسات</NavLink>
                    <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>المشاريع</NavLink>
                    <NavLink to="/homework" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>الواجبات</NavLink>
                  </>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>دخول</NavLink>
                <NavLink to="/register" onClick={closeMenu} className={({isActive}) => linkBase(isActive)}>إنشاء حساب</NavLink>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button className="sm:hidden px-3 py-1.5 rounded-md bg-slate-800/70 border border-slate-700 text-sm hover:bg-slate-800" onClick={()=> setMenuOpen(v=> !v)} aria-label="فتح القائمة">القائمة</button>
        </div>
      </header>

      {/* Spacer equal to header height to avoid overlap */}
      <div style={{ height: headerHeight }} />

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
                    {user?.role === 'instructor' ? (
                      <NavLink to="/instructor" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>المدرّس</NavLink>
                    ) : (
                      <>
                        <NavLink to="/portfolio" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>عرض عام</NavLink>
                        <NavLink to="/" end onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الملف الشخصي</NavLink>
                        <NavLink to="/courses" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الكورسات</NavLink>
                        <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>المشاريع</NavLink>
                        <NavLink to="/homework" onClick={closeMenu} className={({isActive}) => `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800 text-brand' : 'hover:bg-slate-800 text-slate-200'}`}>الواجبات</NavLink>
                      </>
                    )}
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
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}>
            <Routes>
              <Route path="/" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/courses" element={<RequireAuth><CoursesPage /></RequireAuth>} />
              <Route path="/courses/:id" element={<RequireAuth><CourseDetails /></RequireAuth>} />
              <Route path="/projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
              <Route path="/homework" element={<RequireAuth><HomeworkPage /></RequireAuth>} />
              <Route path="/instructor" element={<RequireAuth><RequireInstructor><InstructorDashboard /></RequireInstructor></RequireAuth>} />
              <Route path="/portfolio" element={<RequireAuth><PortfolioPage /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
