export function setToken(token, user) {
	localStorage.setItem('token', token)
	if (user) localStorage.setItem('user', JSON.stringify(user))
	document.dispatchEvent(new CustomEvent('auth:change', { detail: { type: 'login', user } }))
}

export function getToken() {
	return localStorage.getItem('token') || ''
}

export function getUser() {
	try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export function clearToken() {
	localStorage.removeItem('token')
	localStorage.removeItem('user')
	document.dispatchEvent(new CustomEvent('auth:change', { detail: { type: 'logout' } }))
}

export function authHeader() {
	const t = getToken()
	return t ? { Authorization: `Bearer ${t}` } : {}
}

export function isLoggedIn() {
	return !!getToken()
} 