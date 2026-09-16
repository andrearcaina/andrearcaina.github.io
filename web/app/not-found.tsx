import Link from 'next/link'
import { FiHome, FiCode } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
            <div className="relative flex items-center justify-center">
                <h1 className="text-8xl font-mono font-bold text-muted-foreground/20">404</h1>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Oops! Looks like we hit a bug 🐛</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                The page you&apos;re looking for seems to have gone missing. 
                Maybe it&apos;s taking a coffee break? ☕
                </p>
            </div>
        </div>

        <div className="flex gap-4">
            <Link 
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                <FiHome className="h-4 w-4" />
                Go Home
            </Link>
        
            <Link 
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors"
            >
                <FiCode className="h-4 w-4" />
                View Projects
            </Link>
        </div>

        <div className="text-xs text-muted-foreground">
        💡 Pro tip: Check the URL for typos, or maybe the page is still being compiled...
        </div>
    </div>
    )
}