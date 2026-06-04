#!/usr/bin/env node

import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const appArgs = process.argv.slice(2)
const appScriptArgs = appArgs.length
  ? ['run', 'dev:app', '--', ...appArgs]
  : ['run', 'dev:app']
const processGroupSignals = new Set(['SIGINT', 'SIGTERM'])
const children = [
  {
    args: ['run', 'dev:api'],
    name: 'api',
  },
  {
    args: appScriptArgs,
    name: 'app',
  },
].map(({ args, name }) => ({
  child: spawn(npmCommand, args, {
    detached: process.platform !== 'win32',
    env: process.env,
    stdio: 'inherit',
  }),
  name,
}))

let isShuttingDown = false

function stopChildProcess(child, signal = 'SIGTERM') {
  if (!child.pid || child.exitCode !== null || child.signalCode) return

  try {
    if (process.platform !== 'win32') {
      process.kill(-child.pid, signal)
      return
    }

    child.kill(signal)
  } catch (error) {
    if (error?.code !== 'ESRCH') {
      console.error(`Failed to stop dev child process ${child.pid}:`, error)
    }
  }
}

function shutdown(exitCode = 0, signal = 'SIGTERM') {
  if (isShuttingDown) return

  isShuttingDown = true

  for (const { child } of children) {
    stopChildProcess(child, signal)
  }

  setTimeout(() => {
    process.exit(exitCode)
  }, 150).unref()
}

for (const { child, name } of children) {
  child.on('error', (error) => {
    console.error(`Failed to start ${name} dev process:`, error)
    shutdown(1)
  })

  child.on('exit', (code, signal) => {
    if (isShuttingDown) return

    const exitCode = typeof code === 'number' ? code : signal ? 1 : 0
    shutdown(exitCode, signal ?? 'SIGTERM')
  })
}

for (const signal of processGroupSignals) {
  process.on(signal, () => {
    shutdown(0, signal)
  })
}
