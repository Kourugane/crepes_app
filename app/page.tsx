import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { FeaturedSection } from '@/components/featured-section'
import { CategorySection } from '@/components/category-section'
import { Chatbot } from '@/components/chatbot'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FeaturedSection />
        <CategorySection />
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
