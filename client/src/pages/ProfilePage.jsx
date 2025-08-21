import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaGithub, FaFacebook, FaLinkedin, FaUpload } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { authHeader } from '../lib/auth.js'
import { API_BASE } from '../lib/config.js'

export default function ProfilePage() {
	const navigate = useNavigate()
	const [student, setStudent] = useState({
		name: '',
		age: '',
		bio: '',
		github: '',
		facebook: '',
		linkedin: '',
		avatar: '',
		group_code: ''
	})
	const [avatarFile, setAvatarFile] = useState(null)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		fetch(`${API_BASE}/api/student`, { headers: { ...authHeader() } }).then(r => {
			if (r.status === 401) return Promise.reject(new Error('يجب تسجيل الدخول'))
			return r.json()
		}).then(data => {
			if (data && Object.keys(data).length) setStudent(data)
		}).catch((e) => { if (e.message.includes('تسجيل')) toast.error(e.message) })
	}, [])

	async function onSubmit(e) {
		e.preventDefault()
		setSaving(true)
		try {
			const form = new FormData()
			for (const key of ['name','age','bio','github','facebook','linkedin','group_code']) {
				if (student[key] !== undefined && student[key] !== null) form.append(key, student[key])
			}
			if (avatarFile) form.append('avatar', avatarFile)
			const res = await fetch(`${API_BASE}/api/student`, { method: 'POST', headers: { ...authHeader() }, body: form })
			if (!res.ok) throw new Error('فشل الحفظ')
			const data = await res.json()
			setStudent(data)
			setAvatarFile(null)
			toast.success('تم حفظ بياناتك بنجاح')
			navigate('/portfolio')
		} catch (err) {
			toast.error(err.message || 'حدث خطأ غير متوقع')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
			<div className="md:col-span-1">
				<div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
					<div className="flex flex-col items-center gap-3">
						<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-emerald-500/50">
							{student.avatar ? (
								<img src={`${API_BASE}${student.avatar}`} alt="avatar" className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full grid place-items-center bg-slate-700 text-slate-300 text-xs sm:text-sm">بدون صورة</div>
							)}
						</div>
						<label className="inline-flex items-center gap-2 text-sm cursor-pointer">
							<input type="file" className="hidden" onChange={(e)=> setAvatarFile(e.target.files?.[0] || null)} accept="image/*" />
							<span className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 inline-flex items-center gap-2"><FaUpload /> تحديث الصورة</span>
						</label>
						{student.group_code && (
							<div className="mt-2 text-sm text-slate-300">كود المجموعة: <span className="font-semibold">{student.group_code}</span></div>
						)}
					</div>
				</div>
			</div>

			<div className="md:col-span-2">
				<form onSubmit={onSubmit} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
						<div>
							<label className="block mb-1 text-sm text-slate-300">الاسم</label>
							<input value={student.name || ''} onChange={e=> setStudent(s=>({...s, name: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
						</div>
						<div>
							<label className="block mb-1 text-sm text-slate-300">العمر</label>
							<input type="number" value={student.age || ''} onChange={e=> setStudent(s=>({...s, age: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
						</div>
						<div className="md:col-span-2">
							<label className="block mb-1 text-sm text-slate-300">نبذة عني</label>
							<textarea value={student.bio || ''} onChange={e=> setStudent(s=>({...s, bio: e.target.value}))} rows={4} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
						<div>
							<label className="block mb-1 text-sm text-slate-300">Github</label>
							<div className="relative">
								<input value={student.github || ''} onChange={e=> setStudent(s=>({...s, github: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 pl-3 pr-3 py-2" placeholder="رابط الجيت هاب" />
							</div>
						</div>
						<div>
							<label className="block mb-1 text-sm text-slate-300">Facebook</label>
							<div className="relative">
								<input value={student.facebook || ''} onChange={e=> setStudent(s=>({...s, facebook: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 pl-3 pr-3 py-2" placeholder="رابط فيسبوك" />
							</div>
						</div>
						<div>
							<label className="block mb-1 text-sm text-slate-300">LinkedIn</label>
							<div className="relative">
								<input value={student.linkedin || ''} onChange={e=> setStudent(s=>({...s, linkedin: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 pl-3 pr-3 py-2" placeholder="رابط لينكدإن" />
							</div>
						</div>
					</div>

					<div>
						<label className="block mb-1 text-sm text-slate-300">كود المجموعة</label>
						<input value={student.group_code || ''} onChange={e=> setStudent(s=>({...s, group_code: e.target.value}))} className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" placeholder="مثال: G3-WEB-Thu-6pm" />
						<p className="text-xs text-slate-400 mt-1">هذا الكود يحدد المواعيد والمدرب. احصل عليه من الإدارة.</p>
					</div>

					<div className="flex justify-end">
						<button disabled={saving} className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors">{saving ? '...جارِ الحفظ' : 'حفظ'}</button>
					</div>
				</form>
			</div>
		</div>
	)
} 