/* This is a webhook to receive payment status updates from the Payments App. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    // 1. Obtains the payment order ID from the URL and the status from the request body
    const { id: paymentOrderIdFromUrl } = await params;
    const body = await req.json();
    const { order_id, status } = body;

    // 2. Basic validation: Checks if the status is present in the body
    if (!status) {
      return NextResponse.json({ error: "Falta el estado (status)" }, { status: 400 });
    }

    // Validates that if order_id is provided in the body, it matches the one in the URL
    if (order_id && order_id !== paymentOrderIdFromUrl) {
      return NextResponse.json({ error: "Mismatch entre URL y Body" }, { status: 400 });
    }

    // 3. Updates the status of all packages that belong to the payment order ID. The new status depends on the value of "status" in the body.
    let newStatus: "PREPARING" | "CANCELLED" = "PREPARING";

    if (status === "paid") {
      newStatus = "PREPARING";
    } else if (status === "failed") {
      newStatus = "CANCELLED";
    } else {
      return NextResponse.json({ error: `Estado no reconocido: ${status}` }, { status: 400 });
    }

    // 4. Updates the status of the packages in the database
    const updatedPackages = await db
      .update(packages)
      .set({ status: newStatus })
      .where(eq(packages.paymentOrderId, paymentOrderIdFromUrl))
      .returning();

    // If no packages were updated, it means the payment order ID was not found in the database
    if (updatedPackages.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // 5. Returns a success response with the new status
    return NextResponse.json(
      { message: `Estado actualizado a ${newStatus} exitosamente` },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error en Webhook de Payments:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}