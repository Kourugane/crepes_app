// Database types for Crepes & Waffles

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithCategory extends Product {
  category: Category | null
  customizations?: CustomizationWithOptions[]
}

export interface Customization {
  id: string
  product_id: string
  name: string
  created_at: string
}

export interface CustomizationOption {
  id: string
  customization_id: string
  name: string
  price: number
  created_at: string
}

export interface CustomizationWithOptions extends Customization {
  options: CustomizationOption[]
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: 'recibido' | 'preparacion' | 'en-camino' | 'entregado' | 'cancelado'
  total: number
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderWithDetails extends Order {
  customer: Customer | null
  items: OrderItem[]
  invoice?: Invoice | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  customizations: Record<string, string>
  total_price: number
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  subtotal: number
  tax: number
  total: number
  pdf_url: string | null
  created_at: string
}

export interface DishRecognitionLog {
  id: string
  image_url: string
  recognized_dishes: string[]
  confidence_scores: number[]
  user_feedback: string | null
  created_at: string
}

// API Request/Response types
export interface CreateOrderRequest {
  customer: {
    name: string
    email?: string
    phone: string
    address: string
  }
  items: {
    product_id: string
    product_name: string
    product_price: number
    quantity: number
    customizations: Record<string, string>
    total_price: number
  }[]
  total: number
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia'
  notes?: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  image?: string
  category_id?: string
  is_active?: boolean
  customizations?: {
    name: string
    options: { name: string; price: number }[]
  }[]
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  image?: string
  category_id?: string
  is_active?: boolean
}

export interface DishRecognitionRequest {
  image_url: string
}

export interface DishRecognitionResponse {
  dishes: {
    name: string
    confidence: number
    product?: ProductWithCategory
  }[]
}
