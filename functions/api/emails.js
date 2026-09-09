import { jwtVerify } from 'jose'

const COOKIE_NAME = 'session'
const ALLOWLIST_KEY = 'allowed'

function getCookie(request) {
  const header = request.headers.get('Cookie') || ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE_NAME) return rest.join('=').trim()
  }
  return null
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

async function kvList(env) {
  const seed = (env.ALLOWED_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
  if (!env.ALLOWLIST) return seed
  const kv = await env.ALLOWLIST.get(ALLOWLIST_KEY)
  if (kv) {
    try {
      return JSON.parse(kv)
    } catch {
      return seed
    }
  }
  await env.ALLOWLIST.put(ALLOWLIST_KEY, JSON.stringify(seed))
  return seed
}

async function saveList(env, list) {
  const unique = [...new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean))]
  await env.ALLOWLIST.put(ALLOWLIST_KEY, JSON.stringify(unique))
  return unique
}

const adminsOf = (env) => (env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)

async function verifyAdmin(request, env) {
  const token = getCookie(request)
  if (!token || !env.WORKOS_API_KEY) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.WORKOS_API_KEY))
    const email = (payload.email || '').toLowerCase()
    if (!email || !adminsOf(env).includes(email)) return null
    return payload
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const { request, env } = context

  if (!(await verifyAdmin(request, env))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const url = new URL(request.url)
  if (url.pathname !== '/api/emails') {
    return json({ error: 'not found' }, 404)
  }

  const list = await kvList(env)
  const admins = adminsOf(env)

  if (request.method === 'GET') {
    return json({ emails: list, admins })
  }

  if (request.method === 'POST') {
    let email = ''
    try {
      email = ((await request.json()).email || '').trim().toLowerCase()
    } catch {
      return json({ error: 'invalid body' }, 400)
    }
    if (!email || !/.+@.+\..+/.test(email)) return json({ error: 'invalid email' }, 400)
    const next = await saveList(env, [...list, email])
    return json({ emails: next, admins })
  }

  if (request.method === 'DELETE') {
    let email = ''
    try {
      email = ((await request.json()).email || '').trim().toLowerCase()
    } catch {
      return json({ error: 'invalid body' }, 400)
    }
    if (!email) return json({ error: 'invalid email' }, 400)
    if (admins.includes(email)) return json({ error: 'admins cannot be removed' }, 400)
    const next = await saveList(env, list.filter((e) => e !== email))
    return json({ emails: next, admins })
  }

  return json({ error: 'method not allowed' }, 405)
}