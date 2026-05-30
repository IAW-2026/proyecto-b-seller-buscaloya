/*This is the action that provides the functionality to update the store information,
which is exclusive for the store owner. */
"use server";

import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { storeSchema } from "@/lib/validations";

export async function updateStoreAction(formData: FormData, storeId: string) {
  const { userId } = await auth();

  if (!userId || userId !== storeId) {
    throw new Error("No tienes permiso para editar esta tienda");
  }

  try {
    // 1. Converts the FormData into a plain object and validates it using the storeSchema defined with Zod. 
    //This ensures that all required fields are present and have the correct format before updating the database. 
    //If the validation fails, an error will be thrown, which is caught in the catch block to provide feedback to the user.
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = storeSchema.parse(rawData);

    // 2. Updates the store information in the database
    await db
      .update(stores)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        category: validatedData.category,
        imageUrl: validatedData.imageUrl || "",
        address: validatedData.address,
        lat: validatedData.lat,
        lng: validatedData.lng,
      })
      .where(eq(stores.id, storeId));

    revalidatePath(`/stores/${storeId}`);
    revalidatePath(`/stores/${storeId}/edit`);
  } catch (error) {
    console.error("Error al actualizar la tienda:", error);
    throw new Error("No se pudo actualizar la tienda. Verifica los campos.");
  }
}