export default function Stat({ label, value, helper, className='' }) {
	return (
		<div className={`rounded-xl border border-slate-700 bg-slate-800/50 p-4 ${className}`}>
			<div className="text-sm text-slate-400">{label}</div>
			<div className="text-2xl font-extrabold mt-1">{value}</div>
			{helper ? <div className="text-xs text-slate-400 mt-1">{helper}</div> : null}
		</div>
	)
} 