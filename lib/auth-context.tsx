'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Describes the shape of the authentication context, including the user,
 * loading state, and authentication methods.
 */
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The AuthProvider component manages the authentication state of the application.
 * It fetches the current user session, listens for authentication state changes,
 * and provides the authentication context to its children.
 * This ensures that components throughout the app can access user data and auth methods.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On initial load, check for an active Supabase session.
    // This handles cases where the user is already logged in from a previous visit.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up a listener for real-time authentication state changes.
    // This updates the UI instantly when a user signs in or out in another tab.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup: Unsubscribe from the auth state listener when the component unmounts
    // to prevent memory leaks.
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs in a user with their email and password using Supabase Auth.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<{ error: Error | null; success: boolean; }>} An object indicating success or failure.
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error.message);
      }

      return { error, success: !error };
    } catch (error) {
      console.error('Unexpected error during sign-in:', error);
      const errorMessage =
        error instanceof Error ? error : new Error(String(error));
      return { error: errorMessage, success: false };
    }
  };

  /**
   * Registers a new user with an email and password using Supabase Auth.
   * @param {string} email - The new user's email address.
   * @param {string} password - The new user's chosen password.
   * @returns {Promise<{ error: Error | null; success: boolean; }>} An object indicating success or failure.
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign-up error:', error.message);
      }

      return { error, success: !error };
    } catch (error) {
      console.error('Unexpected error during sign-up:', error);
      const errorMessage =
        error instanceof Error ? error : new Error(String(error));
      return { error: errorMessage, success: false };
    }
  };

  /**
   * Signs out the currently authenticated user.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * A custom hook to easily access the authentication context.
 * This simplifies the process of getting user data and auth methods in components.
 * It also ensures the hook is used within an AuthProvider, preventing common errors.
 * @returns {AuthContextType} The authentication context.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}