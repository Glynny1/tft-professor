// Placeholder analytics hooks. Swap implementation with your provider (e.g., PostHog, GA).

type AnalyticsEvent = {
  name: string
  props?: Record<string, unknown>
}

export function trackEvent(event: AnalyticsEvent) {
  // No-op placeholder
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event.name, event.props ?? {})
  }
}

export function trackPage(page: string, props?: Record<string, unknown>) {
  trackEvent({ name: `page_view:${page}`, props })
}

