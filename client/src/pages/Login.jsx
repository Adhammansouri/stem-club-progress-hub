import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { setToken } from '../lib/auth.js'
import AuthLayout from '../components/AuthLayout.jsx'
import { playPop, confettiBurst } from '../lib/sfx.js'
import Typewriter from '../components/Typewriter.jsx'
import { API_BASE } from '../lib/config.js'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const from = location.state?.from?.pathname || '/portfolio'

	async function onSubmit(e) {
		e.preventDefault()
		setLoading(true)
		try {
			const payload = { email: email.trim().toLowerCase(), password }
			const res = await fetch(`${API_BASE}/api/auth/login`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!res.ok) throw new Error('بيانات الدخول غير صحيحة')
			const data = await res.json()
			setToken(data.token, data.user)
			playPop(); confettiBurst()
			toast.success('مرحبًا بعودتك!')
			navigate(from)
		} catch (e) {
			toast.error(e.message)
		} finally { setLoading(false) }
	}

	return (
		<AuthLayout title="مرحبًا بعودتك" subtitle={<Typewriter messages={["اشتقنالك! لنكمل الإنجاز.", "جاهز لمغامرة تعلم جديدة؟", "ابدأ من حيث توقفت ✨"]} />}>
			<form onSubmit={onSubmit} className="space-y-4">
				<input type="email" value={email} onChange={e=> setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3" required />
				<input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3" required />
				<button disabled={loading} className="w-full px-4 py-3 rounded-xl bg-brand hover:bg-brand-dark text-lg">{loading ? '...جارٍ الدخول' : 'دخول'}</button>
			</form>
			<div className="text-center text-sm text-slate-400 mt-4">جديد هنا؟ <Link to="/register" className="text-brand hover:underline">انضم الآن</Link></div>
		</AuthLayout>
	)
} 