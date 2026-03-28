import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'trackifyr_session'

/**
 * Session token from httpOnly cookie (web) or Authorization Bearer (desktop).
 * @param {Request} [request]
 */
export async function getSessionTokenFromRequest(request) {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (fromCookie) return fromCookie
  const auth = request?.headers?.get?.('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim()
  }
  return null
}
