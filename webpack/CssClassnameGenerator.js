const path = require('path')
const incstr = require('incstr')

let id
const idIndex = new Map()

module.exports = ({ isProduction }) => {
  // We can use - and _ because we always prefix the id with w
  incstr.alphabet = '-_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  return (context, localIdentName, localName, options) => {
    const { resourcePath } = context
    const resourceName = path.basename(resourcePath)
    const isModule = resourceName.endsWith('.module.less') || resourceName.endsWith('.module.css')
    if (isModule) {
      const indexKey = `${resourcePath}-${localName}`
      if (!idIndex.has(indexKey)) {
        id = incstr(id)

        idIndex.set(
          indexKey,
          isProduction
            ? `w${id}`
            : `${resourceName.split('.')[0]}-${localName}-${id}`
        )
      }

      return idIndex.get(indexKey)
    } else {
      return localName
    }
  }
}
