import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { API_BASE } from '../lib/config.js'
import { authHeader } from '../lib/auth.js'

export default function CourseDetails() {
	const { id } = useParams()
	const [course, setCourse] = useState(null)
	const [loading, setLoading] = useState(true)
	const [subs, setSubs] = useState([])
	const [uploading, setUploading] = useState(false)
	const [selectedSession, setSelectedSession] = useState(1)
	const [note, setNote] = useState('')
	const [file, setFile] = useState(null)

	const totalLectures = useMemo(() => (course?.total_levels || 6) * 4, [course])
	const lectureStates = useMemo(() => {
		const done = course?.lectures_done || 0
		return Array.from({length: totalLectures}, (_,i)=> i < done)
	}, [course, totalLectures])

	async function load() {
		setLoading(true)
		try {
			const [c, s] = await Promise.all([
				fetch(`${API_BASE}/api/courses/${id}`, { headers: { ...authHeader() } }).then(r=> r.json()),
				fetch(`${API_BASE}/api/courses/${id}/submissions`, { headers: { ...authHeader() } }).then(r=> r.json())
			])
			setCourse(c)
			setSubs(Array.isArray(s) ? s : [])
		} catch (e) {
			toast.error('تعذر جلب البيانات')
		} finally { setLoading(false) }
	}
	useEffect(()=> { load() }, [id])

	async function setDoneCount(count) {
		const res = await fetch(`${API_BASE}/api/courses/${id}`, {
			method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() },
			body: JSON.stringify({ lectures_done: count })
		})
		if (!res.ok) return toast.error('تعذر التحديث')
		const data = await res.json()
		setCourse(data)
	}

	async function uploadSubmission(e) {
		e.preventDefault()
		if (!file) return toast.error('اختر ملفًا أولًا')
		setUploading(true)
		try {
			const fd = new FormData()
			fd.append('file', file)
			fd.append('session_index', String(selectedSession))
			if (note) fd.append('note', note)
			const r = await fetch(`${API_BASE}/api/courses/${id}/submissions`, { method: 'POST', headers: { ...authHeader() }, body: fd })
			if (!r.ok) throw new Error()
			toast.success('تم رفع الواجب ✅')
			setFile(null); setNote('')
			load()
		} catch { toast.error('تعذر الرفع') } finally { setUploading(false) }
	}

	async function removeSubmission(sid) {
		try {
			const r = await fetch(`${API_BASE}/api/courses/${id}/submissions/${sid}`, { method: 'DELETE', headers: { ...authHeader() } })
			if (!r.ok) throw new Error()
			toast.success('تم حذف الواجب')
			setSubs(prev=> prev.filter(x=> x.id !== sid))
		} catch { toast.error('تعذر الحذف') }
	}

	return (
		<div className="space-y-6">
			{loading || !course ? (
				<div className="text-slate-400">...جارِ التحميل</div>
			) : (
				<>
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-extrabold">{course.title}</h2>
						<div className="text-slate-400">ليفلات: {course.total_levels} — محاضرات منجزة: {course.lectures_done} — ليفل: {course.level} — التقدم: {course.progress}%</div>
					</div>

					{/* Sessions progress */}
					<div className="overflow-x-auto rounded-xl border border-slate-700">
						<table className="min-w-full divide-y divide-slate-700">
							<thead className="bg-slate-800/60">
								<tr>
									<th className="px-4 py-2 text-right">#</th>
									<th className="px-4 py-2 text-right">الحالة</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800 bg-slate-900/50">
								{lectureStates.map((done, idx)=> (
									<tr key={idx} className="hover:bg-slate-800/40">
										<td className="px-4 py-2">محاضرة {idx+1}</td>
										<td className="px-4 py-2">
											<label className="inline-flex items-center gap-2">
												<input type="checkbox" checked={done} onChange={(e)=> {
													const newDone = e.target.checked ? Math.max(course.lectures_done, idx+1) : Math.min(course.lectures_done, idx)
													setDoneCount(newDone)
												}} />
												<span>{done ? 'منجز' : 'غير منجز'}</span>
											</label>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Homework submissions */}
					<section className="space-y-3">
						<h3 className="text-lg font-bold">الواجبات</h3>
						<form onSubmit={uploadSubmission} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 grid sm:grid-cols-6 gap-3">
							<div>
								<label className="block text-sm mb-1">سيشن</label>
								<select value={selectedSession} onChange={e=> setSelectedSession(Number(e.target.value))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2">
									{Array.from({length: totalLectures}, (_,i)=> <option key={i} value={i+1}>محاضرة {i+1}</option>)}
								</select>
							</div>
							<div className="sm:col-span-3">
								<label className="block text-sm mb-1">ملاحظة (اختياري)</label>
								<input value={note} onChange={e=> setNote(e.target.value)} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" placeholder="وصف قصير للواجب" />
							</div>
							<div className="sm:col-span-2">
								<label className="block text-sm mb-1">ملف الواجب</label>
								<input type="file" onChange={e=> setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
							</div>
							<div className="sm:col-span-6 flex justify-end">
								<button disabled={uploading} className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark disabled:opacity-50">{uploading ? '...جارِ الرفع' : 'رفع الواجب'}</button>
							</div>
						</form>

						<div className="rounded-xl border border-slate-700 overflow-hidden">
							<table className="min-w-full divide-y divide-slate-700">
								<thead className="bg-slate-800/60">
									<tr>
										<th className="px-4 py-2 text-right">التاريخ</th>
										<th className="px-4 py-2 text-right">سيشن</th>
										<th className="px-4 py-2 text-right">الملاحظة</th>
										<th className="px-4 py-2 text-right">الملف</th>
										<th className="px-4 py-2"></th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-800 bg-slate-900/50">
									{subs.map(s=> (
										<tr key={s.id}>
											<td className="px-4 py-2 text-slate-300">{new Date(s.created_at).toLocaleString()}</td>
											<td className="px-4 py-2">{s.session_index}</td>
											<td className="px-4 py-2 text-slate-300">{s.note || '—'}</td>
											<td className="px-4 py-2"><a className="text-brand hover:underline" href={`${API_BASE}${s.file_path}`} target="_blank" rel="noreferrer">تنزيل</a></td>
											<td className="px-4 py-2 text-right"><button onClick={()=> removeSubmission(s.id)} className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-sm">حذف</button></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
				</>
			)}
		</div>
	)
} 