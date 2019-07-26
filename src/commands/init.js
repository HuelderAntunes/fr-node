const { cd } = require('shelljs')
const packageManagers = require('../presets/packagemanagers.json')
const webServices = require('../presets/webservices.json')
 
module.exports = {
  name: 'init',
  description: 'Initialize a new project using express.js',
  run: async toolbox => {
        
    const {
      parameters,
      system: { run },
      print: { error, success },
      template: { generate },
      filesystem: { read, write },
      prompt: { ask }
    } = toolbox

    const asks = {
      chooseYarnOrNpm: {
        type: 'list',
        name: 'packageManager',
        message: 'You prefer installing with yarn or npm?',
        choices: Object.keys(packageManagers)
      },
      chooseExpressOrRestify: {
        type: 'list',
        name: 'webService',
        message: 'You prefer using Express.js or Restify.js?',
        choices: Object.keys(webServices)
      }
    }

    const name = parameters.first

    if (!name) return error('Name of the project must be specified')
    await ask(asks.chooseYarnOrNpm)
    const answers = await ask(asks.chooseExpressOrRestify)

    packageManager = packageManagers[answers["packageManager"]]
    webService =  webServices[answers["webService"]]

    await run(`mkdir ${name.toLowerCase()}`, { trim: true })
    await cd(name.toLowerCase())

    await run(
      "npm init -y",
      { trim: true }
    )
    await run(
      [
        packageManager.cli,
        packageManager.install,
        packageManager.dev,
        'nodemon'
      ].join(' '),
      { trim: true }
    )
    await run(
      `${[packageManager.cli, packageManager.install].join(
        ' '
      )} ${webService.dependencies.join(' ')}`,
      {
        trim: true
      }
    )

    await run('mkdir routes', { trim: true })
    await run('mkdir model', { trim: true })

   await Promise.all(webService.generators.map( async generator => {
      await generate({
        template: generator.template,
        target: generator.target,
        props: { name }
      })
    }))

    const json = await read('package.json', 'json')
    json.scripts.start = 'node index.js'
    json.scripts.dev = 'nodemon index.js'
    await write('package.json', json)
    await run('code .', { trim: true })
    success(
      `Generated successfully!\nNow just: ${[
        packageManager.cli,
        packageManager.run,
        'dev'
      ].join(' ')}`
    )
  }
}
