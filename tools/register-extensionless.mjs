import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      var isRelative = specifier.startsWith('./') || specifier.startsWith('../')
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !isRelative) throw error
      return nextResolve(`${specifier}.js`, context)
    }
  }
})