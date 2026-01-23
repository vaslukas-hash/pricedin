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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
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
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === '/jobs' 
                  ? "bg-brand-100 text-brand-900" 
                  : "text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              )}
            >
              Browse Jobs
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
