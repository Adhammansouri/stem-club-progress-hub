import { useState } from 'react'
import { clearToken, getUser } from '../lib/auth.js'
import { toast } from 'react-hot-toast'

export default function LogoutButton() {
	const [loading, setLoading] = useState(false)
	const user = getUser()

	function doLogout() {
		if (loading) return
		setLoading(true)
		toast.success('تم تسجيل الخروج')
		clearToken()
		setTimeout(()=> { location.hash = '#/login' }, 600)
	}

	return (
		<button
			onClick={doLogout}
			disabled={loading}
			className={`px-3 py-1.5 rounded-md transition-all bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
		>
			{loading ? (
				<span className="inline-flex items-center gap-2">
					<span className="inline-block w-3 h-3 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"></span>
					<span>جارٍ الخروج...</span>
				</span>
			) : (
				<span>تسجيل الخروج{user?.email ? ` (${user.email})` : ''}</span>
			)}
		</button>
	)
} 