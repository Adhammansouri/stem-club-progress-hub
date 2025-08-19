export default function Card({ className = '', children }) {
	return (
		<div className={`bg-slate-800/60 border border-slate-700 rounded-2xl ${className}`}>
			{children}
		</div>
	)
} 