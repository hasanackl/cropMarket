export function formatDate(date: string, language: string) {
  return new Date(date).toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' })
}
