import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/config.js'
import { authHeader } from '../lib/auth.js'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstructorDashboard() {
  const [groups, setGroups] = useState([])
  const [newCode, setNewCode] = useState('')
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const [g, s] = await Promise.all([
        fetch(`${API_BASE}/api/instructor/groups`, { headers: { ...authHeader() } }).then(r=> r.json()),
        fetch(`${API_BASE}/api/instructor/submissions`, { headers: { ...authHeader() } }).then(r=> r.json()),
      ])
      setGroups(Array.isArray(g) ? g : [])
      setFeed(Array.isArray(s) ? s : [])
    } catch { toast.error('تعذر جلب البيانات') } finally { setLoading(false) }
  }
  useEffect(()=> { load() }, [])

  async function addGroup(e){
    e.preventDefault()
    if (!newCode.trim()) return
    try {
      const r = await fetch(`${API_BASE}/api/instructor/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ code: newCode.trim() }) })
      if (!r.ok) throw new Error()
      toast.success('تمت إضافة المجموعة')
      setNewCode('')
      load()
    } catch { toast.error('تعذر الإضافة') }
  }

  async function removeGroup(id){
    try {
      const r = await fetch(`${API_BASE}/api/instructor/groups/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
      if (!r.ok) throw new Error()
      toast.success('تم الحذف')
      setGroups(prev=> prev.filter(x=> x.id !== id))
    } catch { toast.error('تعذر الحذف') }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return feed
    return feed.filter(s => (s.course_title||'').toLowerCase().includes(q) || (s.group_code||'').toLowerCase().includes(q) || (s.note||'').toLowerCase().includes(q))
  }, [feed, query])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">لوحة المدرّس</h2>
        <input value={query} onChange={e=> setQuery(e.target.value)} className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="بحث في الواجبات..." />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="font-semibold mb-2">مجموعاتي</div>
          <form onSubmit={addGroup} className="flex items-center gap-2">
            <input value={newCode} onChange={e=> setNewCode(e.target.value)} className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="أدخل كود مجموعة" />
            <button className="px-3 py-2 rounded-md bg-brand hover:bg-brand-dark text-sm">إضافة</button>
          </form>
          <ul className="mt-3 space-y-2">
            {groups.map(g=> (
              <li key={g.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                <div>
                  <div className="font-semibold">{g.code}</div>
                  <div className="text-slate-400">طلاب: {g.student_count} • واجبات: {g.submission_count}</div>
                </div>
                <button onClick={()=> removeGroup(g.id)} className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500">حذف</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="font-semibold mb-2">الواجبات المُرسلة (مجموعاتي)</div>
          <div className="max-h-[420px] overflow-auto divide-y divide-slate-800">
            {loading ? (
              <div className="p-4 text-slate-400">...جارِ التحميل</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-slate-400">لا توجد واجبات بعد.</div>
            ) : filtered.map(s => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{s.course_title || `#${s.course_id}`} • مجموعة {s.group_code}</div>
                  <div className="text-xs text-slate-400">سيشن {s.session_index} — {new Date(s.created_at).toLocaleString()} — {s.note || 'بدون ملاحظة'}</div>
                </div>
                <button className="text-brand hover:underline" onClick={()=> setPreview(s)}>معاينة</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=> setPreview(null)}>
            <motion.div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e=> e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="font-semibold text-slate-200">{preview.course_title || `#${preview.course_id}`} — مجموعة {preview.group_code} — سيشن {preview.session_index}</div>
                <button onClick={()=> setPreview(null)} className="px-2 py-1 rounded-md bg-slate-800">إغلاق</button>
              </div>
              <div className="p-4">
                {/(png|jpg|jpeg|gif|webp)$/i.test(preview.file_path) ? (
                  <img src={`${API_BASE}${preview.file_path}`} alt="preview" className="w-full h-auto rounded" />
                ) : (
                  <a href={`${API_BASE}${preview.file_path}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">فتح الملف</a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
