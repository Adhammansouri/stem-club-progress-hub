const githubPagesOrigin = typeof window !== 'undefined' && /\.github\.io$/.test(window.location.hostname);
export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (githubPagesOrigin ? 'https://stem-club-progress-hub-production.up.railway.app' : 'http://localhost:4000');