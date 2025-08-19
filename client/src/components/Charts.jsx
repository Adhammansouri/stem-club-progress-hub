import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LabelList } from 'recharts'
import { authHeader } from '../lib/auth.js'

const API_BASE = 'http://localhost:4000'
const COLORS = ['#10b981', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee']

function formatDateLabel(dStr) {
	try {
		const d = new Date(dStr)
		return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
	} catch { return dStr }
}

export function WeeklyProgressChart() {
	const [logs, setLogs] = useState([])
	useEffect(()=> {
		(async ()=>{
			try {
				const res = await fetch(`${API_BASE}/api/progress`, { headers: { ...authHeader() } })
				if (!res.ok) { setLogs([]); return }
				const data = await res.json()
				setLogs(Array.isArray(data) ? data : [])
			} catch { setLogs([]) }
		})()
	}, [])

	const data = useMemo(() => {
		const today = new Date()
		const days = []
		for (let i = 29; i >= 0; i--) {
			const d = new Date(today)
			d.setDate(today.getDate() - i)
			days.push(d.toISOString().slice(0,10))
		}
		const byDay = new Map()
		for (const l of (Array.isArray(logs) ? logs : [])) {
			byDay.set(l.date, (byDay.get(l.date)||0) + Number(l.delta||0))
		}
		let cum = 0
		return days.map(ds => { cum += byDay.get(ds) || 0; return { date: ds, value: cum } })
	}, [logs])

	const allZero = data.every(d => d.value === 0)

	return (
		<div className="h-56">
			{allZero ? (
				<div className="h-full grid place-items-center text-slate-400 text-sm">ابدأ بتسجيل المحاضرات لترى تقدّمك هنا</div>
			) : (
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
						<defs>
							<linearGradient id="gradProgress" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
								<stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<CartesianGrid stroke="#1f2a37" vertical={false} />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={formatDateLabel} />
						<YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
						<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} labelFormatter={formatDateLabel} formatter={(v)=>[v, 'محاضرات تراكميًا']} />
						<Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#gradProgress)" />
					</AreaChart>
				</ResponsiveContainer>
			)}
		</div>
	)
}

export function CoursesDistribution({ courses }) {
	const hasCourses = (courses||[]).length > 0
	const totalDone = (courses||[]).reduce((s,c)=> s + (c.lectures_done||0), 0)
	const data = (courses||[]).map((c, i) => ({ name: c.title, value: c.lectures_done || 0, color: COLORS[i % COLORS.length] }))
	return (
		<div className="h-56">
			{!hasCourses ? (
				<div className="h-full grid place-items-center text-slate-400 text-sm">أضف كورسات لعرض التوزيع</div>
			) : (
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} isAnimationActive>
							{data.map((entry, index) => <Cell key={`c-${index}`} fill={entry.color} />)}
							<LabelList position="inside" formatter={(v)=> totalDone? Math.round((v/totalDone)*100)+'%':'0%'} fill="#0f172a" fontSize={12} />
						</Pie>
						<Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: '#e2e8f0' }} />
						<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} formatter={(v,name)=>[v+' محاضرة', name]} />
					</PieChart>
				</ResponsiveContainer>
			)}
		</div>
	)
} 