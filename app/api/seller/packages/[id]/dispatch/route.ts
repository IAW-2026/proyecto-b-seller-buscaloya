/* This file defines the API route for dispatching a package to the Delivery App.
It receives the package ID as a path parameter, retrieves the package and
related store information from the database, formats the data according to the contract 
expected by the Delivery App, simulates sending a request to the Delivery App, 
updates the package status in the database, and returns a response to the frontend. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Payload interface for the Delivery App
interface DeliveryRequestPayload {
  paquete_id: string;
  requested_by: string;
  context_mode: string;
  seller: { seller_id: string; address: string; contact_masked: string; };
  buyer: { buyer_id: string; address: string; contact_masked: string; };
  ready_at: string;
  otp_required: boolean;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Checks if the user (Seller) is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: packageId } = await params;

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

    // 3. Parses buyer address
    let formattedBuyerAddress = pkg.buyerAddress;
    try {
      const addr = JSON.parse(pkg.buyerAddress);
      formattedBuyerAddress = `${addr.street}, ${addr.city}`;
    } catch { }

    // 4. Builds the payload for the Delivery App
    const deliveryPayload: DeliveryRequestPayload = {
      paquete_id: pkg.id,
      requested_by: "seller_manual_fallback", // Indicamos que fue un reintento manual
      context_mode: "FULL_SNAPSHOT",
      seller: {
        seller_id: pkg.storeId,
        address: pkg.store?.address || "Sin dirección",
        contact_masked: "11****0000"
      },
      buyer: {
        buyer_id: pkg.buyerId,
        address: formattedBuyerAddress,
        contact_masked: "11****0000"
      },
      ready_at: new Date().toISOString(),
      otp_required: true
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
        deliveryTripId: deliveryData.delivery_request_id
      })
      .where(eq(packages.id, packageId))
      .returning();

    return NextResponse.json({
      message: "Paquete despachado con éxito (Reintento manual)",
      package: updated[0]
    });

  } catch (error) {
    console.error("Error en despacho manual:", error);
    return NextResponse.json({ error: "Error interno al contactar Delivery" }, { status: 500 });
  }
}