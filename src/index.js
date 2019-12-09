const { exec } = require('child_process')
const isElevated = require('is-elevated')
const temp = require('temp')
const fs = require('fs')
const { promisify } = require('util')

const execAsync = promisify(exec)
const writeAsync = promisify(fs.writeFile)

temp.track()

const PROMPT = 'DISKPART> '

module.exports.parseVolumes = parseVolumes
module.exports.listVolumes = listVolumes

function parseVolumes(volumesOutput) {
  const lines = volumesOutput
  const volumes = []

  let volumeListMarkerSeen = false
  let volumeListDividerSeen = false

  for (const line of lines) {
    if (!volumeListMarkerSeen) {
      if (line.startsWith('Volume ###')) {
        volumeListMarkerSeen = true
      }
      continue
    } else if (!volumeListDividerSeen) {
      if (line.startsWith('---')) {
        volumeListDividerSeen = true
      }
      continue
    } else if (line.startsWith('Volume')) {
      const words = line.split(/\s+/)

      const volume = {
        No: parseInt(words[1], 10),
        Line: line,
      }

      volumes.push(volume)
    } else {
      break
    }
  }

  return volumes
}

async function listVolumes(options){
  const lines = await run('list volume')
  return parseVolumes(lines)
}

module.exports.run = run

async function run(commands) {
  if (!Array.isArray(commands)) {
    commands = [commands]
  }

  await ensureElevated()

  const commandsAsLines = [...commands, 'exit'].join('\n')

  const tempFilePath = temp.path({ suffix: '.txt' })
  await writeAsync(tempFilePath, commandsAsLines)

  console.log(tempFilePath)

  const { stdout } = await execAsync(`diskpart /s "${tempFilePath}"`)
  return stdout.split('\n').map(l => l.trim())
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve,ms))
}

async function ensureElevated() {
  if (!await isElevated()) {
    throw new Error('Process needs to run with elevated privileges')
  }
}

