import React, { createContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Import the Supabase client from lib
import { supabase } from '../lib/supabase';

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
        
        setIsAdmin(user.user_metadata.role === 'admin');
        setProfile(basicProfile);

        try {
          // Fetch profile directly from Supabase 'profiles' table
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          if (profileData) {
            setProfile({
              id: profileData.id,
              full_name: profileData.full_name,
              email: profileData.email || user.email || '',
              role: profileData.role,
              avatar_url: profileData.avatar_url,
              phone: profileData.phone,
              plan: profileData.plan || 'free',
              max_stores: profileData.max_stores || 1
            });
            setIsAdmin(profileData.role === 'admin');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // We'll still use the basic profile
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
        Alert.alert('Error', error.message);
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
          Alert.alert('Warning', 'Account created but profile setup failed');
        } else {
          Alert.alert('Success', 'Registration successful! Please check your email to confirm your account.');
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign up');
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign in');
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      Alert.alert('Error', 'An error occurred during sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Error', error.message);
        return { error };
      }

      Alert.alert('Success', 'Password reset instructions sent to your email');
      return { error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          role: data.role
        }
      });
      if (metadataError) {
        console.warn('Error updating user metadata:', metadataError);
      }

      // Update the profiles table
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
        throw new Error('Could not update profile in database');
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : updates as UserProfile);
      setIsAdmin(updates.role === 'admin');

      Alert.alert('Success', 'Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};