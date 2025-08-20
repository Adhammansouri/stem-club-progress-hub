import { motion, AnimatePresence } from 'framer-motion'

export default function LogoLoader({ show = false }) {
	const logoSrc = import.meta.env.BASE_URL + 'stem-club.png'
	return (
		<AnimatePresence>
			{show && (
				<motion.div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<div className="relative">
						{/* Glow ring */}
						<motion.div className="absolute -inset-10 rounded-full blur-2xl" style={{ background: 'conic-gradient(from 0deg, #10b981, #60a5fa, #f59e0b, #ef4444, #10b981)' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }} />
						{/* Logo circle */}
						<motion.div className="relative w-28 h-28 rounded-full grid place-items-center bg-slate-900 border-4 border-slate-700 shadow-xl"
							initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
							<motion.img src={logoSrc} alt="STEM Club" className="w-16 h-auto select-none" draggable={false}
								initial={{ y: 0 }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} />
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
