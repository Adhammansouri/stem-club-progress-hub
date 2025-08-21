import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/config.js'
import { authHeader } from '../lib/auth.js'
import { toast } from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

function Donut({ value = 0 }) {
	const r = 28
	const c = 2 * Math.PI * r
	const pct = Math.max(0, Math.min(100, value))
	const dash = (pct / 100) * c
	return (
		<svg width="72" height="72" viewBox="0 0 72 72">
			<circle cx="36" cy="36" r={r} stroke="#1f2937" strokeWidth="8" fill="none" />
			<circle cx="36" cy="36" r={r} stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
			<text x="36" y="40" textAnchor="middle" fontSize="14" fill="#e5e7eb" fontWeight="700">{pct}%</text>
		</svg>
	)
}

export default function HomeworkPage() {
	const [subs, setSubs] = useState([])
	const [courses, setCourses] = useState([])
	const [loading, setLoading] = useState(true)
	const [query, setQuery] = useState('')
	const [tab, setTab] = useState('overview')
	const [activeCourse, setActiveCourse] = useState('all')
	const [preview, setPreview] = useState(null)

	useEffect(() => {
		(async () => {
			setLoading(true)
			try {
				const [r1, r2] = await Promise.all([
					fetch(`${API_BASE}/api/submissions`, { headers: { ...authHeader() } }),
					fetch(`${API_BASE}/api/courses`, { headers: { ...authHeader() } }),
				])
				if (!r1.ok || !r2.ok) throw new Error('يجب تسجيل الدخول')
				const [d1, d2] = await Promise.all([r1.json(), r2.json()])
				setSubs(Array.isArray(d1) ? d1 : [])
				setCourses(Array.isArray(d2) ? d2 : [])
			} catch {
				toast.error('تعذر جلب الواجبات')
			} finally { setLoading(false) }
		})()
	}, [])

	const expectedByCourse = useMemo(() => {
		const map = new Map()
		for (const c of courses) map.set(c.id, (c.total_levels || 5) * 4)
		return map
	}, [courses])

	const filteredByCourse = useMemo(() => {
		if (activeCourse === 'all') return subs
		return subs.filter(s => String(s.course_id) === String(activeCourse))
	}, [subs, activeCourse])

	const filteredQuery = useMemo(() => {
		const q = query.trim().toLowerCase()
		const arr = filteredByCourse
		if (!q) return arr
		return arr.filter(s => (s.course_title || '').toLowerCase().includes(q) || String(s.session_index).includes(q) || (s.note || '').toLowerCase().includes(q))
	}, [filteredByCourse, query])

	const perCourse = useMemo(() => {
		const map = new Map()
		for (const s of subs) {
			const k = s.course_title || `#${s.course_id}`
			map.set(k, (map.get(k) || 0) + 1)
		}
		return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
	}, [subs])

	const courseProgressCards = useMemo(() => {
		return courses.map(c => {
			const total = expectedByCourse.get(c.id) || 20
			const done = subs.filter(s => s.course_id === c.id).length
			const pct = Math.round((done / total) * 100)
			return { id: c.id, title: c.title, total, done, pct }
		})
	}, [courses, subs, expectedByCourse])

	const groupedTimeline = useMemo(() => {
		const byDate = new Map()
		for (const s of subs) {
			const d = new Date(s.created_at)
			const key = d.toLocaleDateString()
			if (!byDate.has(key)) byDate.set(key, [])
			byDate.get(key).push(s)
		}
		return Array.from(byDate.entries())
			.sort((a,b)=> new Date(b[0]) - new Date(a[0]))
	}, [subs])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<h2 className="text-2xl font-extrabold">لوحة الواجبات</h2>
				<div className="flex items-center gap-2">
					<select value={activeCourse} onChange={e=> setActiveCourse(e.target.value)} className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm">
						<option value="all">كل الكورسات</option>
						{courses.map(c=> <option key={c.id} value={c.id}>{c.title}</option>)}
					</select>
					<input value={query} onChange={e=> setQuery(e.target.value)} className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="بحث..." />
				</div>
			</div>

			<div className="flex items-center gap-2 border-b border-slate-800">
				{['overview','timeline','table'].map(t=> (
					<button key={t} onClick={()=> setTab(t)} className={`px-3 py-2 text-sm ${tab===t ? 'text-brand border-b-2 border-brand' : 'text-slate-300'}`}>{t==='overview'?'نظرة عامة': t==='timeline'?'الخط الزمني':'جدول'}</button>
				))}
			</div>

			{tab === 'overview' && (
				<div className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
							<div className="text-sm text-slate-400">إجمالي الواجبات</div>
							<div className="text-3xl font-extrabold mt-1">{filteredQuery.length}</div>
						</div>
						<div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
							<div className="mb-2 font-semibold">واجبات لكل كورس</div>
							<div className="h-48">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={perCourse}>
										<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
										<XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
										<YAxis tick={{ fill: '#9ca3af' }} />
										<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e5e7eb' }} />
										<Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{courseProgressCards.map(card => (
							<motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4 flex items-center gap-4">
								<Donut value={card.pct} />
								<div className="min-w-0">
									<div className="font-semibold truncate" title={card.title}>{card.title}</div>
									<div className="text-xs text-slate-400">{card.done} / {card.total} واجب</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			)}

			{tab === 'timeline' && (
				<div className="space-y-4">
					{groupedTimeline.length === 0 ? (
						<div className="text-slate-400">لا توجد واجبات بعد.</div>
					) : groupedTimeline.map(([date, items]) => (
						<div key={date} className="rounded-xl border border-slate-700 bg-slate-900/40">
							<div className="px-4 py-2 border-b border-slate-800 text-slate-300 text-sm">{date}</div>
							<ul className="p-3 space-y-2">
								{items.map(s => (
									<li key={s.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
										<div className="text-sm">{s.course_title || `#${s.course_id}`} — سيشن {s.session_index}</div>
										<button className="text-brand hover:underline" onClick={()=> setPreview(s)}>معاينة</button>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}

			{tab === 'table' && (
				<div className="rounded-xl border border-slate-700 overflow-hidden">
					<table className="min-w-full divide-y divide-slate-700">
						<thead className="bg-slate-800/60">
							<tr>
								<th className="px-4 py-2 text-right">التاريخ</th>
								<th className="px-4 py-2 text-right">الكورس</th>
								<th className="px-4 py-2 text-right">سيشن</th>
								<th className="px-4 py-2 text-right">الملاحظة</th>
								<th className="px-4 py-2 text-right">الملف</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-800 bg-slate-900/50">
							{loading ? (
								<tr><td className="px-4 py-6 text-slate-400" colSpan={5}>...جارِ التحميل</td></tr>
							) : filteredQuery.length === 0 ? (
								<tr><td className="px-4 py-6 text-slate-400" colSpan={5}>لا توجد نتائج</td></tr>
							) : filteredQuery.map(s => (
								<tr key={s.id}>
									<td className="px-4 py-2 text-slate-300">{new Date(s.created_at).toLocaleString()}</td>
									<td className="px-4 py-2">{s.course_title || `#${s.course_id}`}</td>
									<td className="px-4 py-2">{s.session_index}</td>
									<td className="px-4 py-2 text-slate-300">{s.note || '—'}</td>
									<td className="px-4 py-2"><button className="text-brand hover:underline" onClick={()=> setPreview(s)}>معاينة</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Preview modal */}
			<AnimatePresence>
				{preview && (
					<motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=> setPreview(null)}>
						<motion.div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e=> e.stopPropagation()}>
							<div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
								<div className="font-semibold text-slate-200">{preview.course_title || `#${preview.course_id}`} — سيشن {preview.session_index}</div>
								<button onClick={()=> setPreview(null)} className="px-2 py-1 rounded-md bg-slate-800">إغلاق</button>
							</div>
							<div className="p-4">
								{/(png|jpg|jpeg|gif|webp)$/i.test(preview.file_path) ? (
									<img src={`${API_BASE}${preview.file_path}`} alt="preview" className="w-full h-auto rounded" />
								) : (
									<a href={`${API_BASE}${preview.file_path}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">فتح الملف</a>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
