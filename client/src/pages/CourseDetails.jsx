import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const API_BASE = 'http://localhost:4000'

export default function CourseDetails() {
	const { id } = useParams()
	const [course, setCourse] = useState(null)
	const [loading, setLoading] = useState(true)

	const totalLectures = useMemo(() => (course?.total_levels || 6) * 4, [course])
	const lectureStates = useMemo(() => {
		const done = course?.lectures_done || 0
		return Array.from({length: totalLectures}, (_,i)=> i < done)
	}, [course, totalLectures])

	async function load() {
		setLoading(true)
		try {
			const res = await fetch(`${API_BASE}/api/courses/${id}`)
			if (!res.ok) throw new Error('تعذر جلب الكورس')
			setCourse(await res.json())
		} catch (e) {
			toast.error(e.message)
		} finally { setLoading(false) }
	}
	useEffect(()=> { load() }, [id])

	async function setDoneCount(count) {
		const res = await fetch(`${API_BASE}/api/courses/${id}`, {
			method: 'PUT', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ lectures_done: count })
		})
		if (!res.ok) return toast.error('تعذر التحديث')
		const data = await res.json()
		setCourse(data)
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
									<tr key={idx}>
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
				</>
			)}
		</div>
	)
} 