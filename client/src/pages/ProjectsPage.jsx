import { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { authHeader } from '../lib/auth.js'
import { API_BASE } from '../lib/config.js'
import { FaPlus, FaTrash, FaGripVertical, FaTag } from 'react-icons/fa'

export default function ProjectsPage() {
	const [projects, setProjects] = useState([])
	const [courses, setCourses] = useState([])
	const [form, setForm] = useState({ title: '', description: '', level: '', course_id: '', course_level: '', tags: '' })
	const [imageFile, setImageFile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)

	const imgPreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : '', [imageFile])

	async function load() {
		setLoading(true)
		try {
			const [p, c] = await Promise.all([
				fetch(`${API_BASE}/api/projects`, { headers: { ...authHeader() } }).then(r=>r.json()),
				fetch(`${API_BASE}/api/courses`, { headers: { ...authHeader() } }).then(r=>r.json())
			])
			setProjects(p)
			setCourses(c)
		} finally { setLoading(false) }
	}
	useEffect(() => { load() }, [])

	async function addProject(e) {
		e.preventDefault()
		const fd = new FormData()
		fd.append('title', form.title)
		fd.append('description', form.description)
		if (form.level) fd.append('level', String(form.level))
		if (form.course_id) fd.append('course_id', String(form.course_id))
		if (form.course_level) fd.append('course_level', String(form.course_level))
		if (form.tags) fd.append('tags', JSON.stringify(form.tags.split(',').map(s=> s.trim()).filter(Boolean)))
		if (imageFile) fd.append('image', imageFile)
		const res = await fetch(`${API_BASE}/api/projects`, { method: 'POST', headers: { ...authHeader() }, body: fd })
		if (!res.ok) return toast.error('تعذر إضافة المشروع')
		toast.success('تمت إضافة المشروع')
		setForm({ title: '', description: '', level: '', course_id: '', course_level: '', tags: '' })
		setImageFile(null)
		setShowForm(false)
		load()
	}

	async function removeProject(id) {
		const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
		if (!res.ok) return toast.error('تعذر حذف المشروع')
		toast.success('تم حذف المشروع')
		load()
	}

	async function reorderProjects(items) {
		setProjects(items)
		await fetch(`${API_BASE}/api/projects/reorder`, {
			method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() },
			body: JSON.stringify({ ids: items.map(p=> p.id) })
		})
	}

	function onDragEnd(result) {
		if (!result.destination) return
		const src = result.source.index
		const dst = result.destination.index
		const next = Array.from(projects)
		const [mv] = next.splice(src, 1)
		next.splice(dst, 0, mv)
		reorderProjects(next)
	}

	const courseTitle = (id) => courses.find(c=> c.id === Number(id))?.title || null

	return (
		<div className="space-y-6">
			{/* Header actions */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl sm:text-2xl font-extrabold">مشاريعي</h2>
				<button onClick={()=> setShowForm(v=> !v)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand hover:bg-brand-dark"><FaPlus /> مشروع جديد</button>
			</div>

			{/* Add project form */}
			<AnimatePresence initial={false}>
				{showForm && (
					<motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
						onSubmit={addProject} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/60 p-4 grid md:grid-cols-6 gap-3">
						<div className="md:col-span-2">
							<label className="block text-sm mb-1">عنوان المشروع</label>
							<input required value={form.title} onChange={e=> setForm(s=>({...s, title: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
						</div>
						<div className="md:col-span-4">
							<label className="block text-sm mb-1">وصف مختصر</label>
							<input value={form.description} onChange={e=> setForm(s=>({...s, description: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm mb-1">ليفل المشروع</label>
							<input value={form.level} onChange={e=> setForm(s=>({...s, level: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm mb-1">الكورس (اختياري)</label>
							<select value={form.course_id} onChange={e=> setForm(s=>({...s, course_id: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2">
								<option value="">—</option>
								{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm mb-1">ليفل داخل الكورس</label>
							<input value={form.course_level} onChange={e=> setForm(s=>({...s, course_level: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm mb-1">وسوم (افصل بـ ,)</label>
							<input value={form.tags} onChange={e=> setForm(s=>({...s, tags: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
							<div className="mt-2 flex flex-wrap gap-2 text-xs">
								{form.tags.split(',').map(s=> s.trim()).filter(Boolean).map((t,i)=> (
									<span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700"><FaTag />{t}</span>
								))}
							</div>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm mb-1">صورة المشروع</label>
							<div className="flex items-center gap-3">
								<label className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer">
									<input type="file" className="hidden" onChange={e=> setImageFile(e.target.files?.[0] || null)} accept="image/*" />اختر ملف
								</label>
								{imgPreview && <img src={imgPreview} alt="preview" className="h-14 rounded border border-slate-700" />}
							</div>
						</div>
						<div className="md:col-span-6 flex justify-end">
							<button className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark">حفظ المشروع</button>
						</div>
					</motion.form>
				)}
			</AnimatePresence>

			{/* Gallery */}
			{loading ? (
				<div className="text-slate-400">...جارِ التحميل</div>
			) : projects.length === 0 ? (
				<div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-center text-slate-300">لا توجد مشاريع بعد. ابدأ بإضافة مشروع من الزر بالأعلى ✨</div>
			) : (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="projects">
						{(provided)=> (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={provided.innerRef} {...provided.droppableProps}>
								{projects.map((p, index) => (
									<Draggable key={p.id} draggableId={String(p.id)} index={index}>
										{(prov)=> (
											<motion.div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
												initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
												className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60">
												{/* image */}
												{p.image && (
													<div className="h-40 relative">
														<img src={`${API_BASE}${p.image}`} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
														<div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
													</div>
												)}
												{/* content */}
												<div className="p-4">
													<div className="flex items-center justify-between gap-2">
														<h3 className="font-semibold text-lg truncate">{p.title}</h3>
														<div className="flex items-center gap-2 text-xs text-slate-300"><FaGripVertical className="opacity-60" /> سحب لإعادة الترتيب</div>
													</div>
													{p.level && <div className="mt-1 text-xs text-slate-400">المستوى: {p.level}</div>}
													{(p.course_id || p.course_level) && (
														<div className="mt-1 text-xs text-slate-400">الكورس: {courseTitle(p.course_id)} {p.course_level ? `(ليفل ${p.course_level})` : ''}</div>
													)}
													{p.tags && (
														<div className="mt-2 flex flex-wrap gap-2">{JSON.parse(p.tags).map((t,i)=> <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700">#{t}</span>)}</div>
													)}
													{p.description && <p className="mt-2 text-sm text-slate-300 line-clamp-3">{p.description}</p>}
													<div className="mt-3 flex justify-end">
														<button onClick={()=> removeProject(p.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-sm"><FaTrash /> حذف</button>
													</div>
												</div>
											</motion.div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			)}
		</div>
	)
} 