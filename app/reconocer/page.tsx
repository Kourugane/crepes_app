import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DishRecognition } from '@/components/dish-recognition'
import { Chatbot } from '@/components/chatbot'
import type { Metadata } from 'next'
import { supabase } from "@/lib/supabase/client"
import TestDBButton from "@/components/TestDBButton"

export const metadata: Metadata = {
  title: 'Reconocimiento de Platos | Crepes & Waffles',
  description: 'Sube una foto de un plato y descubre opciones similares en nuestro menú usando inteligencia artificial.',
}
const testDB = async () => {
  const { data, error } = await supabase.from("products").select("*")

  console.log("DATA:", data)
  console.log("ERROR:", error)
}

export default function RecognizePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Reconocimiento de Platos
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sube una foto de cualquier plato y nuestra inteligencia artificial 
                te mostrará opciones similares de nuestro menú
              </p>
            </div>
            
            <div className="mx-auto max-w-2xl">
              <DishRecognition />

<TestDBButton />
            </div>
                

            <div className="mt-12 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                ¿Cómo funciona?
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                    1
                  </div>
                  <h3 className="mb-1 font-medium text-foreground">Sube una foto</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrastra o selecciona una imagen de cualquier plato
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                    2
                  </div>
                  <h3 className="mb-1 font-medium text-foreground">Análisis IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestra IA identifica el plato y sus ingredientes
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                    3
                  </div>
                  <h3 className="mb-1 font-medium text-foreground">Descubre opciones</h3>
                  <p className="text-sm text-muted-foreground">
                    Te mostramos platos similares de nuestro menú
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  )
}
