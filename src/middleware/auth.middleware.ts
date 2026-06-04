import { auth } from '#/lib/auth'
import { AUTH_LOGIN_PATH, isLoginPath, isPublicPath } from '#/lib/auth_paths'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

export const authFnMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) throw redirect({ to: AUTH_LOGIN_PATH })

    return next({ context: { session } })
  },
)

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    const { pathname } = new URL(request.url)
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    // logged-in users should not visit login
    if (isLoginPath(pathname) && session) throw redirect({ to: '/dashboard' })

    // allow public paths
    if (isPublicPath(pathname)) return next()

    // protect everything else
    if (!session) throw redirect({ to: AUTH_LOGIN_PATH })

    return next({ context: { session } })
  },
)
