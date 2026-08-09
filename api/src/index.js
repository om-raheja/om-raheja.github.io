import { SignJWT, jwtVerify } from 'jose'

const WORKOS_API = 'https://api.workos.com'
const SESSION_COOKIE = 'session'
const SESSION_TTL = 60 * 60 * 24 * 30
const LOGIN_PATH = '/auth/login'

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const html = (data, status = 200) => new Response(data, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

function cookieFrom(req) {
  const header = req.headers.get('Cookie') || ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === SESSION_COOKIE) return rest.join('=').trim()
  }
  return null
}

function parseBody(env) {
  const adminList = (env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  const allowedList = (env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  return { adminList, allowedList }
}

function isAllowedEmail(email, env) {
  const { adminList, allowedList } = parseBody(env)
  return adminList.includes(email) || allowedList.includes(email)
}

function roleFor(email, env) {
  return (env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean).includes(email)
    ? 'admin'
    : 'member'
}

async function issueSession(profile, env) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email.split('@')[0]
  const jwt = await new SignJWT({ email: profile.email, name, role: roleFor(profile.email, env) })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(profile.id)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(env.WORKOS_API_KEY))
  return `session=${jwt}; Path=/; Domain=.omraheja.me; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`
}

const logoutCookie = 'session=; Path=/; Domain=.omraheja.me; HttpOnly; Secure; SameSite=Lax; Max-Age=0'

async function verifySession(req, env) {
  const token = cookieFrom(req)
  if (!token || !env.WORKOS_API_KEY) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.WORKOS_API_KEY))
    if (!isAllowedEmail(payload.email, env)) return null
    return payload
  } catch {
    return null
  }
}

const authorizeURL = (env, connection) => {
  const params = new URLSearchParams({
    client_id: env.WORKOS_CLIENT_ID,
    redirect_uri: env.WORKOS_REDIRECT_URI,
    response_type: 'code',
    provider: connection,
  })
  return `${WORKOS_API}/user_management/authorize?${params}`
}

const authenticatePassword = (env, email, password) =>
  fetch(`${WORKOS_API}/user_management/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WORKOS_API_KEY}` },
    body: JSON.stringify({
      grant_type: 'password',
      client_id: env.WORKOS_CLIENT_ID,
      client_secret: env.WORKOS_API_KEY,
      email,
      password,
    }),
  })

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const safeRedirect = (target, env) => {
  const fallback = env.REDIRECT_AFTER_LOGIN || 'https://omraheja.me/blog/'
  if (!target) return fallback
  if (target.startsWith('/')) return `https://omraheja.me${target}`
  if (target.startsWith('https://omraheja.me')) return target
  return fallback
}

const loginPage = (redirect, error = '') => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Sign in &mdash; Om's Blog</title>
<style>
  body{font-family:Georgia,"Times New Roman",Times,serif;background:#f3f3f3;margin:0;padding:48px 16px;display:flex;flex-direction:column;align-items:center;color:#111}
  .card{background:#fff;border:solid 1px #ccc;border-radius:8px;padding:32px;max-width:360px;width:100%}
  h1{font-size:22px;margin:0 0 16px}
  p{color:#555;margin:0 0 20px;font-size:14px}
  a.g,button.b{display:block;width:100%;box-sizing:border-box;text-align:center;padding:12px;border-radius:6px;border:solid 1px #ccc;background:#fff;color:#111;text-decoration:none;font-size:15px;margin-bottom:16px;cursor:pointer}
  a.g:hover,button.b:hover{background:#f6f6f6}
  .sep{text-align:center;color:#999;font-size:12px;margin:4px 0 16px}
  input{display:block;width:100%;box-sizing:border-box;margin:8px 0 16px;padding:10px;border:solid 1px #ccc;border-radius:6px;font-size:15px}
  label{font-size:13px;color:#333}
  .err{color:#b00020;font-size:13px;margin:0 0 12px}
  .toggle{color:#035;font-size:14px;text-decoration:underline;cursor:pointer;display:block;margin-top:4px}
</style>
</head>
<body>
<div class="card">
  <h1 id="title">Sign in</h1>
  <p id="sub">Welcome back. Use Google or your email to continue.</p>
  ${error ? `<p class="err">${error}</p>` : ''}
  <a class="g" href="/auth/google?redirect=${encodeURIComponent(redirect)}">Continue with Google</a>
  <div class="sep">or</div>
  <form method="post" action="/auth/password">
    <input type="hidden" name="mode" id="mode" value="signin" />
    <input type="hidden" name="redirect" value="${esc(redirect)}" />
    <label>Email</label>
    <input type="email" name="email" id="email" required autocomplete="username" />
    <label>Password</label>
    <input type="password" name="password" id="password" required autocomplete="current-password" />
    <button class="b" id="submit" type="submit">Sign in</button>
    <span class="toggle" id="toggle">New here? Create an account</span>
  </form>
</div>
<script>
  const t = document.getElementById('toggle')
  let mode = 'signin'
  t.onclick = () => {
    mode = mode === 'signin' ? 'signup' : 'signin'
    document.getElementById('mode').value = mode
    document.getElementById('title').textContent = mode === 'signin' ? 'Sign in' : 'Create account'
    document.getElementById('sub').textContent = mode === 'signin' ? 'Welcome back. Use Google or your email to continue.' : 'Pick a password to start reading.'
    document.getElementById('submit').textContent = mode === 'signin' ? 'Sign in' : 'Create account'
    document.getElementById('password').autocomplete = mode === 'signin' ? 'current-password' : 'new-password'
    t.textContent = mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'
  }
</script>
</body>
</html>`

const deniedPage = () => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Not authorized</title></head>
<body style="font-family:Georgia,serif;background:#f3f3f3;padding:48px;text-align:center;color:#111">
<h1>Not authorized</h1><p>Your account is not on the allowlist for this blog.</p>
<p><a href="/auth/logout" style="color:#003366">Sign out</a></p>
</body></html>`

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    let redirect = url.searchParams.get('redirect') || env.REDIRECT_AFTER_LOGIN || 'https://omraheja.me/blog/'
    if (!redirect.startsWith('/') && !redirect.startsWith('https://omraheja.me')) redirect = env.REDIRECT_AFTER_LOGIN
    redirect = safeRedirect(redirect, env)

    if (path === '/' || path === '/health') {
      return json({ ok: true, service: 'omraheja-api' })
    }

    if (path === '/auth/me') {
      const session = await verifySession(request, env)
      return session ? json({ ok: true, session }) : json({ ok: false }, 401)
    }

    if (path === '/auth/login') {
      const session = await verifySession(request, env)
      return html(session ? `<!doctype html><meta http-equiv="refresh" content="0;url=${env.REDIRECT_AFTER_LOGIN}">` : loginPage(redirect))
    }

    if (path === '/auth/google') {
      return Response.redirect(authorizeURL(env, 'GoogleOAuth'), 302)
    }

    if (path === '/auth/password' && request.method === 'POST') {
      const body = await request.formData()
      redirect = safeRedirect(body.get('redirect') || redirect, env)
      const mode = body.get('mode') === 'signup' ? 'signup' : 'signin'
      const email = (body.get('email') || '').trim().toLowerCase()
      const password = body.get('password') || ''
      if (!email || !password) return html(loginPage(redirect, 'Email and password are required.'), 400)
      if (!isAllowedEmail(email, env)) return html(deniedPage())
      let res
      if (mode === 'signup') {
        const createRes = await fetch(`${WORKOS_API}/user_management/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WORKOS_API_KEY}` },
          body: JSON.stringify({ email, password, email_verified: true, password_hashed: false }),
        })
        const created = await createRes.json().catch(() => ({}))
        const duplicate = created.code === 'duplicate_email' || (created.errors || []).some((e) => e.code === 'email_not_available')
        if (!createRes.ok && !duplicate) {
          return html(loginPage(redirect, (created.message) || 'Could not create account.'), 200)
        }
        if (duplicate) {
          return html(loginPage(redirect, 'That email already has an account. Try signing in instead.'), 200)
        }
        res = await authenticatePassword(env, email, password)
      } else {
        res = await authenticatePassword(env, email, password)
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return html(loginPage(redirect, data.message || 'Invalid email or password.'), 200)
      const user = data.user || {}
      const cookie = await issueSession({ id: user.id || email, email: user.email || email, first_name: user.first_name, last_name: user.last_name }, env)
      return new Response(null, { status: 302, headers: { Location: redirect, 'Set-Cookie': cookie } })
    }

    if (path === '/auth/callback') {
      const code = url.searchParams.get('code')
      if (!code) return Response.redirect(`${LOGIN_PATH}?error=no_code&redirect=${encodeURIComponent(redirect)}`, 302)
      const res = await fetch(`${WORKOS_API}/user_management/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WORKOS_API_KEY}` },
        body: JSON.stringify({
          client_id: env.WORKOS_CLIENT_ID,
          client_secret: env.WORKOS_API_KEY,
          grant_type: 'authorization_code',
          code,
        }),
      })
      const data = await res.json().catch(() => ({}))
      const user = data.user || {}
      const email = (user.email || '').toLowerCase()
      if (!res.ok || !email) return html(loginPage(redirect, 'Sign-in failed. Please try again.'), 200)
      if (!isAllowedEmail(email, env)) return html(deniedPage())
      const cookie = await issueSession({ id: user.id, email, first_name: user.first_name, last_name: user.last_name }, env)
      return new Response(null, { status: 302, headers: { Location: redirect, 'Set-Cookie': cookie } })
    }

    if (path === '/auth/logout') {
      return new Response(null, { status: 302, headers: { Location: env.SITE_URL + '/blog/', 'Set-Cookie': logoutCookie } })
    }

    if (path.startsWith('/api/')) {
      const session = await verifySession(request, env)
      if (!session) return json({ error: 'unauthorized' }, 401)
      return json({ ok: true, path })
    }

    return json({ error: 'not found' }, 404)
  },
}