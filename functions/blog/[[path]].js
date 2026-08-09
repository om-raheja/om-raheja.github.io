import { jwtVerify } from 'jose'

const COOKIE_NAME = 'session'
const SITE_URL = 'https://omraheja.me'
const API_URL = 'https://api.omraheja.me'

function getCookie(request) {
  const header = request.headers.get('Cookie') || ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE_NAME) return rest.join('=').trim()
  }
  return null
}

function isAllowed(payload, env) {
  const email = payload?.email
  if (!email) return false
  const adminList = (env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  const allowedList = (env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  return adminList.includes(email) || allowedList.includes(email)
}

async function verifySession(request, env) {
  const token = getCookie(request)
  if (!token || !env.WORKOS_API_KEY) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.WORKOS_API_KEY))
    if (!isAllowed(payload, env)) return null
    return payload
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 })
  }

  const session = await verifySession(request, env)
  if (!session) {
    const target = new URL('/auth/login', API_URL)
    target.searchParams.set('redirect', url.pathname + url.search)
    return Response.redirect(target.toString(), 302)
  }

  const asset = await env.ASSETS.fetch(request)
  if (asset.status === 404 && url.pathname.endsWith('/')) {
    const index = new URL(url.pathname + 'index.html')
    return env.ASSETS.fetch(new Request(index, request))
  }
  return asset
}