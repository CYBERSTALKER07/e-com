import { apiClient } from './client';
import { UserProfile } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Get the current user's profile from the backend API
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    try {
      // First try to get profile from API
      const profile = await apiClient.get<any>('/auth/me');
      
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email || '',
        role: profile.role,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        plan: profile.plan || 'free',
        max_stores: profile.max_stores || 1
      };
    } catch (apiError) {
      console.log('API server not available, falling back to Supabase direct query');
      
      // Fall back to Supabase if API fails
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No authenticated user');
      }
      
      // Get user profile from Supabase directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows
        
      if (error) {
        console.error('Supabase profile query error:', error);
        throw error;
      }
      
      // If no profile exists, create one
      if (!data) {
        console.log('No profile found, creating one...');
        const newProfile = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          avatar_url: null,
          phone: null,
          plan: 'free',
          max_stores: 1,
          created_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          // Return basic profile even if creation fails
          return {
            id: session.user.id,
            full_name: newProfile.full_name,
            email: newProfile.email,
            role: newProfile.role,
            avatar_url: null,
            phone: null,
            plan: 'free',
            max_stores: 1
          };
        }
        
        return {
          id: createdProfile.id,
          full_name: createdProfile.full_name,
          email: session.user.email || '',
          role: createdProfile.role || 'user',
          avatar_url: createdProfile.avatar_url,
          phone: createdProfile.phone,
          plan: createdProfile.plan || 'free',
          max_stores: createdProfile.max_stores || 1
        };
      }
      
      return {
        id: data.id,
        full_name: data.full_name,
        email: session.user.email || '',
        role: data.role || 'user',
        avatar_url: data.avatar_url,
        phone: data.phone,
        plan: data.plan || 'free',
        max_stores: data.max_stores || 1
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update the current user's profile using the backend API
export const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    return await apiClient.put<UserProfile>('/auth/me', data);
  } catch (error) {
    console.error('Error updating profile via API:', error);
    throw error;
  }
};

// Change the current user's password through the backend API
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    await apiClient.post('/auth/change-password', { new_password: newPassword });
  } catch (error) {
    console.error('Error changing password via API:', error);
    throw error;
  }
};

// Admin: Get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const profiles = await apiClient.get<any[]>('/auth/users');
    
    return profiles.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email || '',
      role: profile.role,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      plan: profile.plan || 'free',
      max_stores: profile.max_stores || 1
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Admin: Update a user's role
export const updateUserRole = async (userId: string, role: string): Promise<UserProfile> => {
  try {
    return await apiClient.put<UserProfile>(`/auth/users/${userId}/role`, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};