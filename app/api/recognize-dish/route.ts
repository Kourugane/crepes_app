

let model

export async function POST(req) {
  
  try {
    const formData = await req.formData()
    const file = formData.get("image")

    if (!file) {
      return Response.json({ error: "No se envió imagen" }, { status: 400 })
    }

    // 🔥 Simulación por ahora
    const dishes = [
      "Crepe de Nutella",
      "Waffle de Fresa",
      "Desayuno Americano",
    ]

    const randomDish = dishes[Math.floor(Math.random() * dishes.length)]

    return Response.json({
      recognition: {
        dish_name: randomDish,
        confidence: 0.9,
      },
      matched_products: [],
    })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Error interno" }, { status: 500 })
  }
}