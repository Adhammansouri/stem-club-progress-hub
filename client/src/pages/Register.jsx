import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { setToken } from '../lib/auth.js'
import AuthLayout from '../components/AuthLayout.jsx'
import { playCoin, confettiBurst } from '../lib/sfx.js'
import Typewriter from '../components/Typewriter.jsx'

const API_BASE = 'http://localhost:4000'

export default function Register() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	async function onSubmit(e) {
		e.preventDefault()
		setLoading(true)
		try {
			const res = await fetch(`${API_BASE}/api/auth/register`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email: email.trim().toLowerCase(), password })
			})
			if (!res.ok) throw new Error('تعذر إنشاء الحساب')
			const data = await res.json()
			setToken(data.token, data.user)
			playCoin(); confettiBurst()
			toast.success('مرحبًا بك في عائلة STEM!')
			navigate('/portfolio')
		} catch (e) {
			toast.error(e.message)
		} finally { setLoading(false) }
	}

	return (
		<AuthLayout title="أهلًا وسهلًا!" subtitle={<Typewriter messages={["انضم لعائلة STEM ✨", "كوِّن صداقات وتعلم بمتعة", "ابدأ بناء بورتفوليو مبهر"]} />} cta={<div className="text-sm text-slate-400">لديك حساب؟ <Link to="/login" className="text-brand hover:underline">تسجيل الدخول</Link></div>}>
			<form onSubmit={onSubmit} className="space-y-4">
				<input value={name} onChange={e=> setName(e.target.value)} placeholder="الاسم" className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3" required />
				<input type="email" value={email} onChange={e=> setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3" required />
				<input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3" required />
				<button disabled={loading} className="w-full px-4 py-3 rounded-xl bg-brand hover:bg-brand-dark text-lg">{loading ? '...جارٍ الإنشاء' : 'ابدأ الآن'}</button>
			</form>
		</AuthLayout>
	)
} 