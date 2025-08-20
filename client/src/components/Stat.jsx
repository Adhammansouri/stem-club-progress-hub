export default function Stat({ label, value, helper }) {
	return (
		<div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 sm:p-3 text-center">
			<div className="text-lg sm:text-xl font-bold text-brand">{value}</div>
			<div className="text-xs sm:text-sm text-slate-300">{label}</div>
			{helper && <div className="text-xs text-slate-400 mt-1">{helper}</div>}
		</div>
	)
} 