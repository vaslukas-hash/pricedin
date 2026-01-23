import Link from 'next/link'
import { Header, Footer } from '@/components'

export const metadata = {
  title: 'Job Submitted',
}

export default function PostJobSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-brand-900 mb-4">
            Job Submitted Successfully!
          </h1>
          
          <p className="text-brand-600 mb-8">
            Thank you for posting on PricedIn. Our team will review your job posting 
            and approve it within 24 hours. You'll receive an email at the contact 
            address you provided once it's live.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" className="btn-primary btn-lg">
              Browse Jobs
            </Link>
            <Link href="/post-job" className="btn-outline btn-lg">
              Post Another Job
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
