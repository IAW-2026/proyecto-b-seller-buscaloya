import { NextResponse } from "next/server";

export async function GET() {
  const deliveryUrl = `${process.env.NEXT_PUBLIC_DELIVERY_APP_URL}/api/deliveries/quote`;
  console.log("[TEST] Probando conexión a Delivery App:", deliveryUrl);

  // Datos de prueba (hardcodeados) para simular una cotización
  const testPayload = {
    pickup_location: { lat: -34.6037, lng: -58.3816 }, // Ejemplo: Obelisco, BA
    dropoff_location: { lat: -34.5885, lng: -58.3986 } // Ejemplo: Recoleta, BA
  };

  try {
    const response = await fetch(deliveryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DELIVERY_API_KEY}`
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `Error en Delivery App: ${errorText}`, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error("[TEST] Error conectando a Delivery:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
