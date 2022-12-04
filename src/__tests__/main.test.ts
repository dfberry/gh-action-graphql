import { expect, test } from '@jest/globals'
import { execPath } from 'process'
import path from 'path'
import { spawnSync } from 'child_process'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs with failure - missing param', () => {
  const ip = path.join(__dirname, '..', '..', 'dist', 'main.js')
  const devEnv = Object.create(process.env)
  const spawn = spawnSync(execPath, [ip], { env: devEnv })

  // success
  expect(spawn.status).toBe(1)
  expect(spawn.output.toString()).toContain(
    'GitHub Personal Access Token is required'
  )
})
