/*This is the API route that gives the list of the stores when the buyer client requests it.
It queries the database for all the stores and returns them in a JSON format. */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Importamos auth
import { db } from "@/db";
import { stores } from "@/db/schema";

export async function GET() {
  // 1. Access control: Verifies if the user is authenticated
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Logic to fetch all stores from the database
    const allStores = await db.select().from(stores);
    
    const formattedStores = allStores.map(store => ({
      store_id: store.id,
      name: store.name,
      email: store.email,
      category: store.category,
      image_url: store.imageUrl
    }));

    return NextResponse.json(formattedStores, { status: 200 });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}