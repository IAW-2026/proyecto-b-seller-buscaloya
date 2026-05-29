/*This is the API route that gives the list of the stores when the buyer client requests it.
It queries the database for all the stores and returns them in a JSON format. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";

export async function GET() {
  try {
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