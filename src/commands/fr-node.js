module.exports = {
  name: 'fr-node',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Commands available: fr-node init NameProject')
  }
}
