'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, X, Loader2, Sparkles, ShoppingCart } from 'lucide-react'
import { useStore } from '@/context/store-context'
import * as mobilenet from "@tensorflow-models/mobilenet"
import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import { supabase } from "@/lib/supabase/client"

  let model: any = null

async function loadModel() {
  if (!model) {
    await tf.setBackend("webgl")   // 👈 CLAVE
    await tf.ready()

    model = await mobilenet.load()
  }
  return model
}

interface RecognitionResult {
  dish_name: string | null
  description?: string
  ingredients?: string[]
  category?: string
  confidence?: number
  similar_dishes?: string[]
  error?: string
}

interface MatchedProduct {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: {
    name: string
    slug: string
  }
}

export function DishRecognition() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToCart } = useStore()

  const testDB = async () => {
  const { data, error } = await supabase.from("products").select("*")

  console.log("DATA:", data)
  console.log("ERROR:", error)
}
  

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null)
      setMatchedProducts([])
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const analyzeImage = async () => {
  if (!selectedImage) return

  setIsAnalyzing(true)

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve) => {
      const img = document.createElement("img")
      img.src = src
      img.onload = () => resolve(img)
    })

  const getImageData = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    canvas.width = 100
    canvas.height = 100

    ctx.drawImage(img, 0, 0, 100, 100)

    return ctx.getImageData(0, 0, 100, 100).data
  }

  const compareImages = (
    data1: Uint8ClampedArray,
    data2: Uint8ClampedArray
  ) => {
    let diff = 0
    for (let i = 0; i < data1.length; i++) {
      diff += Math.abs(data1[i] - data2[i])
    }
    return diff
  }

  const dataset = [
    { name: "Crepe de Nutella", file: "crepe-nutella.jpg" },
    { name: "Crepe de Jamon y Queso", file: "crepe-jamon-queso.jpg" },
    { name: "Crepe de Pollo", file: "crepe-pollo.jpg" },
    { name: "Lomo de Res", file: "lomo-res.jpg" },
    { name: "Pechuga de Pollo", file: "pechuga-pollo.jpg" },
    { name: "Salmon", file: "salmon.jpg" },
    { name: "Waffle Clasico", file: "waffle-clasico.jpg" },
    { name: "Waffle de Helado", file: "waffle-helado.jpg" },
  ]

  const userImg = await loadImage(selectedImage)
  const userData = getImageData(userImg)

  let bestMatch: string | null = null
  let lowestDiff = Infinity

  for (let item of dataset) {
    const datasetImg = await loadImage(`/dataset/${item.file}`)
    const datasetData = getImageData(datasetImg)

    const diff = compareImages(userData, datasetData)

    if (diff < lowestDiff) {
      lowestDiff = diff
      bestMatch = item.name
    }
  }

  setResult({
    dish_name: bestMatch || "No reconocido",
    confidence: 1 - lowestDiff / 10000000,
  })

  setIsAnalyzing(false)
}

  const clearImage = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setResult(null)
    setMatchedProducts([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddToCart = (product: MatchedProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
    })
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
              <p className="font-medium text-foreground">
                Arrastra una imagen aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar
              </p>
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
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Seleccionar Imagen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              <Image
                src={selectedImage}
                alt="Imagen seleccionada"
                fill
                className="object-contain"
              />
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
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analizar Imagen
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearImage}>
                Cambiar Imagen
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
            {result.dish_name ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-accent/20 p-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {result.dish_name}
                    </h3>
                    {result.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.description}
                      </p>
                    )}
                    {result.confidence && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Confianza: {Math.round(result.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </div>

                {result.ingredients && result.ingredients.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Ingredientes detectados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.ingredients.map((ingredient, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
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
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/producto/${product.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-accent font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar
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
