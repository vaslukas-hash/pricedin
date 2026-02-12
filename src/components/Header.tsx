'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center group-hover:bg-accent-600 transition-colors">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-brand-900 text-lg">
              Priced<span className="text-accent-500">In</span>
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/jobs"
              className="btn-accent btn-md"
            >
              Pricing Jobs
            </Link>
            <Link
              href="/post-job"
              className="btn-accent btn-md ml-2"
            >
              Post a Job
            </Link>
          </nav>
          
          {/* Mobile menu */}
          <div className="flex sm:hidden items-center gap-2">
            <Link 
              href="/jobs" 
              className="btn-ghost btn-sm"
            >
              Jobs
            </Link>
            <Link 
              href="/post-job" 
              className="btn-accent btn-sm"
            >
              Post
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
