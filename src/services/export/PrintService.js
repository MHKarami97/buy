var FONT_WAIT_MS = 3000
var CLEANUP_MS = 60000

function withTimeout(promise, milliseconds) {
  return Promise.race([promise, new Promise(function (resolve) { setTimeout(resolve, milliseconds) })])
}

/**
 * Prints an HTML document through a hidden iframe so the user can choose
 * "Save as PDF". Browser print engines shape Persian/Arabic text correctly,
 * which most client-side PDF libraries do not.
 */
export class PrintService {
  static async printHtml(html) {
    var frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none'
    document.body.appendChild(frame)

    var frameDocument = frame.contentDocument
    frameDocument.open()
    frameDocument.write(html)
    frameDocument.close()

    await withTimeout(PrintService.#whenStylesheetsLoaded(frameDocument), FONT_WAIT_MS)
    await withTimeout(
      Promise.all([
        frameDocument.fonts.load('400 12px Vazirmatn'),
        frameDocument.fonts.load('700 12px Vazirmatn')
      ]),
      FONT_WAIT_MS
    )

    var cleanup = function () {
      if (frame.parentNode) frame.parentNode.removeChild(frame)
    }
    frame.contentWindow.addEventListener('afterprint', cleanup, { once: true })
    setTimeout(cleanup, CLEANUP_MS)
    frame.contentWindow.focus()
    frame.contentWindow.print()
  }

  static #whenStylesheetsLoaded(frameDocument) {
    var links = Array.from(frameDocument.querySelectorAll('link[rel="stylesheet"]'))
    return Promise.all(
      links.map(function (link) {
        return new Promise(function (resolve) {
          link.addEventListener('load', resolve, { once: true })
          link.addEventListener('error', resolve, { once: true })
        })
      })
    )
  }
}
