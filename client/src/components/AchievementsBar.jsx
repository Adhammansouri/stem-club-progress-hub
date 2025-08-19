import { useEffect, useState } from 'react'
import { authHeader } from '../lib/auth.js'

const API_BASE = 'http://localhost:4000'

export default function AchievementsBar({ recent = [] }) {
	const [items, setItems] = useState([])
	useEffect(()=> { (async()=>{
		try { const r = await fetch(`${API_BASE}/api/achievements`, { headers: { ...authHeader() } }); if (r.ok) setItems(await r.json()) } catch {}
	})() }, [])
	const list = [...recent, ...items]
	if (list.length === 0) return null
	return (
		<div className="mt-6 bg-slate-900/40 border border-slate-800 rounded-xl p-3 overflow-x-auto">
			<div className="flex items-center gap-2 whitespace-nowrap">
				{list.map((a,i)=> (
					<span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-sm">
						<span>{a.icon || '🏅'}</span>
						<span>{a.title}</span>
					</span>
				))}
			</div>
		</div>
	)
} 