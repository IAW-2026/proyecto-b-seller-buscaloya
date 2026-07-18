/*This is the action that deletes a store, which is exclusive for the admin role in the application. */
"use server";

import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteStoreAction(formData: FormData) {
  const { sessionClaims } = await auth();
  
  //Verifies that the user has the admin role, otherwise throw an error and prevent the action from executing.
  const metadata = sessionClaims?.metadata as { role?: string };
  const role = metadata?.role;

  if (role !== "system_admin" && role !== "admin") {
    throw new Error("No autorizado");
  }

  const storeId = formData.get("storeId") as string;
  if (!storeId) return;

  //Executes the deletion of the store and its associated products in the database
  //And then triggers a revalidation of the admin stores page to reflect the changes immediately.
  await db.delete(products).where(eq(products.storeId, storeId));
  await db.delete(stores).where(eq(stores.id, storeId));
  revalidatePath("/admin/stores");
}