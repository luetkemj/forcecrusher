import fs from 'fs/promises';
import cp from 'child_process'
import chalk from 'chalk'

const gitHash = cp.execSync('git rev-parse --short HEAD').toString().trim()

async function example() {
  try {
    const dir = await fs.readdir('./dist/assets')
    const files = dir.filter(fn => fn.endsWith('.js'))
    const file = files[0]

    const pathToFile = `./dist/assets/${file}`

    const data = await fs.readFile(pathToFile, { encoding: 'utf8' });
    const content = data.replace('GITHASH', gitHash)

    await fs.writeFile(pathToFile, content)

    console.log(`gitHash ${chalk.green(gitHash)} written to ${chalk.green(file)}`)
  } catch (err) {
    console.log(err);
  }
}
example();
