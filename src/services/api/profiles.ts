import { Database } from '../../types/supabase';
import { supabase } from './index';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type NewProfile = Database['public']['Tables']['profiles']['Insert'];

// Fetch all profiles
export const getAllProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

// Fetch a single profile by ID
export const getProfileById = async (id: string): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching profile ${id}:`, error);
    throw error;
  }
};

// Fetch profiles by role
export const getProfilesByRole = async (role: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching profiles with role ${role}:`, error);
    throw error;
  }
};

// Create a new profile
export const createProfile = async (profile: NewProfile): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Update an existing profile
export const updateProfile = async (id: string, profile: Partial<Profile>): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating profile ${id}:`, error);
    throw error;
  }
};