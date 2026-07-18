/* This is a webhook to receive package tracking updates from the Delivery App.
   It maps the incoming Delivery states to the Seller's internal states and 
   enforces a strict state machine to prevent invalid transitions. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";

// 1. Define valid transitions for the Seller state machine
const VALID_TRANSITIONS: Record<string, string[]> = {
    "PENDING_PAYMENT": ["PREPARING", "CANCELLED"],
    "PREPARING": ["READY_TO_PICKUP", "CANCELLED"],
    "READY_TO_PICKUP": ["IN_TRANSIT", "CANCELLED"],
    "IN_TRANSIT": ["DELIVERED", "CANCELLED"],
    "DELIVERED": [],
    "CANCELLED": []
};

// 2. Helper to map Delivery App statuses to Seller App DB ENUM statuses
function mapDeliveryStatusToSellerStatus(incomingStatus: string): string {
    const statusMap: Record<string, string> = {
        "PICKED_UP": "IN_TRANSIT",
        "OUT_FOR_DELIVERY": "IN_TRANSIT", // Treating both as IN_TRANSIT for the Seller's simplified view
        "DELIVERED": "DELIVERED",
        "DELIVERY_FAILED": "CANCELLED",
        "CANCELLED_SUCCESSFULLY": "CANCELLED"
    };

    // Return the mapped status, or the incoming status if it already matches our ENUM
    return statusMap[incomingStatus] || incomingStatus;
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ packageId: string }> }
) {
    const now = new Date().toISOString();

    // 1. M2M Security: Validates the API Key sent by the Delivery App
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.SELLER_API_KEY) {
        return NextResponse.json({
            error: "unauthorized",
            message: "API Key inválida o no proporcionada.",
            timestamp: now
        }, { status: 401 });
    }

    try {
        const { packageId } = await params;
        const body = await req.json();
        const { status: rawIncomingStatus } = body;

        if (!rawIncomingStatus) {
            return NextResponse.json({ error: "Falta el campo status" }, { status: 400 });
        }

        // 2. Map the incoming status to our DB Enum
        const mappedStatus = mapDeliveryStatusToSellerStatus(rawIncomingStatus);

        // 3. Fetch the current package from Neon DB
        const pkg = await db.query.packages.findFirst({
            where: eq(packages.id, packageId),
            columns: { status: true }
        });

        if (!pkg) {
            return NextResponse.json({
                error: "package_not_found",
                message: "No se encontró ningún paquete con el ID especificado.",
                timestamp: now
            }, { status: 404 });
        }

        const currentStatus = pkg.status;

        // 4. Idempotency Check: If the status is exactly the same, return early with 200 OK
        if (currentStatus === mappedStatus) {
            return NextResponse.json({
                package_id: packageId,
                currentStatus: currentStatus,
                message: "El estado ya estaba actualizado."
            }, { status: 200 });
        }

        // 5. State Machine Validation (Prevents skipping steps like PREPARING -> DELIVERED)
        const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];

        if (!allowedNextStates.includes(mappedStatus)) {
            return NextResponse.json({
                error: "invalid_status_transition",
                message: `Transición inválida. No es posible pasar del estado '${currentStatus}' a '${mappedStatus}'.`,
                timestamp: now
            }, { status: 422 });
        }

        // 6. Update the package status in the database
        // Ignore TypeScript errors here for enum types if mapping is perfectly aligned with schema
        await db.update(packages)
            .set({ status: mappedStatus as any })
            .where(eq(packages.id, packageId));

        // 7. Success Response
        return NextResponse.json({
            package_id: packageId,
            previousStatus: currentStatus,
            currentStatus: mappedStatus,
            rawDeliveryStatus: rawIncomingStatus
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error procesando el webhook de logística:", error);
        return NextResponse.json({
            error: "internal_server_error",
            message: "Ocurrió un error inesperado al procesar la actualización.",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}