import { useState } from 'react'
import { clearToken } from '../lib/auth.js'
import { toast } from 'react-hot-toast'

export default function LogoutButton() {
	const [loading, setLoading] = useState(false)

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
			className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors bg-rose-600 hover:bg-rose-500 text-white text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
		>
			{loading ? (
				<span className="inline-flex items-center gap-1 sm:gap-2">
					<span className="inline-block w-3 h-3 rounded-full border-2 border-white/80 border-t-transparent animate-spin"></span>
					<span>جارٍ الخروج...</span>
				</span>
			) : (
				<span>تسجيل الخروج</span>
			)}
		</button>
	)
} 