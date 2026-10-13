import type { Metadata } from 'next'
import { Header, Footer } from '@/components'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How PricedIn handles analytics, cookies and the personal data you share with us.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-slate">
          <h1>Privacy Policy</h1>
          <p>PricedIn (pricedin.co) is a job board for pricing, monetization and revenue strategy professionals. This page explains what data we collect and why.</p>

          <h2>Analytics</h2>
          <p>
            We use Google Analytics 4 to understand how visitors use the site, for example which pages are viewed, which jobs
            receive clicks on &quot;Apply&quot;, and how many people subscribe to the newsletter. Google Analytics uses cookies
            and similar technologies and collects data such as pages visited, approximate location, device and browser type.
            Google processes this data on our behalf. You can opt out with the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">Google Analytics opt-out browser add-on</a>{' '}
            or by blocking cookies in your browser.
          </p>

          <h2>Job listings and applications</h2>
          <p>
            When you click &quot;Apply&quot; you are sent to the employer&apos;s own site or application system. We do not receive
            your application. We only count the click.
          </p>

          <h2>Newsletter</h2>
          <p>
            If you subscribe, we store your email address to send you job alerts. You can unsubscribe at any time.
          </p>

          <h2>Employers</h2>
          <p>
            When you post a job we store the details you submit, including a contact email address that is used only to
            contact you about your listing and is not shown publicly.
          </p>

          <h2>Contact</h2>
          <p>Questions or requests about your data? Email us at the contact address listed on the site.</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
