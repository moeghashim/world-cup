import { spawn } from 'node:child_process'

const processes = [
  spawn('npm', ['run', 'dev:api'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev:app'], { stdio: 'inherit' }),
]

function stopAll(signal) {
  for (const child of processes) {
    if (!child.killed) child.kill(signal)
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopAll(signal)
    process.exit(signal === 'SIGINT' ? 130 : 143)
  })
}

for (const child of processes) {
  child.on('exit', (code, signal) => {
    if (code === 0 || signal) return
    stopAll('SIGTERM')
    process.exit(code ?? 1)
  })
}

