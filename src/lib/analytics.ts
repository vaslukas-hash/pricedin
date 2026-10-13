export type AnalyticsEvent =
  | { name: 'apply_click'; params: { job_id: number; company: string } }
  | { name: 'job_view'; params: { job_id: number; company: string } }
  | { name: 'newsletter_signup'; params: Record<string, never> }

// GA is only loaded when NEXT_PUBLIC_GA_ID is set, so events are dropped silently otherwise
export function isAnalyticsEnabled(gaId = process.env.NEXT_PUBLIC_GA_ID): boolean {
  return Boolean(gaId && gaId.trim())
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined' || !isAnalyticsEnabled()) return
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag === 'function') {
    w.gtag('event', event.name, event.params)
  }
}
