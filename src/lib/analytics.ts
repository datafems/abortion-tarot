import { trackEvent } from '@lukulent/svelte-umami'

export function waitForUmami(): Promise<void> {
  return new Promise((resolve) => {
    if (window.umami) return resolve()

    const interval = setInterval(() => {
      if (window.umami) {
        clearInterval(interval)
        resolve()
      }
    }, 50)

    setTimeout(() => {
      clearInterval(interval)
      resolve()
    }, 3000)
  })
}

export async function track(event: string, props?: Record<string, string>) {
  await waitForUmami()
  trackEvent(event, props)
}