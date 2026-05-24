/*This is the action that provides the functionality to update the store information,
which is exclusive for the store owner. */
"use server";

import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateStoreAction(formData: FormData, storeId: string) {
  const { userId } = await auth();

  // Security check: Only the store owner can edit the store
  if (!userId || userId !== storeId) {
    throw new Error("No tienes permiso para editar esta tienda");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;

  await db
    .update(stores)
    .set({
      name,
      email,
      category,
      imageUrl,
    })
    .where(eq(stores.id, storeId));

  revalidatePath(`/stores/${storeId}`);
  revalidatePath(`/stores/${storeId}/edit`);
}