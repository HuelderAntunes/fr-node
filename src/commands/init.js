const { cd } = require('shelljs')
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
    const name = parameters.first

    if (!name) return error('Name of the project must be specified')

    const chooseYarnOrNpm = {
      type: 'list',
      name: 'yarnOrNpm',
      message: 'You prefer installing with yarn or npm?',
      choices: ['yarn', 'npm']
    }

    const answer = await ask(chooseYarnOrNpm)

    const chooseExpressOrRestify = {
      type: 'list',
      name: 'expressOrRestify',
      message: 'You prefer using Express.js or Restify.js?',
      choices: ['express.js', 'restify.js']
    }

    const answer2 = await ask(chooseExpressOrRestify)

    if (answer.yarnOrNpm === 'yarn' && answer2.expressOrRestify === 'express.js') {
      await run(`mkdir ${name.toLowerCase()}`, { trim: true })
      await cd(name.toLowerCase())
      await run('npm init -y', { trim: true })
      await run('yarn add -D nodemon', { trim: true })
      await run('yarn add express body-parser cors mongoose dotenv helmet', { trim: true })
    } else if (answer.yarnOrNpm === 'yarn' && answer2.expressOrRestify === 'restify.js') {
      await run(`mkdir ${name.toLowerCase()}`, { trim: true })
      await cd(name.toLowerCase())
      await run('npm init -y', { trim: true })
      await run('yarn add -D nodemon', { trim: true })
      await run('yarn add restify restify-cors-middleware mongoose dotenv helmet-csp', { trim: true })
    } else if (answer.yarnOrNpm === 'npm' && answer2.expressOrRestify === 'express.js') {
      await run(`mkdir ${name.toLowerCase()}`, { trim: true })
      await cd(name.toLowerCase())
      await run('npm init -y', { trim: true })
      await run('npm install nodemon --save-dev', { trim: true })
      await run('npm install express body-parser cors mongoose dotenv helmet --save', { trim: true })
    } else if (answer.yarnOrNpm === 'npm' && answer2.expressOrRestify === 'restify.js') {
      await run(`mkdir ${name.toLowerCase()}`, { trim: true })
      await cd(name.toLowerCase())
      await run('npm init -y', { trim: true })
      await run('npm install nodemon --save-dev', { trim: true })
      await run('npm install restify restify-cors-middleware mongoose dotenv helmet-csp --save', { trim: true })
    }

    if (answer2.expressOrRestify === 'express.js') {
      await generate({
        template: 'boilerplateExpress.js.ejs',
        target: 'index.js',
        props: { name }
      })

      await run('mkdir routes', { trim: true })
      await run('mkdir model', { trim: true })

      await generate({
        template: 'routeExpress.js.ejs',
        target: 'routes/home.js',
        props: { name }
      })
    } else {
      await generate({
        template: 'boilerplateRestify.js.ejs',
        target: 'index.js',
        props: { name }
      })

      await run('mkdir routes', { trim: true })
      await run('mkdir model', { trim: true })

      await generate({
        template: 'routeRestify.js.ejs',
        target: 'routes/home.js',
        props: { name }
      })

      await generate({
        template: 'indexRoutesRestify.js.ejs',
        target: 'routes/index.js'
      })
    }

    const json = await read('package.json', 'json')
    json.scripts.start = 'node index.js'
    json.scripts.dev = 'nodemon index.js'
    await write('package.json', json)
    await run('code .', { trim: true })
    success(
      answer.yarnOrNpm === 'yarn' ? `Generated successfully!\nNow just: yarn run dev`
        : `Generated successfully!\nNow just: npm run dev`
    )
  }
}
