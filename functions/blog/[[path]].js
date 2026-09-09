import { jwtVerify } from 'jose'

const COOKIE_NAME = 'session'
const SITE_URL = 'https://omraheja.me'
const API_URL = 'https://api.omraheja.me'
const ALLOWLIST_KEY = 'allowed'

function getCookie(request) {
  const header = request.headers.get('Cookie') || ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE_NAME) return rest.join('=').trim()
  }
  return null
}

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

async function isAllowed(payload, env) {
  const email = (payload?.email || '').toLowerCase()
  if (!email) return false
  const admins = (env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
  if (admins.includes(email)) return true
  return (await kvList(env)).includes(email)
}

function isAdmin(payload, env) {
  const email = (payload?.email || '').toLowerCase()
  if (!email) return false
  return (env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean).includes(email)
}

async function verifySession(request, env) {
  const token = getCookie(request)
  if (!token || !env.WORKOS_API_KEY) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.WORKOS_API_KEY))
    if (!(await isAllowed(payload, env))) return null
    return payload
  } catch {
    return null
  }
}

const ADMIN_CSS = '<link rel="stylesheet" href="/blog/admin/admin.css">'
const ADMIN_UI = `<details class="admin-nav site-nav">
  <summary aria-label="Admin settings">&#9874;</summary>
  <div class="admin-nav-inner">
    <h3 class="admin-title">Authorized emails</h3>
    <p class="admin-hint">Emails that may sign in to the blog.</p>
    <ul class="admin-list" id="admin-list"></ul>
    <form class="admin-add" id="admin-add" novalidate>
      <input type="email" id="admin-email" placeholder="add@email.com" autocomplete="off" />
      <button type="submit">Add</button>
    </form>
    <p class="admin-msg" id="admin-msg" hidden></p>
  </div>
</details>
<script defer src="/blog/admin/admin.js"></script>`

async function serve(asset, env, admin) {
  if (!admin) return asset
  const type = (asset.headers.get('Content-Type') || '').toLowerCase()
  if (!type.includes('text/html')) return asset
  const body = await asset.text()
  const hasHead = /<\/head>/i.test(body)
  const hasBody = /<\/body>/i.test(body)
  let out = body
  if (hasHead) out = out.replace(/<\/head>/i, `${ADMIN_CSS}\n</head>`)
  if (hasBody) {
    out = out.replace(/<\/body>/i, `${ADMIN_UI}\n</body>`)
  } else {
    out += `\n${ADMIN_UI}`
  }
  return new Response(out, {
    status: asset.status,
    headers: {
      'Content-Type': asset.headers.get('Content-Type'),
    },
  })
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

  const admin = isAdmin(session, env)

  let asset = await env.ASSETS.fetch(request)
  if (asset.status === 404 && url.pathname.endsWith('/')) {
    const index = new URL(url.pathname + 'index.html')
    asset = await env.ASSETS.fetch(new Request(index, request))
  }
  return serve(asset, env, admin)
}