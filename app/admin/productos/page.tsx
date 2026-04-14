"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useStore, type Product } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'desayunos', name: 'Desayunos' },
  { id: 'postres', name: 'Postres' },
  { id: 'platos-fuertes', name: 'Platos Fuertes' },
  { id: 'bebidas', name: 'Bebidas' },
]

type ProductForm = Omit<Product, 'id' | 'customizations'>

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  image: '/images/placeholder.jpg',
  category: 'desayunos',
}

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductForm>(emptyForm)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const categoryLabels: Record<string, string> = {
    'desayunos': 'Desayuno',
    'postres': 'Postre',
    'platos-fuertes': 'Plato Fuerte',
    'bebidas': 'Bebida',
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingProduct) {
      updateProduct(editingProduct.id, formData)
    } else {
      addProduct(formData)
    }
    
    setIsModalOpen(false)
    setFormData(emptyForm)
    setEditingProduct(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">Gestiona el catálogo de productos</p>
        </div>
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Catálogo ({products.length} productos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Producto</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Categoría</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Precio</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {categoryLabels[product.category]}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-foreground">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Precio (COP)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoría
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id as Product['category'] }))}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-all",
                        formData.category === cat.id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="/images/producto.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
