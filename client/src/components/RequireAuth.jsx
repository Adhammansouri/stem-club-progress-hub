import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../lib/auth.js'

export default function RequireAuth({ children }) {
	const location = useLocation()
	if (!isLoggedIn()) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}
	return children
}

export function RequireInstructor({ children }) {
	const location = useLocation()
	// role is stored in user object if needed later; for now rely on server-side endpoints
	if (!isLoggedIn()) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}
	return children
} 