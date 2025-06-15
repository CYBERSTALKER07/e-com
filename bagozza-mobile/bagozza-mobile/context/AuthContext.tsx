import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../App';
import Toast from 'react-native-toast-message';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  plan?: string;
  max_stores?: number;
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
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
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
          plan: user.user_metadata.plan || 'free',
          max_stores: user.user_metadata.max_stores || 0
        };
        
        // Set admin status based on metadata
        const isAdminUser = user.user_metadata.role === 'admin';
        setIsAdmin(isAdminUser);
        setProfile(basicProfile);

        // Try to get profile from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          const userProfile: UserProfile = {
            id: data.id,
            full_name: data.full_name,
            email: user.email || '',
            role: data.role,
            avatar_url: data.avatar_url,
            phone: data.phone,
            plan: data.plan || 'free',
            max_stores: data.max_stores || 0
          };
          
          setProfile(userProfile);
          setIsAdmin(data.role === 'admin');
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
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An account with this email already exists'
        });
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
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message
        });
        return { error };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          Toast.show({
            type: 'error',
            text1: 'Warning',
            text2: 'Account created but profile setup failed'
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Registration successful! Please check your email to confirm your account.'
          });
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred during sign up.'
      });
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
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message
        });
        return { error };
      }

      // Fetch profile after successful sign in
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('Error fetching profile:', profileError);
        } else if (profile) {
          setProfile({
            id: profile.id,
            full_name: profile.full_name,
            email: data.user.email || '',
            role: profile.role,
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            plan: profile.plan || 'free',
            max_stores: profile.max_stores || 0
          });
          setIsAdmin(profile.role === 'admin');
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Signed in successfully!'
      });
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred during sign in.'
      });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Signed out successfully'
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred during sign out'
      });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'You must be logged in to update your profile'
        });
        return { error: new Error('Not authenticated') };
      }

      const updates = {
        id: user.id,
        updated_at: new Date().toISOString(),
        ...data
      };

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (dbError) {
        console.warn('Could not update profile in database:', dbError);
        return { error: dbError };
      }
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      if (data.role === 'admin') {
        setIsAdmin(true);
      } else if (data.role === 'user') {
        setIsAdmin(false);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully'
      });
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error updating profile'
      });
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
      updateProfile,
    }}>
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