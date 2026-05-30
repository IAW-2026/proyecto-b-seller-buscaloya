/*This is the API route that gives the catalog of a specific store when the buyer client requests it.
It receives the store ID as a parameter, queries the database for the store's details and its products, 
and returns them in a JSON format according to the contract agreed upon with the frontend team. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  //1. Secure the route: only authenticated users can access it.
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    // 2. Look for the store with the given ID
    const storeData = await db.query.stores.findFirst({
      where: eq(stores.id, id),
    });

    if (!storeData) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    // 2. Get all products that belong to that store
    const storeProducts = await db
      .select()
      .from(products)
      .where(eq(products.storeId, id));

    // 3. Format the response data according to the contract
    const responseData = {
      store_name: storeData.name,
      store_image_url: storeData.imageUrl,
      products: storeProducts.map(p => ({
        product_id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        image_url: p.imageUrl
      }))
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}