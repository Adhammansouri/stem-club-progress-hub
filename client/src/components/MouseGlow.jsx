import { useEffect, useRef } from 'react'

export default function MouseGlow() {
	const ref = useRef(null)
	useEffect(() => {
		function onMove(e) {
			if (!ref.current) return
			const x = e.clientX
			const y = e.clientY
			ref.current.style.setProperty('--mx', x + 'px')
			ref.current.style.setProperty('--my', y + 'px')
		}
		window.addEventListener('mousemove', onMove)
		return () => window.removeEventListener('mousemove', onMove)
	}, [])
	return (
		<div ref={ref} className="pointer-events-none fixed inset-0 z-0" style={{
			background: 'radial-gradient(400px 200px at var(--mx) var(--my), rgba(16,185,129,0.08), transparent 60%)'
		}} />
	)
} 