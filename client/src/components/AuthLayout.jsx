import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Typewriter from './Typewriter.jsx'

export default function AuthLayout({ title, subtitle, children, cta }) {
	const cardRef = useRef(null)
	useEffect(() => {
		const el = cardRef.current
		if (!el) return
		function onMove(e) {
			const rect = el.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const rx = ((y / rect.height) - 0.5) * -6
			const ry = ((x / rect.width) - 0.5) * 6
			el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
		}
		function onLeave(){ el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)' }
		el.addEventListener('mousemove', onMove)
		el.addEventListener('mouseleave', onLeave)
		return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
	}, [])

	return (
		<div className="min-h-[80vh] grid place-items-center relative overflow-hidden">
			<div className="pointer-events-none absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
			<div className="pointer-events-none absolute -bottom-10 -right-10 w-80 h-80 bg-sky-500/20 blur-3xl rounded-full animate-pulse" />

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl">
				<div className="text-center mb-6 select-none">
					<Typewriter className="text-sm text-brand" messages={["تعلم • كوِّن • شارك", "ابنِ معرض أعمالك", "ارتقِ خطوة كل يوم"]} />
				</div>
				<div ref={cardRef} className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 shadow-2xl will-change-transform">
					<div className="flex flex-col items-center mb-6 text-center select-none">
						<img src="/stem-club.png" className="h-16 mb-3" alt="STEM Club" draggable={false} />
						<h2 className="text-3xl font-extrabold">{title}</h2>
						{subtitle ? <p className="text-slate-300 mt-1">{subtitle}</p> : null}
					</div>
					{children}
					{cta ? <div className="mt-4 text-center">{cta}</div> : null}
				</div>
			</motion.div>
		</div>
	)
} 