'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, X, Loader2, Sparkles, ShoppingCart } from 'lucide-react'
import { useStore } from '@/context/store-context'
import { supabase } from '@/lib/supabase/client'

interface RecognitionResult {
  dish_name: string | null
  confidence?: number
  error?: string
}

// Producto tal como viene de Supabase
interface MatchedProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'desayunos' | 'postres' | 'platos-fuertes' | 'bebidas'
}

// Dataset de comparación (nombres deben coincidir con los de la DB)
const DATASET = [
  { name: 'Crepe de Nutella',      file: 'crepe-nutella.jpg' },
  { name: 'Crepe de Jamón y Queso',file: 'crepe-jamon-queso.jpg' },
  { name: 'Crepe de Pollo',        file: 'crepe-pollo.jpg' },
  { name: 'Lomo de Res',           file: 'lomo-res.jpg' },
  { name: 'Pechuga de Pollo',      file: 'pechuga-pollo.jpg' },
  { name: 'Salmón a la Parrilla',  file: 'salmon.jpg' },
  { name: 'Waffle Clásico',        file: 'waffle-clasico.jpg' },
  { name: 'Waffle con Helado',     file: 'waffle-helado.jpg' },
]

export function DishRecognition() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToCart, products: storeProducts } = useStore()

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setSelectedImage(e.target?.result as string)
      reader.readAsDataURL(file)
      setResult(null)
      setMatchedProducts([])
      setAddedIds(new Set())
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Comparar pixel a pixel (sin TensorFlow, igual que el original)
  const compareImages = (d1: Uint8ClampedArray, d2: Uint8ClampedArray) => {
    let diff = 0
    for (let i = 0; i < d1.length; i++) diff += Math.abs(d1[i] - d2[i])
    return diff
  }

  const getImageData = (img: HTMLImageElement): Uint8ClampedArray => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.drawImage(img, 0, 0, 100, 100)
    return ctx.getImageData(0, 0, 100, 100).data
  }

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`))
    })

  const analyzeImage = async () => {
    if (!selectedImage) return
    setIsAnalyzing(true)
    setResult(null)
    setMatchedProducts([])

    try {
      const userImg = await loadImage(selectedImage)
      const userData = getImageData(userImg)

      let bestMatch: string | null = null
      let lowestDiff = Infinity

      for (const item of DATASET) {
        try {
          const datasetImg = await loadImage(`/dataset/${item.file}`)
          const datasetData = getImageData(datasetImg)
          const diff = compareImages(userData, datasetData)
          if (diff < lowestDiff) {
            lowestDiff = diff
            bestMatch = item.name
          }
        } catch {
          // Si no carga una imagen del dataset, continuar
        }
      }

      const dishName = bestMatch || 'No reconocido'
      const confidence = bestMatch ? Math.max(0.3, 1 - lowestDiff / 10000000) : 0

      setResult({ dish_name: dishName, confidence })

      // Buscar el producto en Supabase por nombre (búsqueda parcial)
      if (bestMatch) {
        await findProductInDB(bestMatch)
      }
    } catch (err) {
      console.error('Error analizando imagen:', err)
      setResult({ dish_name: null, error: 'Error al analizar la imagen' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Buscar en Supabase el producto que coincida con el nombre reconocido
  const findProductInDB = async (dishName: string) => {
    try {
      // Primero intentar en el store (ya cargado)
      const localMatch = storeProducts.filter(p =>
        p.name.toLowerCase().includes(dishName.toLowerCase().split(' ')[0]) ||
        dishName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      )

      if (localMatch.length > 0) {
        setMatchedProducts(localMatch.slice(0, 3))
        return
      }

      // Si no está en el store, buscar directo en Supabase
      const words = dishName.toLowerCase().split(' ').filter(w => w.length > 3)
      const searchTerm = words[0] || dishName.split(' ')[0]

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(3)

      if (error) {
        console.error('Error buscando producto:', error)
        return
      }

      if (data && data.length > 0) {
        const categoryMap: Record<string, 'desayunos' | 'postres' | 'platos-fuertes' | 'bebidas'> = {
          'desayunos': 'desayunos',
          'postres': 'postres',
          'platos-fuertes': 'platos-fuertes',
          'bebidas': 'bebidas',
        }

        setMatchedProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          image: p.image || `/images/${p.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          category: categoryMap[p.category?.slug] || categoryMap[p.category?.name] || 'desayunos',
        })))
      }
    } catch (err) {
      console.error('Error buscando en DB:', err)
    }
  }

  const handleAddToCart = (product: MatchedProduct) => {
    addToCart(product, 1, {})
    setAddedIds(prev => new Set([...prev, product.id]))
  }

  const clearImage = () => {
    setSelectedImage(null)
    setResult(null)
    setMatchedProducts([])
    setAddedIds(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
          <Camera className="h-5 w-5 text-accent" />
          Reconocimiento de Platos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sube una foto de un plato y te ayudaremos a encontrar opciones similares en nuestro menú
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-accent hover:bg-secondary/50"
          >
            <div className="rounded-full bg-accent/10 p-4">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Arrastra una imagen aquí</p>
              <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Camera className="h-4 w-4" />
              Seleccionar Imagen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              <Image src={selectedImage} alt="Imagen seleccionada" fill className="object-contain" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analizando...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Analizar Imagen</>
                )}
              </Button>
              <Button variant="outline" onClick={clearImage}>Cambiar Imagen</Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
            {result.dish_name ? (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent/20 p-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {result.dish_name}
                  </h3>
                  {result.confidence && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confianza: {Math.round(result.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                {result.error || 'No se pudo identificar el plato'}
              </p>
            )}
          </div>
        )}

        {matchedProducts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-foreground">
              Platos similares en nuestro menú
            </h4>
            <div className="grid gap-3">
              {matchedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/producto/${product.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-accent font-semibold">{formatPrice(product.price)}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={addedIds.has(product.id)}
                    className={
                      addedIds.has(product.id)
                        ? "gap-1 bg-emerald-600 text-white cursor-default"
                        : "gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addedIds.has(product.id) ? 'Agregado' : 'Agregar'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
