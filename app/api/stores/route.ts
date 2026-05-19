import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";

export async function GET() {
  try {
    // Inserts a new store
    const [newStore] = await db.insert(stores).values({
      id: `user_test_${Date.now()}`,
      name: "Tienda de Computación",
      email: `tienda-${Date.now()}@test.com`, 
      category: "Tecnología",
    }).returning();

    // 2. Inserts a new product associated with the newly created store
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