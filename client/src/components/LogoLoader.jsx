import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function LogoLoader({ show = false }) {
	const primary = import.meta.env.BASE_URL + 'stem-club-load.png'
	const fallback = import.meta.env.BASE_URL + 'stem-club.png'
	const [src, setSrc] = useState(primary)
	return (
		<AnimatePresence>
			{show && (
				<motion.div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<div className="relative">
						{/* Glow ring */}
						<motion.div className="absolute -inset-10 rounded-full blur-2xl" style={{ background: 'conic-gradient(from 0deg, #10b981, #60a5fa, #f59e0b, #ef4444, #10b981)' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} />
						{/* Logo only */}
						<motion.img src={src} alt="STEM Club" className="relative w-20 h-auto select-none drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]" draggable={false}
							onError={() => setSrc(fallback)}
							initial={{ y: 0 }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} />
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
