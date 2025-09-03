'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex gap-8 md:gap-12">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PollPop</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/polls"
              className={`flex items-center text-lg font-medium transition-colors hover:text-purple-600 ${pathname === '/polls' ? 'text-purple-600' : 'text-foreground/60'}`}
            >
              Polls
            </Link>
            <Link
              href="/polls/create"
              className={`flex items-center text-lg font-medium transition-colors hover:text-purple-600 ${pathname === '/polls/create' ? 'text-purple-600' : 'text-foreground/60'}`}
            >
              Create
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" className="text-base hover:text-purple-600" onClick={handleSignOut}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-base hover:text-purple-600">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-purple-600 text-white hover:bg-purple-700">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}