export function devanagariToRoman(text) {
  if (!text) return ''
  let out = ''
  const s = Array.from(String(text))
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const n = s[i + 1]
    if (VOWEL_SIGN.has(c)) {
      out += VOWEL_SIGN.get(c)
    } else if (INDEPENDENT_VOWEL.has(c)) {
      out += INDEPENDENT_VOWEL.get(c)
    } else if (ANUSVARA.has(c)) {
      out += ANUSVARA.get(c)
    } else if (VISARGA.has(c)) {
      out += VISARGA.get(c)
    } else if (c === '\u0964' || c === '\u0965') {
      out += '. '
    } else if (CONSONANT_NUKTA.has(c + n)) {
      out += CONSONANT_NUKTA.get(c + n) + 'a'
      i++
    } else if (CONSONANT.has(c)) {
      let base = CONSONANT.get(c)
      let len = 1
      if (n === '\u094D') {
        // conjunct: consonant + virama + consonant
        const nc = s[i + 2]
        base += nc ? CONSONANT.get(nc) || nc : ''
        len = 3
        const after = s[i + 3]
        if (nc && after && VOWEL_SIGN.has(after)) {
          base += VOWEL_SIGN.get(after)
          len = 4
        } else if (!isWordFinal(after)) {
          base += 'a'
        }
      } else if (VOWEL_SIGN.has(n)) {
        base += VOWEL_SIGN.get(n)
        len = 2
      } else if (!isWordFinal(n)) {
        base += 'a'
      }
      out += base
      i += len - 1
    } else {
      out += c
    }
  }
  return out
}

export function slugify(text) {
  return devanagariToRoman(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const isWordFinal = (ch) => !ch || /\s/.test(ch) || /[.,!?;:'"()/\\<>|#@*$%^&+=~`\[\]{}।॥-]/.test(ch)

const INDEPENDENT_VOWEL = new Map(Object.entries({
  '\u0905': 'a', // अ
  '\u0906': 'a', // आ
  '\u0907': 'i', // इ
  '\u0908': 'i', // ई
  '\u0909': 'u', // उ
  '\u090A': 'u', // ऊ
  '\u090B': 'ri', // ऋ
  '\u090E': 'e', // ऎ
  '\u090F': 'e', // ए
  '\u0910': 'ai', // ऐ
  '\u0913': 'o', // ओ
  '\u0914': 'au', // औ
}))

const VOWEL_SIGN = new Map(Object.entries({
  '\u093E': 'a', // ा
  '\u093F': 'i', // ि
  '\u0940': 'i', // ी
  '\u0941': 'u', // ु
  '\u0942': 'u', // ू
  '\u0943': 'ri', // ृ
  '\u0944': 'ri', // ॄ
  '\u0945': 'e', // ॅ
  '\u0946': 'e', // ॆ
  '\u0947': 'e', // े
  '\u0948': 'ai', // ै
  '\u0949': 'o', // ॉ
  '\u094A': 'o', // ॊ
  '\u094B': 'o', // ो
  '\u094C': 'au', // ौ
}))

const CONSONANT = new Map(Object.entries({
  '\u0915': 'k', // क
  '\u0916': 'kh', // ख
  '\u0917': 'g', // ग
  '\u0918': 'gh', // घ
  '\u0919': 'ng', // ङ
  '\u091A': 'ch', // च
  '\u091B': 'chh', // छ
  '\u091C': 'j', // ज
  '\u091D': 'jh', // झ
  '\u091E': 'ny', // ञ
  '\u091F': 't', // ट
  '\u0920': 'th', // ठ
  '\u0921': 'd', // ड
  '\u0922': 'dh', // ढ
  '\u0923': 'n', // ण
  '\u0924': 't', // त
  '\u0925': 'th', // थ
  '\u0926': 'd', // द
  '\u0927': 'dh', // ध
  '\u0928': 'n', // न
  '\u092A': 'p', // प
  '\u092B': 'ph', // फ
  '\u092C': 'b', // ब
  '\u092D': 'bh', // भ
  '\u092E': 'm', // म
  '\u092F': 'y', // य
  '\u0930': 'r', // र
  '\u0932': 'l', // ल
  '\u0935': 'v', // व
  '\u0936': 'sh', // श
  '\u0937': 'sh', // ष
  '\u0938': 's', // स
  '\u0939': 'h', // ह
}))

// base consonant + nukta ( combining "\u093C")
const CONSONANT_NUKTA = new Map(Object.entries({
  '\u0915\u093C': 'q', // क़
  '\u0916\u093C': 'kh', // ख़
  '\u0917\u093C': 'g', // ग़
  '\u091C\u093C': 'z', // ज़
  '\u0921\u093C': 'r', // ड़
  '\u0922\u093C': 'rh', // ढ़
  '\u092B\u093C': 'f', // फ़
  '\u092F\u093C': 'y', // य़
}))

const ANUSVARA = new Map(Object.entries({
  '\u0901': 'n', // ँ
  '\u0902': 'n', // ं
}))

const VISARGA = new Map(Object.entries({
  '\u0903': 'h', // ः
}))