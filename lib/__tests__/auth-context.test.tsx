import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

const TestComponent = () => {
  const { signIn, signUp, signOut, user } = useAuth();
  const handleSignIn = () => signIn('test@example.com', 'password');
  const handleSignUp = () => signUp('test@example.com', 'password');
  const handleSignOut = () => signOut();


  return (
    <div>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignOut}>Sign Out</button>
      {user && <div data-testid="user-email">{user.email}</div>}
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign in a user and update the user state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });

  it('should sign up a user and update the user state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } },
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });

  it('should sign out a user and clear the user state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } },
    });

    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
        expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
