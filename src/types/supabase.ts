export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          status: string
          total: number
          shipping_address: Json
          billing_address: Json
          payment_method: string
          items: Json
          estimated_delivery: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          status?: string
          total: number
          shipping_address: Json
          billing_address: Json
          payment_method: string
          items: Json
          estimated_delivery?: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          status?: string
          total?: number
          shipping_address?: Json
          billing_address?: Json
          payment_method?: string
          items?: Json
          estimated_delivery?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string | null
          role: string
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
          role?: string
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
          role?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          price: number
          description: string
          image: string
          category: string
          store_id: string
          stock_quantity: number
          is_visible: boolean
          sku: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          price: number
          description: string
          image: string
          category: string
          store_id: string
          stock_quantity: number
          is_visible: boolean
          sku?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          price?: number
          description?: string
          image?: string
          category?: string
          store_id?: string
          stock_quantity?: number
          is_visible?: boolean
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      stores: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          owner_id: string
          name: string
          description: string | null
          is_active: boolean
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id: string
          name: string
          description?: string | null
          is_active?: boolean
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}