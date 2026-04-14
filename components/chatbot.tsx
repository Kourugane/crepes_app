"use client"

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickReplies = [
  "¿Qué me recomiendas para desayunar?",
  "¿Cuáles son los postres más populares?",
  "¿Tienen opciones vegetarianas?",
  "¿Cuál es el horario de atención?",
]

const responses: { [key: string]: string } = {
  "desayuno": "¡Excelente elección para comenzar el día! Te recomiendo nuestro **Crepe de Jamón y Queso** con queso mozzarella derretido, o si prefieres algo más dulce, el **Waffle Clásico** con miel de maple y frutas frescas es perfecto. Ambos son favoritos de nuestros clientes.",
  "postre": "Nuestros postres más populares son el **Crepe de Nutella** con fresas frescas y crema chantilly, y el **Waffle con Helado** que viene con tres bolas de helado y salsa de chocolate. Si buscas algo más clásico, el **Tiramisú** es una delicia.",
  "vegetariano": "¡Por supuesto! Tenemos varias opciones vegetarianas. Te recomiendo el **Crepe de Champiñones** con salsa bechamel, nuestros **Waffles** que pueden ser dulces o salados, y todas nuestras ensaladas frescas. Solo indícale a tu mesero tus preferencias.",
  "horario": "Estamos abiertos de **Lunes a Viernes de 7:00 AM a 10:00 PM**, y los **Sábados y Domingos de 8:00 AM a 11:00 PM**. ¡Te esperamos!",
  "bebida": "Tenemos una gran variedad de bebidas. Te recomiendo nuestra **Limonada Natural** con hierbabuena y jengibre, nuestro **Café Americano** de origen colombiano, o los **Jugos Naturales** de frutas frescas de temporada.",
  "default": "¡Hola! Soy tu asistente de Crepes & Waffles. Estoy aquí para ayudarte a descubrir nuestros deliciosos platos. ¿Te gustaría que te recomiende algo para desayunar, un postre especial, o tienes alguna pregunta sobre nuestro menú?"
}

function getResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('desayun') || lowerMessage.includes('mañana')) {
    return responses['desayuno']
  }
  if (lowerMessage.includes('postre') || lowerMessage.includes('dulce') || lowerMessage.includes('popular')) {
    return responses['postre']
  }
  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegetal') || lowerMessage.includes('sin carne')) {
    return responses['vegetariano']
  }
  if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('atención') || lowerMessage.includes('abierto')) {
    return responses['horario']
  }
  if (lowerMessage.includes('bebida') || lowerMessage.includes('tomar') || lowerMessage.includes('jugo') || lowerMessage.includes('café')) {
    return responses['bebida']
  }
  
  return responses['default']
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Bienvenido a Crepes & Waffles. Soy tu asistente virtual y estoy aquí para ayudarte a descubrir nuestros deliciosos platos. ¿En qué puedo ayudarte hoy?'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getResponse(messageText)
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-primary text-primary-foreground rotate-0" 
            : "bg-accent text-accent-foreground hover:scale-110"
        )}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-card rounded-2xl shadow-2xl border border-border transition-all duration-300 overflow-hidden",
          isOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Asistente C&W</h3>
              <p className="text-xs text-primary-foreground/70">Siempre disponible</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                  __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }} />
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(reply)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 bg-secondary rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              size="icon"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => handleSend()}
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
