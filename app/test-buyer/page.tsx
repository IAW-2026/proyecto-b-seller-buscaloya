/*This is a simple test page for the Buyer App  to simulate an order submission */
"use client";

import { useState } from "react";

export default function TestBuyerPage() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is the mock payload that simulates what the Buyer App would send to the Seller App when a user confirms a purchase.
  // Replace the store_id and product_id with actual IDs from your database to test the flow end-to-end.
  const mockPayload = {
    buyer_id: "user_test_clerk_123",
    buyer_address: {
      city: "Bahía Blanca",
      street: "Alem 123",
      lat: -34.6037,
      lng: -58.3816
    },
    stores: [
      {
        store_id: "user_3E6x1bYUfj7AxMWdS5HITnP856A", // Ej: "user_2abc123"
        items: [
          { 
            product_id: "b2ed6450-b26b-4799-8980-1036cd13e2e6", // Ej: "123e4567-e89b-12d3..."
            quantity: 1 
          }
        ]
      },{
        store_id: "user_3EKNsZYgEwDCJUFFrfNx7mNAxsJ",
                items: [
          { 
            product_id: "b0a57171-8e12-46d4-85c8-5b2cf3d44f32", // Ej: "123e4567-e89b-12d3..."
            quantity: 2 
          }
        ]
      }
    ]
  };

  const handleSimulatePurchase = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/seller/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido en el servidor");
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-950 min-h-screen text-white">
      <h1 className="text-3xl font-extrabold text-slate-100 mb-6">Simulador de Buyer</h1>
      <p className="text-slate-400 mb-8">
        Esta página envía un POST a <code className="bg-slate-800 px-2 py-1 rounded">/api/seller/orders</code> simulando ser el módulo Buyer mandando un carrito de compras.
      </p>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-slate-200">Payload a enviar:</h2>
        <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm text-emerald-400 border border-slate-800">
          {JSON.stringify(mockPayload, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleSimulatePurchase}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-colors mb-8 shadow-lg text-lg"
      >
        {loading ? "Procesando compra (Esperando Mocks)..." : "🛒 Simular Compra y Orquestar Módulos"}
      </button>

      {/* Resultados */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl">
          <h2 className="text-red-400 font-bold mb-2">Error:</h2>
          <p className="text-red-300 font-mono text-sm">{error}</p>
        </div>
      )}

      {response && (
        <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-2xl">
          <h2 className="text-emerald-400 font-bold mb-4">Respuesta Exitosa (200 OK):</h2>
          <p className="text-slate-300 text-sm mb-4">
            Esto es lo que el Buyer va a recibir después de que vos te comunicaste con Delivery y Payments.
          </p>
          <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm text-emerald-400 border border-emerald-500/30">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}