import React, { createContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, updateUserProfile } from '../services/api/auth';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  plan: 'free' | 'premium';
  max_stores: number;
}

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear user data on sign out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
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
        setIsLoading(false);
        return;
      }

      try {
        // Create a basic profile from user metadata
        const basicProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: user.user_metadata.role || 'user',
          avatar_url: null,
          phone: null,
          plan: user.user_metadata.plan || 'free',
          max_stores: user.user_metadata.max_stores || 1
        };
        
        // Set admin status based on metadata
        const isAdminUser = user.user_metadata.role === 'admin';
        setIsAdmin(isAdminUser);
        setProfile(basicProfile);

        try {
          // Fetch profile from backend API
          const apiProfile = await fetchUserProfile();
          setProfile(apiProfile);
          setIsAdmin(apiProfile.role === 'admin');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.warn('Could not fetch profile from API, using basic profile:', error);
          // Fall back to Supabase direct query if API fails
          const { data, error: supabaseError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!supabaseError && data) {
            const userProfile: UserProfile = {
              id: data.id,
              full_name: data.full_name,
              email: user.email || '',
              role: data.role,
              avatar_url: data.avatar_url,
              phone: data.phone,
              plan: data.plan || 'free',
              max_stores: data.max_stores || 1
            };
            
            setProfile(userProfile);
            setIsAdmin(data.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Error in profile fetch process:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'user') => {
    try {
      // First, check if the user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast.error('An account with this email already exists');
        return { error: new Error('User already exists') as AuthError };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            created_at: new Date().toISOString()
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      if (data.user) {
        // Create profile immediately after signup
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
            created_at: new Date().toISOString(),
            plan: 'free',
            max_stores: 1
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Account created but profile setup failed');
        } else {
          toast.success('Registration successful! Please check your email to confirm your account.');
        }
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

      try {
        // Try to update profile through backend API first
        const apiProfile = await updateUserProfile(data);
        setProfile(prev => prev ? { ...prev, ...apiProfile } : apiProfile);
        setIsAdmin(apiProfile.role === 'admin');
        toast.success('Profile updated successfully');
        return { error: null };
      } catch (apiError) {
        console.warn('Could not update profile through API, falling back to direct update:', apiError);
        
        // Fall back to direct Supabase update if API fails
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
        
        // Try to update the profiles table
        if (data.full_name || data.role || data.avatar_url || data.phone) {
          const updates = {
            id: user.id,
            full_name: data.full_name || profile?.full_name || '',
            role: data.role || profile?.role || 'user',
            avatar_url: data.avatar_url,
            phone: data.phone,
            updated_at: new Date().toISOString()
          };

          const { error: dbError } = await supabase
            .from('profiles')
            .upsert(updates);

          if (dbError) {
            throw new Error('Could not update profile in database: ' + dbError.message);
          }
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
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};