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

//--- Contract with Delivery App  (endpoint: POST /delivery-requests) ---
interface DeliveryRequestPayload {
  paquete_id: string;
  requested_by: string;
  context_mode: string;
  seller: {
    seller_id: string;
    address: string;
    contact_masked: string;
  };
  buyer: {
    buyer_id: string;
    address: string;
    contact_masked: string;
  };
  ready_at: string;
  otp_required: boolean;
}

// Mocks function to simulate the Delivery App API call
async function requestDeliveryAssignment(payload: DeliveryRequestPayload) {
  const deliveryUrl = `${process.env.NEXT_PUBLIC_DELIVERY_APP_URL}/api/delivery-requests`;
  console.log("[INTEGRATION] Solicitando repartidor a:", deliveryUrl);

  const response = await fetch(deliveryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DELIVERY_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en Delivery App (Asignar Repartidor): ${errorText}`);
  }

  return response.json();
}


export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  //1. Checks if the user is authenticated
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

    // 3. Parses buyer address if it's stored as JSON, otherwise uses it as is
    let formattedBuyerAddress = pkg.buyerAddress;
    try {
      const addr = JSON.parse(pkg.buyerAddress);
      formattedBuyerAddress = `${addr.street}, ${addr.city}`;
    } catch { /* If parsing fails, keep the original string */ }

    // 4. Builds the payload for the Delivery App according to the contract, using package and store data
    const deliveryPayload: DeliveryRequestPayload = {
      paquete_id: pkg.id,
      requested_by: "seller",
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

    // 5. Calls the function to simulate sending the request to the Delivery App and getting a response
    const deliveryResponse = await requestDeliveryAssignment(deliveryPayload);

    // 6. Updates the package status to "READY_TO_PICKUP" and saves the delivery request ID in the database
    const updated = await db
      .update(packages)
      .set({
        status: "READY_TO_PICKUP",
        deliveryTripId: deliveryResponse.delivery_request_id
      })
      .where(eq(packages.id, packageId))
      .returning();

    return NextResponse.json({
      message: "Paquete despachado con éxito",
      package: updated[0]
    });

  } catch (error) {
    console.error("Error en despacho:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}