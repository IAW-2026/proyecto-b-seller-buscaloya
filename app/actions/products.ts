/*This file contains the server actions related to product management, including creating, updating and deleting products.
These actions are protected to ensure that only authorized users (store owners or admins) can perform these operations.*/
"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createProductAction(formData: FormData, storeId: string) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";

  if (!userId) throw new Error("No estás autenticado");

  // Validamos que sea el dueño o un admin
  if (userId !== storeId && !isAdmin) {
    throw new Error("No tienes permiso para agregar productos a esta tienda");
  }

  // Extraemos los datos del formulario
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  // Convertimos precio y stock a números
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const imageUrl = formData.get("imageUrl") as string;

  try {
    await db.insert(products).values({
      storeId,
      name,
      description,
      price,
      stock,
      imageUrl,
    });

    // Refrescamos la página de la tienda para que aparezca el nuevo producto
    revalidatePath(`/stores/${storeId}`);
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw new Error("No se pudo crear el producto");
  }
}

export async function deleteProductAction(productId: string, storeId: string) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";

  if (!userId || (userId !== storeId && !isAdmin)) {
    throw new Error("No tienes permiso");
  }

  try {
    await db.delete(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));
    revalidatePath(`/stores/${storeId}`);
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw new Error("No se pudo eliminar");
  }
}

export async function updateProductAction(formData: FormData, productId: string, storeId: string) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";

  if (!userId || (userId !== storeId && !isAdmin)) {
    throw new Error("No tienes permiso");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const imageUrl = formData.get("imageUrl") as string;

  try {
    await db.update(products)
      .set({ name, description, price, stock, imageUrl })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    revalidatePath(`/stores/${storeId}`);
    revalidatePath(`/stores/${storeId}/products/${productId}/edit`);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    throw new Error("No se pudo actualizar");
  }
}