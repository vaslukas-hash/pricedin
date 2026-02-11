import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-800 text-brand-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-white text-lg">
                Priced<span className="text-accent-400">In</span>
              </span>
            </Link>
            <p className="text-brand-300 text-sm leading-relaxed max-w-sm">
              The niche job board for pricing, monetization, revenue strategy, and commercial strategy professionals.
            </p>
          </div>
          
          {/* For Candidates */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Candidates</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Pricing" className="hover:text-white transition-colors">
                  Pricing Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Monetization" className="hover:text-white transition-colors">
                  Monetization Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Revenue+Strategy" className="hover:text-white transition-colors">
                  Revenue Strategy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="hover:text-white transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <span className="text-brand-400">Pricing: Free (beta)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-brand-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-brand-400 text-sm">
            © {new Date().getFullYear()} PricedIn. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
