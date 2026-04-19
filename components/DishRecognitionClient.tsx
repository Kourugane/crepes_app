"use client"

import dynamic from "next/dynamic"

const DishRecognition = dynamic(
  () =>
    import("@/components/dish-recognition").then(
      (mod) => mod.DishRecognition
    ),
  { ssr: false }
)

export default function DishRecognitionClient() {
  return <DishRecognition />
}