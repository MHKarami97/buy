import { ref } from 'vue'

var activeGuide = ref(null)

/**
 * Shared (module-level) state so any list row can open the same
 * single dialog instance mounted once in App.vue.
 */
export function useGuideDialog() {
  function open(guide) {
    if (guide) activeGuide.value = guide
  }

  function close() {
    activeGuide.value = null
  }

  return { activeGuide, open, close }
}
