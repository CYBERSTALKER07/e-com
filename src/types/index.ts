export interface Store {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  owner_display_name: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  specifications: Record<string, string>;
  store_id: string;
  stock_quantity: number;
  is_visible: boolean;
  sku: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  paymentMethod: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  estimatedDelivery: string;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface BillingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface CreateStoreDTO {
  name: string;
  description?: string;
  is_active?: boolean;
  owner_display_name?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface UpdateStoreDTO extends Partial<CreateStoreDTO> {
  id: string;
}

export interface StoreMetrics {
  total_products: number;
  visible_products: number;
  total_stock: number;
  out_of_stock_products: number;
}