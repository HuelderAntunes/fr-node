const { cd } = require('shelljs')
module.exports = {
  name: 'new',
  description: 'Initialize a new project using express.js',
  run: async toolbox => {
    const {
      parameters,
      system: { run },
      print: { error, success },
      template: { generate },
      filesystem: { read, write }
    } = toolbox
    const name = parameters.first

    if (!name) return error('Name of the project must be specified')

    await run(`mkdir ${name.toLowerCase()}`, { trim: true })
    await cd(name.toLowerCase())
    await run('npm init -y', { trim: true })
    await run('yarn add -D nodemon', { trim: true })
    await run('yarn add express body-parser cors mongoose dotenv', { trim: true })

    await generate({
      template: 'boilerplate.js.ejs',
      target: 'index.js',
      props: { name }
    })

    await run('mkdir routes', { trim: true })
    await run('mkdir model', { trim: true })

    await generate({
      template: 'route.js.ejs',
      target: 'routes/home.js',
      props: { name }
    })

    const json = await read('package.json', 'json')
    json.scripts.start = 'node index.js'
    json.scripts.dev = 'nodemon index.js'
    await write('package.json', json)
    await run('code .', { trim: true })
    success(`Generated successfully!\nNow just: yarn run dev`)
  }
}
