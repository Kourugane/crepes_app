"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'desayunos' | 'postres' | 'platos-fuertes' | 'bebidas'
  customizations?: Customization[]
}

export interface Customization {
  id: string
  name: string
  options: { id: string; name: string; price: number }[]
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedCustomizations: { [key: string]: string }
  totalPrice: number
}

export interface Order {
  id: string
  order_number: string
  items: CartItem[]
  customer: CustomerInfo
  status: 'recibido' | 'preparacion' | 'en-camino' | 'entregado'
  subtotal: number
  tax: number
  total: number
  createdAt: Date
  paymentMethod: string
  invoice_number?: string
}

export interface CustomerInfo {
  name: string
  email?: string
  address: string
  phone: string
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia'
}

const CATEGORY_SLUG_MAP: Record<string, Product['category']> = {
  'desayunos': 'desayunos',
  'postres': 'postres',
  'platos-fuertes': 'platos-fuertes',
  'bebidas': 'bebidas',
  'Desayunos': 'desayunos',
  'Postres': 'postres',
  'Platos Fuertes': 'platos-fuertes',
  'Bebidas': 'bebidas',
}

interface StoreContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, customizations: { [key: string]: string }) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  orders: Order[]
  currentOrder: Order | null
  createOrder: (customer: CustomerInfo) => Promise<Order>
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  products: Product[]
  productsLoading: boolean
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

function mapSupabaseProduct(p: any): Product {
  const categorySlug =
    CATEGORY_SLUG_MAP[p.category?.slug] ||
    CATEGORY_SLUG_MAP[p.category?.name] ||
    'desayunos'

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: p.price,
    image: p.image || `/images/${p.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    category: categorySlug,
    customizations: p.customizations?.map((c: any) => ({
      id: c.id,
      name: c.name,
      options: (c.options || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        price: o.price_modifier ?? o.price ?? 0,
      })),
    })),
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  // Cargar productos desde Supabase al iniciar
  useEffect(() => {
  async function fetchProducts() {
    setProductsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error cargando productos:', JSON.stringify(error, null, 2))
        return
      }

      console.log('Productos encontrados:', data?.length)
      if (data && data.length > 0) {
        setProducts(data.map(mapSupabaseProduct))
      }
    } catch (err) {
      console.error('Error inesperado:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  fetchProducts()
}, [])

  const addToCart = useCallback((product: Product, quantity: number, customizations: { [key: string]: string }) => {
    const customizationPrice = Object.entries(customizations).reduce((total, [customId, optionId]) => {
      const custom = product.customizations?.find(c => c.id === customId)
      const option = custom?.options.find(o => o.id === optionId)
      return total + (option?.price || 0)
    }, 0)

    const totalPrice = (product.price + customizationPrice) * quantity

    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity,
      selectedCustomizations: customizations,
      totalPrice,
    }

    setCart(prev => [...prev, newItem])
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const unitPrice = item.totalPrice / item.quantity
        return { ...item, quantity, totalPrice: unitPrice * quantity }
      }
      return item
    }))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  // Crear orden real en Supabase
  const createOrder = useCallback(async (customer: CustomerInfo): Promise<Order> => {
    const subtotal = cartTotal
    const tax = Math.round(subtotal * 0.19)
    const total = subtotal + tax

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address,
        },
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
          customizations: item.selectedCustomizations,
          total_price: item.totalPrice,
        })),
        subtotal,
        tax,
        total,
        payment_method: customer.paymentMethod,
        delivery_address: customer.address,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Error al crear el pedido')
    }

    const data = await response.json()
    const dbOrder = data.order

    const order: Order = {
      id: dbOrder.id,
      order_number: dbOrder.order_number,
      items: [...cart],
      customer,
      status: 'recibido',
      subtotal,
      tax,
      total,
      createdAt: new Date(dbOrder.created_at),
      paymentMethod: customer.paymentMethod,
      invoice_number: data.invoice?.invoice_number,
    }

    setOrders(prev => [...prev, order])
    setCurrentOrder(order)
    setCart([])

    return order
  }, [cart, cartTotal])

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ))
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null)
    }
  }, [currentOrder])

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image,
        category_slug: product.category,
        is_active: true,
      }),
    })
    if (!response.ok) throw new Error('Error al crear producto')
    const data = await response.json()
    setProducts(prev => [...prev, mapSupabaseProduct(data.product)])
  }, [])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image_url: updates.image,
        category_slug: updates.category,
        is_active: true,
      }),
    })
    if (!response.ok) throw new Error('Error al actualizar producto')
    const data = await response.json()
    setProducts(prev => prev.map(p => p.id === id ? mapSupabaseProduct(data.product) : p))
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al eliminar producto')
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <StoreContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      orders,
      currentOrder,
      createOrder,
      updateOrderStatus,
      products,
      productsLoading,
      addProduct,
      updateProduct,
      deleteProduct,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
