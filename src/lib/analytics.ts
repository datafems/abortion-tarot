import { trackEvent } from "@lukulent/svelte-umami";

export const analystics = {
    ctaClick:  (label: string) => trackEvent('cta_click', { label })
}