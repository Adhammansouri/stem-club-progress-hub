export default function RadialProgress({ value=0, size=80, stroke=8, className='' }) {
	const radius = (size - stroke) / 2
	const circumference = 2 * Math.PI * radius
	const offset = circumference - (value / 100) * circumference
	return (
		<svg width={size} height={size} className={className}>
			<circle cx={size/2} cy={size/2} r={radius} stroke="#1f2937" strokeWidth={stroke} fill="none" />
			<circle cx={size/2} cy={size/2} r={radius} stroke="#10b981" strokeLinecap="round" strokeWidth={stroke} fill="none" style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset .6s ease' }} />
			<text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-slate-200 text-sm font-bold">{Math.round(value)}%</text>
		</svg>
	)
} 