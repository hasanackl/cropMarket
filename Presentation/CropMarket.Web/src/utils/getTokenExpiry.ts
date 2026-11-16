// A JWT is three parts joined by dots: header.payload.signature
export function getTokenExpiry(token: string): number {
  const payload = token.split('.')[1]

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const data = JSON.parse(atob(base64))

  return data.exp * 1000
}