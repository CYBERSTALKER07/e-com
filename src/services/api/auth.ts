import { apiClient } from './client';
import { UserProfile } from '../../context/AuthContext';

// Get the current user's profile from the backend API
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
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
  } catch (error) {
    console.error('Error fetching user profile from API:', error);
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