"use client"

import { supabase } from "@/lib/supabase/client"

export default function TestDBButton() {

  const crearPedido = async () => {

    // 1. Crear cliente
    const { data: customer, error: errorCustomer } = await supabase
      .from("customers")
      .insert([
        {
          name: "Juan Perez",
          phone: "3001234567",
          address: "Bogotá"
        }
      ])
      .select()
      .single()

    console.log("CLIENTE:", customer, errorCustomer)

    // 2. Crear orden
    const { data: order, error: errorOrder } = await supabase
      .from("orders")
      .insert([
        {
          order_number: "0001",
          customer_id: customer?.id,
          status: "recibido",
          total: 20000,
          payment_method: "efectivo"
        }
      ])
      .select()
      .single()

    console.log("ORDEN:", order, errorOrder)

    // 3. Items
    const { error: errorItems } = await supabase
      .from("order_items")
      .insert([
        {
          order_id: order?.id,
          product_name: "Waffle Clasico",
          product_price: 15000,
          quantity: 1,
          total_price: 15000,
          customizations: {}
        }
      ])

    console.log("ITEMS:", errorItems)

    console.log("✅ PEDIDO COMPLETO GUARDADO")
  }

  return (
    <button
      onClick={crearPedido}
      style={{
        padding: "10px 20px",
        backgroundColor: "green",
        color: "white",
        cursor: "pointer"
      }}
    >
      Crear pedido de prueba
    </button>
  )
}