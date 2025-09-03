import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PollPop</span>
            </Link>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Create and share polls with ease. Get instant feedback from your audience.
            </p>
          </div>
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/polls" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Browse Polls
                </Link>
              </li>
              <li>
                <Link href="/polls/create" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Create Poll
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-gray-900">Account</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} PollPop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}