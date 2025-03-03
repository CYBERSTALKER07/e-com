import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  phone?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsAdmin(false);
        return;
      }

      try {
        // Create a basic profile from user metadata
        const basicProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: user.user_metadata.role || 'user'
        };
        
        // Set admin status based on metadata
        const isAdminUser = 
          user.user_metadata.role === 'admin' || 
          user.user_metadata.is_admin === true;
        
        setIsAdmin(isAdminUser);
        
        // Try to get profile from database, but don't fail if it doesn't work
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && data) {
            const userProfile: UserProfile = {
              id: data.id,
              full_name: data.full_name,
              email: user.email || '',
              role: data.role,
              avatar_url: data.avatar_url,
              phone: data.phone
            };
            
            setProfile(userProfile);
            setIsAdmin(data.role === 'admin');
          } else {
            // Use the basic profile if we can't get the database profile
            setProfile(basicProfile);
          }
        } catch (dbError) {
          console.log('Using basic profile due to database error:', dbError);
          setProfile(basicProfile);
        }
      } catch (error) {
        console.error('Error in profile fetch process:', error);
        // Ensure we still have a basic profile even if there's an error
        const fallbackProfile: UserProfile = {
          id: user.id,
          full_name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user'
        };
        setProfile(fallbackProfile);
        setIsAdmin(false);
      }
    };

    fetchProfile();
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // For development purposes, auto-confirm the user
      if (data.user && !data.user.confirmed_at) {
        toast.success('Registration successful! In a production environment, you would need to confirm your email.');
      } else {
        toast.success('Registration successful!');
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      toast.error('An unexpected error occurred during sign up.');
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Signed in successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      toast.error('An unexpected error occurred during sign in.');
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('An error occurred during sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Password reset instructions sent to your email');
      return { error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      toast.error('An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Password updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Always update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          role: data.role
        }
      });

      if (metadataError) {
        console.warn('Error updating user metadata:', metadataError);
      }
      
      // Try to update the profiles table, but don't fail if it doesn't work
      try {
        const updates = {
          id: user.id,
          updated_at: new Date().toISOString(),
          ...data,
        };

        await supabase
          .from('profiles')
          .upsert(updates);
      } catch (dbError) {
        console.warn('Could not update profile in database:', dbError);
        // Continue anyway since we updated the metadata
      }
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      if (data.role === 'admin') {
        setIsAdmin(true);
      } else if (data.role === 'user') {
        setIsAdmin(false);
      }
      
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};