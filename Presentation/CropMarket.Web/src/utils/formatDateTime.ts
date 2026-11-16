export function formatDateTime(date: string, language: string) {
  return new Date(date).toLocaleString(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
