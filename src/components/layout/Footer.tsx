import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇮🇳</span>
              <span className="text-lg font-bold text-blue-800">JanDrishti <span className="text-orange-500">AI</span></span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              An AI-powered civic intelligence platform that transforms scattered community reports into prioritised, geographically actionable problems.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/explore" className="hover:text-blue-700 transition-colors">Explore Issues</Link></li>
              <li><Link href="/report" className="hover:text-blue-700 transition-colors">Report Problem</Link></li>
              <li><Link href="/about" className="hover:text-blue-700 transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/register" className="hover:text-blue-700 transition-colors">Register</Link></li>
              <li><Link href="/login" className="hover:text-blue-700 transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            © 2026 JanDrishti AI · For demonstration purposes only
          </p>
          <p className="text-xs text-slate-400">
            AI analysis is advisory. Authorities are responsible for final decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
