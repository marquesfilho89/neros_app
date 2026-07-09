export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatTime(time: string): string {
  return time.substring(0, 5);
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('neros_user');
  return stored ? JSON.parse(stored) : null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('neros_token');
}

export function logout() {
  localStorage.removeItem('neros_token');
  localStorage.removeItem('neros_user');
  window.location.href = '/login';
}
