import { NextResponse } from "next/server";

export async function GET() {
  const paymentsUrl = `${process.env.PAYMENTS_APP_URL}/api/payments/orders`;
  console.log("[TEST] Probando conexión a Payments App:", paymentsUrl);

  // Datos de prueba (hardcodeados) basados en el contrato actualizado
  const testPayload = {
    buyer_id: "user_clerk_abc123",
    items: [
      {
        product_id: "prod_111",
        seller_id: "user_clerk_seller01",
        name: "Milanesa napolitana",
        quantity: 2,
        unit_price: 1500.00
      },
      {
        product_id: "prod_222",
        seller_id: "user_clerk_seller02",
        name: "Papas fritas",
        quantity: 1,
        unit_price: 800.00
      }
    ],
    delivery_address: {
      street: "Av. Corrientes 1234",
      city: "Buenos Aires",
      zip: "1043"
    },
    delivery_cost: 350.00,
    total: 4150.00,
    quote_id: "uuid-cotizacion-de-delivery",
    store_id: "user_clerk_seller01"
  };

  try {
    const response = await fetch(paymentsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYMENTS_API_KEY}`
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `Error en Payments App: ${errorText}`, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error("[TEST] Error conectando a Payments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
