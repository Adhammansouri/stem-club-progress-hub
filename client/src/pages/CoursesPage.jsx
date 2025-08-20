import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { authHeader } from '../lib/auth.js'
import AchievementsBar from '../components/AchievementsBar.jsx'
import { API_BASE } from '../lib/config.js'

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

	return (
		<div className="space-y-6">
			<form onSubmit={addCourse} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
				<input value={newCourse.title} onChange={e=> setNewCourse(s=>({...s, title: e.target.value}))} placeholder="اسم الكورس" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-2" required />
				<input type="number" min={1} max={12} value={newCourse.total_levels} onChange={e=> setNewCourse(s=>({...s, total_levels: Number(e.target.value)}))} placeholder="عدد الليفلات" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
				<input type="number" min={0} value={newCourse.lectures_done} onChange={e=> setNewCourse(s=>({...s, lectures_done: Number(e.target.value)}))} placeholder="المحاضرات المنجزة" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
				<button className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark">إضافة</button>
			</form>

			<AchievementsBar recent={recentAwards} />

			{loading ? (
				<div className="text-slate-400">...جارِ التحميل</div>
			) : (
				<div className="grid gap-3">
					{courses.map(c => (
						<div key={c.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
							<div className="min-w-0">
								<div className="font-semibold"><Link to={`/courses/${c.id}`} className="hover:text-brand">{c.title}</Link></div>
								<div className="text-xs sm:text-sm text-slate-400">المستويات: {c.total_levels ?? 6} — المحاضرات المنجزة: {c.lectures_done ?? 0} — ليفل: {c.level ?? 1} — التقدم: {c.progress ?? 0}%</div>
								<div className="w-full h-2 bg-slate-700 rounded mt-2">
									<div className="h-full bg-brand rounded" style={{width: `${c.progress ?? 0}%`}} />
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 shrink-0">
								<button onClick={()=> updateCourse(c.id, { lectures_done: (c.lectures_done ?? 0) + 1 })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">+ محاضرة</button>
								<button onClick={()=> updateCourse(c.id, { lectures_done: Math.max(0, (c.lectures_done ?? 0) - 1) })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">- محاضرة</button>
								<button onClick={()=> updateCourse(c.id, { total_levels: (c.total_levels ?? 6) + 1 })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">+ ليفل إجمالي</button>
								<button onClick={()=> updateCourse(c.id, { total_levels: Math.max(1, (c.total_levels ?? 6) - 1) })} className="px-2 sm:px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm">- ليفل إجمالي</button>
								<button onClick={()=> removeCourse(c.id)} className="px-2 sm:px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-sm">حذف</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
} 