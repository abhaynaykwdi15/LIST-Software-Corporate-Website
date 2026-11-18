import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend')
const python = path.join(backend, '.venv', 'Scripts', 'python.exe')
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const children = []

for (const [file, description] of [
  [python, 'Backend virtual environment'],
  [vite, 'Frontend dependencies'],
  [path.join(backend, '.env'), 'Backend environment file'],
]) {
  if (!existsSync(file)) {
    console.error(`${description} not found: ${file}`)
    console.error('Follow the local setup instructions in README.md, then run npm run dev:full.')
    process.exit(1)
  }
}

async function responds(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return response.ok
  } catch {
    return false
  }
}

async function waitForApi(apiProcess) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await responds('http://127.0.0.1:8000/api/health')) return true
    if (apiProcess.exitCode !== null) return false
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

const apiAlreadyRunning = await responds('http://127.0.0.1:8000/api/health')

if (!apiAlreadyRunning) {
  const migration = spawnSync(python, ['-m', 'alembic', 'upgrade', 'head'], {
    cwd: backend,
    stdio: 'inherit',
  })

  if (migration.error) {
    console.error('Could not run database migrations:', migration.error.message)
    process.exit(1)
  }

  if (migration.status !== 0) {
    process.exit(migration.status ?? 1)
  }

  const apiProcess = spawn(
    python,
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'],
    { cwd: backend, stdio: 'inherit' },
  )
  children.push(apiProcess)

  if (!(await waitForApi(apiProcess))) {
    console.error('API did not start. If port 8000 is already in use, do not start a second Uvicorn server.')
    process.exit(1)
  }
}

console.log('Starting API at http://localhost:8000 and website at http://localhost:5173')
if (apiAlreadyRunning) console.log('Using the API already running on port 8000.')

if (!(await responds('http://127.0.0.1:5173/@vite/client'))) {
  children.push(
    spawn(process.execPath, [vite, '--host', '0.0.0.0', '--port', '5173', '--strictPort'], {
      cwd: root,
      stdio: 'inherit',
    }),
  )
} else {
  console.log('Using the website already running on port 5173.')
}

if (children.length === 0) {
  console.log('Both servers are already running. No duplicate server was started.')
} else {
  console.log('Press Ctrl+C to stop servers started by this command.')

  let stopping = false

  function stop(exitCode) {
    if (stopping) return
    stopping = true
    process.exitCode = exitCode
    for (const child of children) {
      if (child.exitCode === null) child.kill()
    }
  }

  process.on('SIGINT', () => stop(0))
  process.on('SIGTERM', () => stop(0))

  for (const child of children) {
    child.on('error', (error) => {
      console.error('Could not start a development server:', error.message)
      stop(1)
    })
    child.on('exit', (code) => {
      if (!stopping) {
        console.error(`A development server exited${code === null ? '' : ` with code ${code}`}.`)
        stop(code ?? 1)
      }
    })
  }
}
