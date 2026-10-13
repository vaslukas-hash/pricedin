import { GoogleAnalytics } from '@next/third-parties/google'
import { isAnalyticsEnabled } from '@/lib/analytics'

// Single place GA is loaded. Wrap this in a consent check if EU traffic grows.
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!isAnalyticsEnabled(gaId)) return null
  return <GoogleAnalytics gaId={gaId!.trim()} />
}
