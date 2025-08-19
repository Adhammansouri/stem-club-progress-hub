import { useEffect, useState } from 'react'

export default function Typewriter({ messages = [], speed = 60, pause = 1200, className = '' }) {
	const [idx, setIdx] = useState(0)
	const [text, setText] = useState('')
	useEffect(() => {
		let mounted = true
		let i = 0
		let timer
		function type() {
			const msg = messages[idx % messages.length] || ''
			if (!mounted) return
			if (i <= msg.length) {
				setText(msg.slice(0, i))
				i++
				timer = setTimeout(type, speed)
			} else {
				timer = setTimeout(() => { i = 0; setIdx(v => v + 1); }, pause)
			}
		}
		type()
		return () => { mounted = false; clearTimeout(timer) }
	}, [idx, messages, speed, pause])
	return <span className={className}>{text}</span>
} 