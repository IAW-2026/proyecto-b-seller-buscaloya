/* This is a webhook to receive payment status updates from the Payments App. 
   Updated: Automatic Dispatch upon successful payment. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  // 1. Security: Validates that the request comes from the Payments App using a token in the Authorization header.
  //This is a simple approach for demonstration purposes; in a production environment.
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.SELLER_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Obtains the payment order ID from the URL and the status from the request body
    const { id: paymentOrderIdFromUrl } = await params;
    const body = await req.json();
    const { order_id, status } = body;

    // 3. Basic validation: Checks if the status is present in the body
    if (!status) {
      return NextResponse.json({ error: "Falta el estado (status)" }, { status: 400 });
    }

    // Validates that if order_id is provided in the body, it matches the one in the URL
    if (order_id && order_id !== paymentOrderIdFromUrl) {
      return NextResponse.json({ error: "Mismatch entre URL y Body" }, { status: 400 });
    }

    // 4. Retrieves the packages associated with the payment order ID, including store information.
    console.log("[WEBHOOK] Buscando paquetes con paymentOrderId:", paymentOrderIdFromUrl);
    const packagesToUpdate = await db.query.packages.findMany({
      where: eq(packages.paymentOrderId, paymentOrderIdFromUrl),
      with: { store: true }
    });

    // If no packages were found, it means the payment order ID does not exist in the database
    if (packagesToUpdate.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // 5. If the payment failed, updates the status to CANCELLED and stops processing.
    if (status === "failed") {
      await db.update(packages)
        .set({ status: "CANCELLED" })
        .where(eq(packages.paymentOrderId, paymentOrderIdFromUrl));

      return NextResponse.json({ message: "Orden cancelada por fallo en pago" }, { status: 200 });
    }

    // 6. IF PAYMENT IS SUCCESSFUL: Automatic Dispatch (McDonald's model).
    if (status === "paid") {
      let dispatchedCount = 0;

      for (const pkg of packagesToUpdate) {
        // Parse buyer data
        let buyerAddrStr = pkg.buyerAddress;
        let bX = 5000;
        let bY = 5000;
        // Parses buyer address if it's stored as JSON, otherwise uses it as is
        let formattedBuyerAddress = pkg.buyerAddress;
        try {
          const addr = JSON.parse(pkg.buyerAddress);
          buyerAddrStr = `${addr.street}, ${addr.city}`;
          bX = addr.lat || 5000;
          bY = addr.lng || 5000;
        } catch { /* keeps default */ }

        // Builds the payload for the Delivery App according to the contract
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
          buyer_address: buyerAddrStr,
          buyer_x: bX,
          buyer_y: bY
        };

        // Calls the Delivery App
        const deliveryUrl = `${process.env.DELIVERY_APP_URL}/api/delivery-requests`;
        const response = await fetch(deliveryUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DELIVERY_API_KEY}`
          },
          body: JSON.stringify(deliveryPayload)
        });

        if (response.ok) {
          const deliveryData = await response.json();

          // Updates the package status to READY_TO_PICKUP and saves the delivery request ID
          await db.update(packages)
            .set({
              status: "READY_TO_PICKUP",
              deliveryTripId: deliveryData.delivery_request_id
            })
            .where(eq(packages.id, pkg.id));

          dispatchedCount++;
        } else {
          const err = await response.text();
          console.error(`[WEBHOOK] Fallo delivery para ${pkg.id}: ${err}`);
          await db.update(packages)
            .set({ status: "PREPARING" })
            .where(eq(packages.id, pkg.id));
        }
      }

      // 7. Returns a success response with the dispatch summary
      return NextResponse.json({
        message: `Pago exitoso. Se enviaron despachos automáticos para ${dispatchedCount} de ${packagesToUpdate.length} paquetes.`
      }, { status: 200 });
    }

    // Fallback for unrecognized status
    return NextResponse.json({ error: `Estado no reconocido: ${status}` }, { status: 400 });

  } catch (error: any) {
    console.error("Error en Webhook de Payments:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}