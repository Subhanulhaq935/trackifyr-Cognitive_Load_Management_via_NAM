/**
 * Writes release-config.json from TRACKIFYR_API_BASE (no trailing slash).
 * If env is unset, keeps an existing release-config.json when it already has apiBase (CI / repo default).
 */
const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, '..', 'release-config.json')

function readExistingBase() {
  try {
    if (!fs.existsSync(out)) return ''
    const j = JSON.parse(fs.readFileSync(out, 'utf8'))
    return String(j.apiBase || '')
      .trim()
      .replace(/\/$/, '')
  } catch {
    return ''
  }
}

const fromEnv = (process.env.TRACKIFYR_API_BASE || '').trim().replace(/\/$/, '')
const base = fromEnv || readExistingBase()

if (!base) {
  console.error(
    'No API base: set TRACKIFYR_API_BASE or commit release-config.json with a non-empty "apiBase", e.g.\n' +
      '  https://your-app.vercel.app',
  )
  process.exit(1)
}

if (fromEnv) {
  fs.writeFileSync(out, JSON.stringify({ apiBase: base }, null, 2) + '\n')
  console.log('Wrote', out, '→', base)
} else {
  console.log('Using committed', out, '→', base)
}
