/* This file defines the API route for dispatching a package to the Delivery App.
(Is the another way to call the Delivery App if the POST /seller/orders failed to call it)
It receives the package ID as a path parameter, retrieves the package and
store information from the database, formats the data according to the contract 
expected by the Delivery App,  updates the package status in the database, and 
returns a response to the frontend. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ packageId: string }> }
) {
  // 1. Checks if the user (Seller) is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packageId } = await params;

    // 2. Looks up the package and related store info in the database
    const pkg = await db.query.packages.findFirst({
      where: eq(packages.id, packageId),
      with: { store: true }
    });

    if (!pkg) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
    }

    if (pkg.status !== "PREPARING") {
      return NextResponse.json({ error: "El paquete no está en preparación." }, { status: 400 });
    }

    // 3. Parses buyer address and extracts coordinates
    let formattedBuyerAddress = pkg.buyerAddress;
    let bX = 5000; // Valor por defecto seguro para el Zod de Delivery
    let bY = 5000;

    try {
      const addr = JSON.parse(pkg.buyerAddress);
      formattedBuyerAddress = `${addr.street}, ${addr.city}`;
      bX = addr.lat || 5000;
      bY = addr.lng || 5000;
    } catch { }

    // 4. Builds the payload for the Delivery App matching the new flat contract
    const deliveryPayload = {
      order_id: pkg.id,
      seller_id: pkg.storeId,
      seller_name: pkg.store?.name || "Sin nombre",
      seller_address: pkg.store?.address || "Sin dirección",
      seller_x: pkg.store?.lat ?? 5000,
      seller_y: pkg.store?.lng ?? 5000,
      buyer_id: pkg.buyerId,
      buyer_name: pkg.buyerName,
      buyer_phone: pkg.buyerPhone,
      buyer_address: formattedBuyerAddress,
      buyer_x: bX,
      buyer_y: bY
    };

    // 5. Calls the REAL Delivery App
    const deliveryUrl = `${process.env.DELIVERY_APP_URL}/api/delivery-requests`;
    const deliveryResponse = await fetch(deliveryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DELIVERY_API_KEY}`
      },
      body: JSON.stringify(deliveryPayload)
    });

    if (!deliveryResponse.ok) {
      const errorText = await deliveryResponse.text();
      throw new Error(`Error en Delivery App (Asignar Repartidor): ${errorText}`);
    }

    const deliveryData = await deliveryResponse.json();

    // 6. Updates the package status to "READY_TO_PICKUP"
    const updated = await db
      .update(packages)
      .set({
        status: "READY_TO_PICKUP",
        deliveryTripId: deliveryData.id // Actualizado al nuevo campo de ID
      })
      .where(eq(packages.id, packageId))
      .returning();

    return NextResponse.json({
      message: "Paquete despachado con éxito (Reintento manual)",
      package: updated[0]
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error en despacho manual:", error);
    return NextResponse.json({ error: error.message || "Error interno al contactar Delivery" }, { status: 500 });
  }
}