import { useEffect, useMemo, useState } from 'react'
import { authHeader } from '../lib/auth.js'

const API_BASE = 'http://localhost:4000'

export default function Heatmap() {
	const [logs, setLogs] = useState([])
	useEffect(()=> { (async()=>{
		try {
			const res = await fetch(`${API_BASE}/api/progress`, { headers: { ...authHeader() } })
			if (!res.ok) { setLogs([]); return }
			const data = await res.json()
			setLogs(Array.isArray(data) ? data : [])
		} catch { setLogs([]) }
	})() }, [])

	const { weeks, max } = useMemo(() => {
		const today = new Date()
		const end = new Date(today)
		const days = []
		for (let i = 83; i >= 0; i--) {
			const d = new Date(end)
			d.setDate(end.getDate() - i)
			days.push(d.toISOString().slice(0,10))
		}
		const byDay = new Map()
		for (const l of (Array.isArray(logs) ? logs : [])) {
			byDay.set(l.date, (byDay.get(l.date)||0) + Number(l.delta||0))
		}
		const maxVal = Math.max(1, ...days.map(ds => Math.abs(byDay.get(ds) || 0)))
		const w = []
		for (let c = 0; c < 12; c++) {
			const col = []
			for (let r = 0; r < 7; r++) {
				const idx = c*7 + r
				const ds = days[idx]
				const val = Math.abs(byDay.get(ds) || 0)
				col.push({ date: ds, val })
			}
			w.push(col)
		}
		return { weeks: w, max: maxVal }
	}, [logs])

	function level(val) {
		if (val === 0) return 'bg-slate-800'
		const pct = val / max
		if (pct > 0.8) return 'bg-emerald-500'
		if (pct > 0.6) return 'bg-emerald-400'
		if (pct > 0.4) return 'bg-emerald-300'
		if (pct > 0.2) return 'bg-emerald-200'
		return 'bg-emerald-100'
	}

	return (
		<div className="space-y-3">
			<div className="flex gap-1 overflow-x-auto">
				{weeks.map((col, i) => (
					<div key={i} className="flex flex-col gap-1">
						{col.map((d, j) => (
							<div key={j} title={`${d.date} : ${d.val} محاضرات`} className={`w-3 h-3 md:w-4 md:h-4 rounded ${level(d.val)}`} />
						))}
					</div>
				))}
			</div>
			<div className="flex items-center gap-2 text-xs text-slate-400">
				<span>قليل</span>
				<div className="w-4 h-3 rounded bg-slate-800" />
				<div className="w-4 h-3 rounded bg-emerald-100" />
				<div className="w-4 h-3 rounded bg-emerald-300" />
				<div className="w-4 h-3 rounded bg-emerald-500" />
				<span>كثير</span>
			</div>
		</div>
	)
} 