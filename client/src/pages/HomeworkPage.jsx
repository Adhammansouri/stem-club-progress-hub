import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/config.js'
import { authHeader } from '../lib/auth.js'
import { toast } from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function HomeworkPage() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const r = await fetch(`${API_BASE}/api/submissions`, { headers: { ...authHeader() } })
        if (!r.ok) throw new Error('يجب تسجيل الدخول')
        const data = await r.json()
        setSubs(Array.isArray(data) ? data : [])
      } catch { toast.error('تعذر جلب الواجبات') } finally { setLoading(false) }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subs
    return subs.filter(s => (s.course_title || '').toLowerCase().includes(q) || String(s.session_index).includes(q) || (s.note || '').toLowerCase().includes(q))
  }, [subs, query])

  const perCourse = useMemo(() => {
    const map = new Map()
    for (const s of subs) {
      const k = s.course_title || `#${s.course_id}`
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [subs])

  const recent = useMemo(() => subs.slice(0, 10), [subs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">لوحة الواجبات</h2>
        <input value={query} onChange={e=> setQuery(e.target.value)} className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="بحث عن كورس/سيشن/ملاحظة" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="text-sm text-slate-400">إجمالي الواجبات</div>
          <div className="text-3xl font-extrabold mt-1">{subs.length}</div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="mb-2 font-semibold">واجبات لكل كورس</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e5e7eb' }} />
                <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/60">
            <tr>
              <th className="px-4 py-2 text-right">التاريخ</th>
              <th className="px-4 py-2 text-right">الكورس</th>
              <th className="px-4 py-2 text-right">سيشن</th>
              <th className="px-4 py-2 text-right">الملاحظة</th>
              <th className="px-4 py-2 text-right">الملف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>...جارِ التحميل</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>لا توجد نتائج</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-slate-300">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">{s.course_title || `#${s.course_id}`}</td>
                <td className="px-4 py-2">{s.session_index}</td>
                <td className="px-4 py-2 text-slate-300">{s.note || '—'}</td>
                <td className="px-4 py-2"><a className="text-brand hover:underline" href={`${API_BASE}${s.file_path}`} target="_blank" rel="noreferrer">تنزيل</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <div className="font-semibold mb-2">أحدث 10 واجبات</div>
        <ul className="space-y-2 text-sm">
          {recent.map(s => (
            <li key={s.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
              <span>{s.course_title || `#${s.course_id}`} — سيشن {s.session_index}</span>
              <span className="text-slate-400">{new Date(s.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
