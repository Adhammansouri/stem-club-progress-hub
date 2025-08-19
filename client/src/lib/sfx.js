export function playCoin() {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)()
		const o = ctx.createOscillator()
		const g = ctx.createGain()
		o.type = 'triangle'
		o.frequency.setValueAtTime(880, ctx.currentTime)
		g.gain.setValueAtTime(0.0001, ctx.currentTime)
		g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
		g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
		o.connect(g)
		g.connect(ctx.destination)
		o.start()
		o.stop(ctx.currentTime + 0.21)
		setTimeout(()=> ctx.close(), 300)
	} catch {}
}

export function playPop() {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)()
		const o = ctx.createOscillator()
		const g = ctx.createGain()
		o.type = 'sine'
		o.frequency.setValueAtTime(440, ctx.currentTime)
		o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15)
		g.gain.setValueAtTime(0.0001, ctx.currentTime)
		g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
		g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
		o.connect(g)
		g.connect(ctx.destination)
		o.start()
		o.stop(ctx.currentTime + 0.2)
		setTimeout(()=> ctx.close(), 300)
	} catch {}
}

export async function confettiBurst() {
	try {
		const mod = await import('canvas-confetti')
		const confetti = mod.default
		confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
		setTimeout(()=> confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.4 } }), 150)
		setTimeout(()=> confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.4 } }), 200)
	} catch {}
} 