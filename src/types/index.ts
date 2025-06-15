export interface Store {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
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

export type PaymentMethod = 'click' | 'credit-card' | 'cash';

export interface PaymentDetails {
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentId?: string;
}

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
  payment?: PaymentDetails;
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
  description?: string | null;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
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