"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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
  items: CartItem[]
  customer: CustomerInfo
  status: 'recibido' | 'preparacion' | 'en-camino' | 'entregado'
  total: number
  createdAt: Date
  paymentMethod: string
}

export interface CustomerInfo {
  name: string
  address: string
  phone: string
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia'
}

interface StoreContextType {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, customizations: { [key: string]: string }) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  
  // Orders
  orders: Order[]
  currentOrder: Order | null
  createOrder: (customer: CustomerInfo) => Order
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  
  // Products
  products: Product[]
  
  // Admin
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

// Sample Products
const initialProducts: Product[] = [
  // Desayunos
  {
    id: '1',
    name: 'Crepe de Jamón y Queso',
    description: 'Delicioso crepe relleno de jamón ahumado y queso derretido, acompañado de ensalada fresca',
    price: 28000,
    image: '/images/crepe-jamon-queso.jpg',
    category: 'desayunos',
    customizations: [
      { id: 'queso', name: 'Tipo de Queso', options: [
        { id: 'mozzarella', name: 'Mozzarella', price: 0 },
        { id: 'cheddar', name: 'Cheddar', price: 2000 },
        { id: 'gouda', name: 'Gouda', price: 3000 }
      ]}
    ]
  },
  {
    id: '2',
    name: 'Waffle Clásico',
    description: 'Waffle belga tradicional con mantequilla y miel de maple, servido con frutas frescas',
    price: 24000,
    image: '/images/waffle-clasico.jpg',
    category: 'desayunos'
  },
  {
    id: '3',
    name: 'Crepe de Pollo',
    description: 'Crepe relleno de pollo desmenuzado con champiñones en salsa bechamel',
    price: 32000,
    image: '/images/crepe-pollo.jpg',
    category: 'desayunos'
  },
  // Postres
  {
    id: '4',
    name: 'Crepe de Nutella',
    description: 'Crepe con generosa porción de Nutella, fresas frescas y crema chantilly',
    price: 22000,
    image: '/images/crepe-nutella.jpg',
    category: 'postres',
    customizations: [
      { id: 'topping', name: 'Topping Extra', options: [
        { id: 'ninguno', name: 'Sin topping extra', price: 0 },
        { id: 'helado', name: 'Helado de Vainilla', price: 5000 },
        { id: 'banana', name: 'Banano', price: 3000 }
      ]}
    ]
  },
  {
    id: '5',
    name: 'Waffle con Helado',
    description: 'Waffle tibio con tres bolas de helado, salsa de chocolate y nueces caramelizadas',
    price: 28000,
    image: '/images/waffle-helado.jpg',
    category: 'postres'
  },
  {
    id: '6',
    name: 'Tiramisú',
    description: 'Clásico tiramisú italiano con café espresso y cacao',
    price: 18000,
    image: '/images/tiramisu.jpg',
    category: 'postres'
  },
  // Platos Fuertes
  {
    id: '7',
    name: 'Salmón a la Parrilla',
    description: 'Filete de salmón atlántico a la parrilla con vegetales grillados y arroz jazmín',
    price: 52000,
    image: '/images/salmon.jpg',
    category: 'platos-fuertes',
    customizations: [
      { id: 'coccion', name: 'Punto de Cocción', options: [
        { id: 'medio', name: 'Término Medio', price: 0 },
        { id: 'bien', name: 'Bien Cocido', price: 0 }
      ]}
    ]
  },
  {
    id: '8',
    name: 'Lomo de Res',
    description: 'Medallón de lomo de res en salsa de champiñones, puré de papa y espárragos',
    price: 58000,
    image: '/images/lomo-res.jpg',
    category: 'platos-fuertes'
  },
  {
    id: '9',
    name: 'Pechuga de Pollo',
    description: 'Pechuga de pollo rellena de espinacas y queso, con salsa de albahaca',
    price: 42000,
    image: '/images/pechuga-pollo.jpg',
    category: 'platos-fuertes'
  },
  // Bebidas
  {
    id: '10',
    name: 'Limonada Natural',
    description: 'Limonada refrescante con hierbabuena y un toque de jengibre',
    price: 12000,
    image: '/images/limonada.jpg',
    category: 'bebidas'
  },
  {
    id: '11',
    name: 'Café Americano',
    description: 'Café premium colombiano de origen único',
    price: 8000,
    image: '/images/cafe.jpg',
    category: 'bebidas'
  },
  {
    id: '12',
    name: 'Jugo Natural',
    description: 'Jugo de frutas frescas de temporada',
    price: 14000,
    image: '/images/jugo.jpg',
    category: 'bebidas',
    customizations: [
      { id: 'fruta', name: 'Fruta', options: [
        { id: 'naranja', name: 'Naranja', price: 0 },
        { id: 'mango', name: 'Mango', price: 2000 },
        { id: 'maracuya', name: 'Maracuyá', price: 2000 }
      ]}
    ]
  }
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>(initialProducts)

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
      totalPrice
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

  const createOrder = useCallback((customer: CustomerInfo): Order => {
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: [...cart],
      customer,
      status: 'recibido',
      total: cartTotal,
      createdAt: new Date(),
      paymentMethod: customer.paymentMethod
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

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    }
    setProducts(prev => [...prev, newProduct])
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProduct = useCallback((id: string) => {
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
      addProduct,
      updateProduct,
      deleteProduct
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
