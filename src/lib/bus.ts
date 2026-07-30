/** Tiny app-wide event bus for cross-component actions. */

export const EVENT_NEW_IDEA = 'cw:new-idea'
export const EVENT_COMMAND_PALETTE = 'cw:command-palette'

export function openNewIdea(): void {
  window.dispatchEvent(new Event(EVENT_NEW_IDEA))
}

export function openCommandPalette(): void {
  window.dispatchEvent(new Event(EVENT_COMMAND_PALETTE))
}

export function onAppEvent(name: string, handler: () => void): () => void {
  window.addEventListener(name, handler)
  return () => window.removeEventListener(name, handler)
}
