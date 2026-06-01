/*This file contains the server actions related to product management, including creating, updating and deleting products.
These actions are protected to ensure that only authorized users (store owners or admins) can perform these operations.*/
"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { productSchema } from "@/lib/validations";

export async function createProductAction(prevState: any, formData: FormData) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";

  // Extracts the storeId  from the form data to verify permissions and identify which store the product belongs to.
  const storeId = formData.get("storeId") as string;

  if (!userId) return { success: false, error: "No estás autenticado" };

  if (userId !== storeId && !isAdmin) {
    return { success: false, error: "No tienes permiso para agregar productos a esta tienda" };
  }

  // Validation
  const rawData = Object.fromEntries(formData.entries());
  const validation = productSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors)[0]?.[0];
    return { success: false, error: firstErrorMessage ||"Datos inválidos, revisa los campos." };
  }

  try {
    await db.insert(products).values({
      storeId,
      name: validation.data.name,
      description: validation.data.description || "",
      price: validation.data.price,
      stock: validation.data.stock,
      imageUrl: validation.data.imageUrl || "",
    });

    revalidatePath(`/stores/${storeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { success: false, error: "No se pudo crear el producto en la base de datos." };
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

export async function updateProductAction(prevState: any, formData: FormData) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";

  // Extracts the productId and storeId from the form data to verify permissions and identify which product to update.
  const productId = formData.get("productId") as string;
  const storeId = formData.get("storeId") as string;

  if (!userId || (userId !== storeId && !isAdmin)) {
    return { success: false, error: "No tienes permiso" };
  }

  // Validation
  const rawData = Object.fromEntries(formData.entries());
  const validation = productSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors)[0]?.[0];
    return { success: false, error: firstErrorMessage ||"Datos inválidos, revisa los campos." };
  }

  try {
    await db.update(products)
      .set({
        name: validation.data.name,
        description: validation.data.description,
        price: validation.data.price,
        stock: validation.data.stock,
        imageUrl: validation.data.imageUrl
      })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    revalidatePath(`/stores/${storeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return { success: false, error: "Ocurrió un error inesperado al actualizar." };
  }
}