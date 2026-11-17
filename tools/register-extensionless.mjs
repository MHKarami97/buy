import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      var isRelative = specifier.startsWith('./') || specifier.startsWith('../')
      if (!isRelative) throw error
      if (error.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
        return nextResolve(`${specifier}/index.js`, context)
      }
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  }
})