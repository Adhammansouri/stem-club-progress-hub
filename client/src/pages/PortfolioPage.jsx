import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaFacebook, FaLinkedin } from 'react-icons/fa'
import Stat from '../components/Stat.jsx'
import RadialProgress from '../components/RadialProgress.jsx'
import { WeeklyProgressChart, CoursesDistribution } from '../components/Charts.jsx'
import Heatmap from '../components/Heatmap.jsx'
import { authHeader } from '../lib/auth.js'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/config.js'

export default function PortfolioPage() {
	const [student, setStudent] = useState(null)
	const [courses, setCourses] = useState([])
	const [projects, setProjects] = useState([])
	const [loading, setLoading] = useState(true)
	const [copied, setCopied] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		async function loadAll() {
			setLoading(true)
			try {
				const [s, c, p] = await Promise.all([
					fetch(`${API_BASE}/api/student`, { headers: { ...authHeader() } }),
					fetch(`${API_BASE}/api/courses`, { headers: { ...authHeader() } }),
					fetch(`${API_BASE}/api/projects`, { headers: { ...authHeader() } }),
				])
				if (s.status === 401 || c.status === 401 || p.status === 401) {
					navigate('/login')
					return
				}
				const sj = await s.json(); const cj = await c.json(); const pj = await p.json()
				setStudent(Object.keys(sj||{}).length ? sj : null)
				setCourses(Array.isArray(cj) ? cj : [])
				setProjects(Array.isArray(pj) ? pj : [])
			} finally {
				setLoading(false)
			}
		}
		loadAll()
	}, [])

	const totalLectures = courses.reduce((sum,c)=> sum + (c.total_levels||6)*4, 0)
	const doneLectures = courses.reduce((sum,c)=> sum + (c.lectures_done||0), 0)

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href)
			setCopied(true)
			setTimeout(()=> setCopied(false), 1500)
		} catch {}
	}

	return (
		<div className="space-y-10">
			<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative">
				<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
					<div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-brand/50 shadow-lg shadow-emerald-500/10">
						{student?.avatar ? (
							<img src={`${API_BASE}${student.avatar}`} alt="avatar" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full grid place-items-center bg-slate-700 text-slate-300">بدون صورة</div>
						)}
					</div>
					<div className="text-center md:text-right space-y-2">
						<h2 className="text-2xl font-extrabold tracking-tight">{student?.name || 'طالب مجهول'}</h2>
						<div className="text-slate-300">{student?.bio || 'ابدأ بتعريف نفسك، مهاراتك، وأهدافك.'}</div>
						<div className="flex items-center justify-center md:justify-start gap-3 text-slate-300">
							{student?.github && <a className="hover:text-white" href={student.github} target="_blank" rel="noreferrer">GitHub</a>}
							{student?.facebook && <a className="hover:text-white" href={student.facebook} target="_blank" rel="noreferrer">Facebook</a>}
							{student?.linkedin && <a className="hover:text-white" href={student.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
						</div>
					</div>
					<div className="md:ml-auto md:mr-0 mt-4 md:mt-0">
						<button onClick={copyLink} className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark">{copied ? 'تم النسخ' : 'مشاركة'}</button>
					</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
					<Stat label="الكورسات" value={courses.length} />
					<Stat label="المشاريع" value={projects.length} />
					<Stat label="المحاضرات" value={`${doneLectures}/${totalLectures}`} helper="منجَزة/الإجمالي" />
					<Stat label="أفضل تقدم" value={`${Math.max(0, ...courses.map(c=> c.progress||0))}%`} />
				</div>
				<div className="grid md:grid-cols-2 gap-6 mt-6">
					<div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
						<div className="mb-2 font-semibold">تقدّم أسبوعي</div>
						<WeeklyProgressChart />
					</div>
					<div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
						<div className="mb-2 font-semibold">توزيع التقدّم بين الكورسات</div>
						<CoursesDistribution courses={courses} />
					</div>
				</div>
				<div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mt-6">
					<div className="mb-2 font-semibold">تقويم الإنجاز (12 أسبوع)</div>
					<Heatmap />
				</div>
			</motion.section>

			<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-bold">الكورسات والتقدم</h3>
				</div>
				{loading ? (
					<div className="grid gap-3">
						{Array.from({length:4}).map((_,i)=> (
							<div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
								<div className="h-4 w-40 bg-slate-700 rounded mb-3"></div>
								<div className="w-full h-2 bg-slate-700 rounded">
									<div className="h-full bg-slate-600 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{courses.length === 0 ? (
							<div className="text-slate-400">لا توجد كورسات بعد.</div>
						) : courses.map(c => (
							<motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
								<svg width="0" height="0"><defs><clipPath id={`clip${c.id}`}><rect width="100%" height="100%" rx="16" /></clipPath></defs></svg>
								<div className="flex items-center gap-4">
									<div>
										<RadialProgress value={c.progress ?? 0} />
									</div>
									<div className="min-w-0">
										<div className="font-semibold">{c.title}</div>
										<div className="text-sm text-slate-400">ليفلات: {c.total_levels ?? 6} — محاضرات منجزة: {c.lectures_done ?? 0} — ليفل: {c.level ?? 1}</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</motion.section>

			<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-bold">المشاريع</h3>
				</div>
				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{Array.from({length:6}).map((_,i)=> (
							<div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
								<div className="w-full h-40 bg-slate-700" />
								<div className="p-4">
									<div className="h-4 w-32 bg-slate-700 rounded mb-2" />
									<div className="h-3 w-52 bg-slate-700 rounded" />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{projects.length === 0 ? (
							<div className="text-slate-400">لا توجد مشاريع بعد.</div>
						) : projects.map(p => (
							<motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
								{p.image && (
									<img src={`${API_BASE}${p.image}`} alt={p.title} className="w-full h-40 object-cover" />
								)}
								<div className="p-4">
									<div className="font-semibold text-lg">{p.title}</div>
									<div className="text-sm text-slate-400">ليفل: {p.level ?? '-'}</div>
									<div className="text-sm text-slate-400">الكورس: {p.course_id ? (courses.find(c=> c.id === p.course_id)?.title || `#${p.course_id}`) : '—'} {p.course_level ? `(ليفل ${p.course_level})` : ''}</div>
									<p className="text-sm text-slate-300 mt-2">{p.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</motion.section>
		</div>
	)
} 