import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authHeader } from '../lib/auth.js'
import AchievementsBar from '../components/AchievementsBar.jsx'
import { API_BASE } from '../lib/config.js'
import { FaCode, FaRobot, FaPython, FaMobileAlt, FaShieldAlt, FaPaintBrush, FaLaptopCode, FaBrain, FaNetworkWired } from 'react-icons/fa'
import { SiJavascript, SiFlutter, SiArduino } from 'react-icons/si'

const CATALOG = [
	{ title: 'Web Development Course', icon: FaCode, colors: 'from-emerald-400 to-sky-500' },
	{ title: 'Robotics', icon: FaRobot, colors: 'from-purple-400 to-rose-500' },
	{ title: 'Python Course', icon: FaPython, colors: 'from-yellow-400 to-emerald-500' },
	{ title: 'Mobile App Course', icon: FaMobileAlt, colors: 'from-sky-400 to-indigo-500' },
	{ title: 'JavaScript Course', icon: SiJavascript, colors: 'from-amber-400 to-orange-500' },
	{ title: 'ICT', icon: FaNetworkWired, colors: 'from-cyan-400 to-blue-500' },
	{ title: 'Graphic Design Course', icon: FaPaintBrush, colors: 'from-pink-400 to-rose-500' },
	{ title: 'flutter', icon: SiFlutter, colors: 'from-sky-400 to-cyan-500' },
	{ title: 'Cyber security', icon: FaShieldAlt, colors: 'from-rose-400 to-red-500' },
	{ title: 'Computer Science Course', icon: FaLaptopCode, colors: 'from-indigo-400 to-violet-500' },
	{ title: 'Cody Rocky Robot Course', icon: FaRobot, colors: 'from-fuchsia-400 to-pink-500' },
	{ title: 'Artificial Intelligence Course', icon: FaBrain, colors: 'from-emerald-400 to-lime-500' },
	{ title: 'Arduino Course', icon: SiArduino, colors: 'from-teal-400 to-emerald-500' },
]

export default function CoursesPage() {
	const [courses, setCourses] = useState([])
	const [newCourse, setNewCourse] = useState({ title: '', total_levels: 6, lectures_done: 0 })
	const [loading, setLoading] = useState(true)
	const [recentAwards, setRecentAwards] = useState([])

	async function load() {
		setLoading(true)
		try {
			const res = await fetch(`${API_BASE}/api/courses`, { headers: { ...authHeader() } })
			if (!res.ok) throw new Error('يجب تسجيل الدخول')
			setCourses(await res.json())
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => { load() }, [])

	async function addCourse(e) {
		e.preventDefault()
		const res = await fetch(`${API_BASE}/api/courses`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...authHeader() },
			body: JSON.stringify(newCourse)
		})
		if (!res.ok) return toast.error('تعذر إضافة الكورس')
		toast.success('تمت إضافة الكورس')
		setNewCourse({ title: '', total_levels: 6, lectures_done: 0 })
		load()
	}

	async function enroll(title) {
		try {
			const res = await fetch(`${API_BASE}/api/courses`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...authHeader() },
				body: JSON.stringify({ title, total_levels: 5, lectures_done: 0 })
			})
			if (!res.ok) return toast.error('تعذر الانضمام للكورس')
			toast.success(`انضممت إلى ${title}!`)
			load()
		} catch { toast.error('حدث خطأ') }
	}

	async function updateCourse(id, patch) {
		const res = await fetch(`${API_BASE}/api/courses/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', ...authHeader() },
			body: JSON.stringify(patch)
		})
		if (!res.ok) return toast.error('تعذر التحديث')
		const data = await res.json()
		if (Array.isArray(data.awarded) && data.awarded.length) {
			setRecentAwards(data.awarded)
			toast.success('إنجاز جديد!')
		}
		load()
	}

	async function removeCourse(id) {
		const res = await fetch(`${API_BASE}/api/courses/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
		if (!res.ok) return toast.error('تعذر الحذف')
		toast.success('تم الحذف')
		load()
	}

	const enrolledTitles = new Set(courses.map(c => c.title))
	const totalSessions = (c) => (c.total_levels ?? 5) * 4
	const doneSessions = (c) => (c.lectures_done ?? 0)

	return (
		<div className="space-y-6">
			{/* Catalog */}
			<section className="space-y-3">
				<h2 className="text-xl sm:text-2xl font-extrabold">متجر الكورسات</h2>
				<p className="text-sm text-slate-400">كل كورس يحتوي على 5 ليفلات، وكل ليفل 4 سيشن (20 سيشن إجمالًا). اختر ما تحب وانضم الآن.</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{CATALOG.map((item, idx) => {
						const Icon = item.icon
						const isEnrolled = enrolledTitles.has(item.title)
						return (
							<motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx*0.03 }}
								className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800/80">
								<div className={`absolute -inset-0.5 bg-gradient-to-r ${item.colors} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
								<div className="relative p-4 flex items-center gap-4">
									<div className={`w-12 h-12 rounded-xl grid place-items-center text-2xl text-white bg-gradient-to-br ${item.colors} shadow-lg shadow-emerald-500/10`}> <Icon /> </div>
									<div className="min-w-0 flex-1">
										<div className="font-semibold">{item.title}</div>
										<div className="text-xs text-slate-400">5 ليفلات • 20 سيشن</div>
									</div>
									<button disabled={isEnrolled} onClick={()=> enroll(item.title)} className={`px-3 py-1.5 rounded-md text-sm ${isEnrolled ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'} transition-colors`}>{isEnrolled ? 'مسجّل' : 'انضم'}</button>
								</div>
							</motion.div>
						)
					})}
				</div>
			</section>

			<AchievementsBar recent={recentAwards} />

			{/* My Courses */}
			<section className="space-y-3 sm:space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg sm:text-xl font-bold">كورساتي</h3>
				</div>
				{loading ? (
					<div className="text-slate-400">...جارِ التحميل</div>
				) : (
					<div className="grid gap-3">
						{courses.length === 0 ? (
							<div className="text-slate-400 text-sm">لم تنضم لأي كورس بعد. ابدأ من الأعلى ✨</div>
						) : courses.map(c => (
							<div key={c.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
								<div className="min-w-0">
									<div className="font-semibold"><Link to={`/courses/${c.id}`} className="hover:text-brand">{c.title}</Link></div>
									<div className="text-xs sm:text-sm text-slate-400">الليفلات: {c.total_levels ?? 5} — السيشن المنجزة: {doneSessions(c)} / {totalSessions(c)} — المستوى الحالي: {c.level ?? 1} — التقدم: {c.progress ?? 0}%</div>
									<div className="w-full h-2 bg-slate-700 rounded mt-2">
										<div className="h-full bg-brand rounded" style={{width: `${c.progress ?? 0}%`}} />
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2 shrink-0">
									<button onClick={()=> updateCourse(c.id, { lectures_done: (c.lectures_done ?? 0) + 1 })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">+ سيشن</button>
									<button onClick={()=> updateCourse(c.id, { lectures_done: Math.max(0, (c.lectures_done ?? 0) - 1) })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">- سيشن</button>
									<button onClick={()=> updateCourse(c.id, { total_levels: (c.total_levels ?? 5) + 1 })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">+ ليفل</button>
									<button onClick={()=> updateCourse(c.id, { total_levels: Math.max(1, (c.total_levels ?? 5) - 1) })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">- ليفل</button>
									<button onClick={()=> removeCourse(c.id)} className="px-2 sm:px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-sm">حذف</button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	)
} 