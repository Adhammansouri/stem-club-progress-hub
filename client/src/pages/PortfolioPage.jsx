import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaFacebook, FaLinkedin, FaDownload, FaShareAlt } from 'react-icons/fa'
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
			// fallback to current URL; could be extended later to a public share token
			await navigator.clipboard.writeText(window.location.href)
			setCopied(true)
			setTimeout(()=> setCopied(false), 1500)
		} catch {}
	}

	async function exportPdf() {
		try {
			const { default: html2canvas } = await import('html2canvas')
			const { jsPDF } = await import('jspdf')
			const target = document.getElementById('portfolio-root') || document.body
			const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#0b1220' })
			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF('p', 'mm', 'a4')
			const pageWidth = pdf.internal.pageSize.getWidth()
			const pageHeight = pdf.internal.pageSize.getHeight()
			// fit image into page while preserving aspect ratio
			const imgWidth = pageWidth
			const imgHeight = (canvas.height * imgWidth) / canvas.width
			let y = 0
			pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight, undefined, 'FAST')
			let remaining = imgHeight
			while (remaining > pageHeight) {
				pdf.addPage()
				y = -(pageHeight * (Math.ceil(remaining / pageHeight) - 1))
				pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight, undefined, 'FAST')
				remaining -= pageHeight
			}
			pdf.save('portfolio.pdf')
		} catch (e) {}
	}

	return (
		<div id="portfolio-root" className="space-y-8 sm:space-y-10">
			{/* Hero */}
			<section className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800/70 via-slate-800/40 to-slate-900/80 p-6 sm:p-8">
				<div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full" />
				<div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/20 blur-3xl rounded-full" />
				<div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
					<div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-brand/50 shadow-lg shadow-emerald-500/10">
						{student?.avatar ? (
							<img src={`${API_BASE}${student.avatar}`} alt="avatar" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full grid place-items-center bg-slate-700 text-slate-300">بدون صورة</div>
						)}
					</div>
					<div className="text-center sm:text-right space-y-2 flex-1 min-w-0">
						<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student?.name || 'طالب مجهول'}</h2>
						<p className="text-slate-300 text-sm sm:text-base">{student?.bio || 'ابدأ بتعريف نفسك، مهاراتك، وأهدافك.'}</p>
						<div className="flex items-center justify-center sm:justify-start gap-3 text-slate-300">
							{student?.github && <a className="hover:text-white" href={student.github} target="_blank" rel="noreferrer"><FaGithub /></a>}
							{student?.facebook && <a className="hover:text-white" href={student.facebook} target="_blank" rel="noreferrer"><FaFacebook /></a>}
							{student?.linkedin && <a className="hover:text-white" href={student.linkedin} target="_blank" rel="noreferrer"><FaLinkedin /></a>}
						</div>
					</div>
					<div className="sm:ml-auto flex gap-3">
						<button onClick={copyLink} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand hover:bg-brand-dark"><FaShareAlt /> {copied ? 'تم النسخ' : 'مشاركة'}</button>
						<button onClick={exportPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600"><FaDownload /> تحميل PDF</button>
					</div>
				</div>
				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
					<Stat label="الكورسات" value={courses.length} />
					<Stat label="المشاريع" value={projects.length} />
					<Stat label="المحاضرات" value={`${doneLectures}/${totalLectures}`} helper="منجَزة/الإجمالي" />
					<Stat label="أفضل تقدم" value={`${Math.max(0, ...courses.map(c=> c.progress||0))}%`} />
				</div>
			</section>

			{/* Charts */}
			<section className="grid lg:grid-cols-2 gap-6">
				<div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
					<div className="mb-2 font-semibold">تقدّم أسبوعي</div>
					<WeeklyProgressChart />
				</div>
				<div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
					<div className="mb-2 font-semibold">توزيع التقدّم بين الكورسات</div>
					<CoursesDistribution courses={courses} />
				</div>
			</section>

			<section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
				<div className="mb-2 font-semibold">تقويم الإنجاز (12 أسبوع)</div>
				<Heatmap />
			</section>

			{/* Courses list simple showcase */}
			<section className="space-y-4">
				<h3 className="text-xl font-bold">الكورسات والتقدم</h3>
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
			</section>

			{/* Projects showcase */}
			<section className="space-y-4">
				<h3 className="text-xl font-bold">المشاريع</h3>
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
									<p className="text-sm text-slate-300 line-clamp-3">{p.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</section>

			{/* Floating PDF button */}
			<button onClick={exportPdf} className="fixed z-50 bottom-4 right-4 px-4 py-2 rounded-full shadow-lg bg-slate-700 hover:bg-slate-600 inline-flex items-center gap-2">
				<FaDownload /> تحميل PDF
			</button>
		</div>
	)
} 