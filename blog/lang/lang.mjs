import { devanagariToRoman } from './romanizer.mjs'

const KEY = 'omr-lang'
const LANGS = ['hi', 'roman', 'en']
const LABELS = { hi: 'हिन्दुस्तानी', roman: 'रोमन हिन्दुस्तानी', en: 'English' }

let current = 'hi'

function currentLang() {
  try {
    const v = localStorage.getItem(KEY)
    return LANGS.includes(v) ? v : 'hi'
  } catch {
    return 'hi'
  }
}

function uiTitle(t) {
  return /[\u0900-\u097F]/.test(t) ? devanagariToRoman(t) : t
}

function loadTitle(s, lang) {
  if (lang === 'roman') return s.dataset.titleRoman || uiTitle(s.dataset.title)
  if (lang === 'en') return s.dataset.titleEn || s.dataset.title
  return s.dataset.title
}

function langBlocks() {
  return Array.from(document.querySelectorAll('.post-lang'))
}

function titleEls() {
  return Array.from(document.querySelectorAll('span.post-title-swap'))
}

// Pair each post-title span with the nearest preceding h3 anchor (spans are emitted
// right after the entry h3, so walking backwards a few siblings finds it).
function titlePairs() {
  const out = []
  for (const span of titleEls()) {
    let node = span.previousElementSibling
    while (node && !(node.tagName === 'H3')) node = node.previousElementSibling
    const anchor = node && node.querySelector('a')
    if (anchor) out.push({ span, anchor })
  }
  return out
}

function romanizeElement(elm) {
  const walker = document.createTreeWalker(elm, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    if (/[\u0900-\u097F]/.test(n.nodeValue)) n.nodeValue = devanagariToRoman(n.nodeValue)
  }
}

// Cache a romanized clone of the hindi block per .post-lang so we never re-romanize.
function romanBase(block) {
  const existing = block.querySelector('[data-roman]')
  if (existing) return existing
  const src = block.querySelector('[data-lang="hi"]')
  if (!src) return null
  const r = src.cloneNode(true)
  r.dataset.roman = 'true'
  r.removeAttribute('data-lang')
  r.setAttribute('hidden', '')
  romanizeElement(r)
  block.appendChild(r)
  return r
}

function applyLang(lang) {
  current = lang
  try {
    localStorage.setItem(KEY, lang)
  } catch {}

  for (const block of langBlocks()) {
    const hi = block.querySelector('[data-lang="hi"]')
    const en = block.querySelector('[data-lang="en"]')
    const roman = romanBase(block)

    block.querySelectorAll('[data-lang], [data-roman]').forEach((d) => d.setAttribute('hidden', ''))

    if (!hi && !en) continue // no switchable content, leave untouched

    let show = null
    if (lang === 'en') show = en
    else if (lang === 'roman') show = roman || hi
    else show = hi
    if (show) show.removeAttribute('hidden')
    else block.querySelectorAll('[data-lang], [data-roman]').forEach((d) => d.setAttribute('hidden', ''))
  }

  for (const { span, anchor } of titlePairs()) {
    const t = loadTitle(span, lang)
    if (t) anchor.textContent = t
  }

  const first = titleEls()[0]
  if (first) {
    const t = loadTitle(first, lang)
    if (t) document.title = t
  }
}

function buildBar() {
  const bar = document.createElement('div')
  bar.id = 'omr-langbar'
  bar.innerHTML =
    `<div class="bar-inner"><span class="bar-label">भाषा:</span>` +
    LANGS.map((l) => `<button data-lang="${l}" ${l === current ? 'class="active"' : ''}>${LABELS[l]}</button>`).join('') +
    `</div>`
  const root = document.querySelector('#divbodyholder') || document.body
  root.prepend(bar)
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-lang]')
    if (!b) return
    applyLang(b.dataset.lang)
    bar.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b))
  })
}

export function init() {
  current = currentLang()
  buildBar()
  applyLang(current)
}

document.addEventListener('DOMContentLoaded', () => init())