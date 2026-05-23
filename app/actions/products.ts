"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Action 1: Guardar o Actualizar un Producto
export async function saveProductAction(formData: FormData, storeId: string, productId?: string) {
  const { userId } = await auth();
  
  // Seguridad: El que edita/crea debe ser el dueño de la tienda (o podés validar claims si sos admin)
  if (!userId || userId !== storeId) {
    throw new Error("No autorizado para modificar este catálogo");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const imageUrl = formData.get("imageUrl") as string || null;

  if (productId) {
    // Si pasamos un ID, es una EDICIÓN
    await db
      .update(products)
      .set({ name, description, price, stock, imageUrl })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));
  } else {
    // Si no hay ID, es una CREACIÓN
    await db.insert(products).values({
      storeId,
      name,
      description,
      price,
      stock,
      imageUrl,
    });
  }

  // Refrescamos la caché del servidor instantáneamente para que impacte en la UI
  revalidatePath(`/stores/${storeId}`);
}

// Action 2: Eliminar un Producto
export async function deleteProductAction(productId: string, storeId: string) {
  const { userId } = await auth();
  
  if (!userId || userId !== storeId) {
    throw new Error("No autorizado");
  }

  await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

  revalidatePath(`/stores/${storeId}`);
}