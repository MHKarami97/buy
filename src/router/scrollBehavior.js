/**
 * Vue Router scroll behavior handler.
 * Automatically scrolls to top (0, 0) on new page navigations,
 * scrolls to anchor element if hash is present, or restores
 * previous scroll position on history popstate (Back/Forward).
 */
export function scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  }
  if (to?.hash) {
    return { el: to.hash, behavior: 'smooth' }
  }
  return { top: 0, left: 0 }
}
