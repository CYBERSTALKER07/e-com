import { Database } from '../../types/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type NewProfile = Database['public']['Tables']['profiles']['Insert'];

// Fetch all profiles
export const getAllProfiles = async (): Promise<Profile[]> => {
  try {
    const response = await fetch(`${API_URL}/profiles`);
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

// Fetch a single profile by ID
export const getProfileById = async (id: string): Promise<Profile> => {
  try {
    const response = await fetch(`${API_URL}/profiles/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching profile ${id}:`, error);
    throw error;
  }
};

// Fetch profiles by role
export const getProfilesByRole = async (role: string): Promise<Profile[]> => {
  try {
    const response = await fetch(`${API_URL}/profiles/role/${role}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profiles by role');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching profiles with role ${role}:`, error);
    throw error;
  }
};

// Create a new profile
export const createProfile = async (profile: NewProfile): Promise<Profile> => {
  try {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Update an existing profile
export const updateProfile = async (id: string, profile: Partial<Profile>): Promise<Profile> => {
  try {
    const response = await fetch(`${API_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating profile ${id}:`, error);
    throw error;
  }
};