/**
 * Clears desktop/release before electron-builder runs.
 * Avoids "Access is denied" when DLLs are still locked by a running app.
 */
const fs = require('fs/promises')
const path = require('path')
const { execSync } = require('child_process')

const releaseDir = path.join(__dirname, '..', 'release')

function tryKillTrackifyr() {
  if (process.platform !== 'win32') return
  try {
    execSync('taskkill /F /IM trackifyr.exe /T', { stdio: 'ignore' })
  } catch {
    /* not running */
  }
}

async function rmRelease(attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    try {
      await fs.rm(releaseDir, { recursive: true, force: true })
      return
    } catch (err) {
      if (i === attempts - 1) {
        console.error(
          '\nCould not delete desktop/release. Close the trackifyr app (and any Explorer window ' +
            'open inside release\\win-unpacked), then run npm run dist again.\n',
        )
        throw err
      }
      await new Promise((r) => setTimeout(r, 400))
    }
  }
}

async function main() {
  tryKillTrackifyr()
  await rmRelease()
}

main().catch(() => process.exit(1))
