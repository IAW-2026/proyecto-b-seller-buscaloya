import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";

export async function GET() {
  try {
    // 1. Insertar una tienda de prueba
    const [newStore] = await db.insert(stores).values({
      name: "Tienda de Computación",
      email: `tienda-${Date.now()}@test.com`, // Email único para evitar errores
      category: "Tecnología",
    }).returning();

    // 2. Insertar un producto asociado a esa tienda
    const [newProduct] = await db.insert(products).values({
      name: "Monitor Gamer 144hz",
      price: 250.99,
      stock: 5,
      storeId: newStore.id,
    }).returning();

    return NextResponse.json({
      message: "¡Datos cargados con éxito!",
      store: newStore,
      product: newProduct,
    });
  } catch (error) {
    console.error("Error cargando datos:", error);
    return NextResponse.json({ error: "Error al insertar datos" }, { status: 500 });
  }
}