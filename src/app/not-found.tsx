import Link from 'next/link'
import { Header, Footer } from '@/components'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-8xl font-bold text-brand-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-brand-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-brand-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary btn-lg">
              Go Home
            </Link>
            <Link href="/jobs" className="btn-outline btn-lg">
              Browse Jobs
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
