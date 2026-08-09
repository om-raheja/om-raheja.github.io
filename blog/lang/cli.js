#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { devanagariToRoman, slugify } from './romanizer.mjs'

const [cmd, ...rest] = process.argv.slice(2)

function fromStdin() {
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

if (cmd === 'slug') {
  const input = rest.length ? rest.join(' ') : fromStdin()
  process.stdout.write(slugify(input.trim()))
} else if (cmd === 'print') {
  const input = rest.length ? rest.join(' ') : fromStdin()
  process.stdout.write(devanagariToRoman(input.trim()))
} else {
  const input = fromStdin()
  process.stdout.write(devanagariToRoman(input.trim()))
}