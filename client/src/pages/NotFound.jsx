import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center space-y-3">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-extrabold">الصفحة غير موجودة</h1>
        <p className="text-slate-400">يبدو أنك وصلت إلى رابط غير صحيح.</p>
        <div className="flex items-center justify-center gap-2">
          <Link to="/portfolio" className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark">العودة للعرض العام</Link>
          <Link to="/" className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600">الملف الشخصي</Link>
        </div>
      </div>
    </div>
  )
}
