import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { authHeader } from '../lib/auth.js'

const API_BASE = 'http://localhost:4000'

export default function ProjectsPage() {
	const [projects, setProjects] = useState([])
	const [courses, setCourses] = useState([])
	const [form, setForm] = useState({ title: '', description: '', level: '', course_id: '', course_level: '', tags: '' })
	const [imageFile, setImageFile] = useState(null)
	const [loading, setLoading] = useState(true)

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

	return (
		<div className="space-y-6">
			<form onSubmit={addProject} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid md:grid-cols-6 gap-3">
				<input required value={form.title} onChange={e=> setForm(s=>({...s, title: e.target.value}))} placeholder="عنوان المشروع" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-2" />
				<input value={form.level} onChange={e=> setForm(s=>({...s, level: e.target.value}))} placeholder="ليفل المشروع" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-1" />
				<select value={form.course_id} onChange={e=> setForm(s=>({...s, course_id: e.target.value}))} className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-2">
					<option value="">اختر الكورس</option>
					{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
				</select>
				<input value={form.course_level} onChange={e=> setForm(s=>({...s, course_level: e.target.value}))} placeholder="ليفل داخل الكورس" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-1" />
				<input value={form.description} onChange={e=> setForm(s=>({...s, description: e.target.value}))} placeholder="وصف مختصر" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-3" />
				<input value={form.tags} onChange={e=> setForm(s=>({...s, tags: e.target.value}))} placeholder="وسوم (افصل بينها بفواصل , )" className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 md:col-span-2" />
				<label className="md:col-span-1 inline-flex items-center gap-2 text-sm cursor-pointer">
					<input type="file" className="hidden" onChange={e=> setImageFile(e.target.files?.[0] || null)} accept="image/*" />
					<span className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 block text-center">صورة</span>
				</label>
				<button className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark md:col-span-1">إضافة</button>
			</form>

			{loading ? (
				<div className="text-slate-400">...جارِ التحميل</div>
			) : (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="projects">
						{(provided)=> (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" ref={provided.innerRef} {...provided.droppableProps}>
								{projects.map((p, index) => (
									<Draggable key={p.id} draggableId={String(p.id)} index={index}>
										{(prov)=> (
											<div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
												{p.image && (
													<img src={`${API_BASE}${p.image}`} alt={p.title} className="w-full h-40 object-cover" />
												)}
												<div className="p-4 flex-1 flex flex-col">
													<div className="font-semibold text-lg">{p.title}</div>
													<div className="text-sm text-slate-400">ليفل المشروع: {p.level ?? '-'}</div>
													<div className="text-sm text-slate-400">الكورس: {p.course_id ? (courses.find(c=> c.id === p.course_id)?.title || `#${p.course_id}`) : '—'} {p.course_level ? `(ليفل ${p.course_level})` : ''}</div>
													{p.tags && (
														<div className="mt-2 flex flex-wrap gap-2">{JSON.parse(p.tags).map((t,i)=> <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700">#{t}</span>)}</div>
													)}
													<p className="text-sm text-slate-300 mt-2 line-clamp-3">{p.description}</p>
													<div className="mt-auto flex justify-end">
														<button onClick={()=> removeProject(p.id)} className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500">حذف</button>
													</div>
												</div>
											</div>
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