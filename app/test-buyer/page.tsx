/*This is a simple test page for the Buyer App  to simulate an order submission  and payment confirmation*/
"use client";

import { useState } from "react";

export default function TestDashboardPage() {
  //Buyer App states to handle the response from the Seller App after simulating a purchase. 
  //This will help us verify that the entire flow is working correctly, including communication with the Delivery and Payments modules.
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Payment (webhook) confirmation states to simulate the Buyer App confirming a payment and sending the result back to the Seller App. 
  //This will allow us to test the payment flow end-to-end. 
  const [paymentOrderIdInput, setPaymentOrderIdInput] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("validado");
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  //Dispatch states to simulate the dispatching of a package after payment confirmation, testing the integration 
  //with the Delivery App and the package status update in the database.
  const [dispatchPackageId, setDispatchPackageId] = useState("");
  const [dispatchResponse, setDispatchResponse] = useState<any>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  //---PAYLOAD MOCK BUYER APP---
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

  //--- Simulate Purchase (Buyer App) ---
  // Function to simulate the purchase process by sending the mock payload to the Seller App's API route for creating orders.
  // It handles the response and updates the state accordingly to display the result on the page.
  const handleSimulatePurchase = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setPaymentResponse(null);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(mockPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido en el servidor");
      }

      setResponse(data);
      //If the response contains a payment_order_id, we set it in the input state to simulate the payment confirmation later.
      if (data.payment_order_id) {
        setPaymentOrderIdInput(data.payment_order_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

//--- Webhook Simulation for Payments App ---
// Function to simulate the payment confirmation process by sending a PATCH request
// to the Seller App's API route for updating payment status.
const handleSimulatePayment = async () => {
    if (!paymentOrderIdInput) {
      setPaymentError("Necesitás un ID de orden de pago");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentResponse(null);

    try {
      // Calls the API route to update the payment status, simulating what the Payments App would do after validating the payment.
      const res = await fetch(`/api/seller/orders/${paymentOrderIdInput}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_order_id: paymentOrderIdInput,
          status: paymentStatus
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error en el servidor");

      setPaymentResponse(data);
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  //--- POST to the endpoint of Delivery App ---
  // Function to simulate the dispatch process by sending a POST request to the Seller App's API route for dispatching a package.
  // This will test the integration with the Delivery App and the package status update in the database.
  const handleDispatch = async () => {
    if (!dispatchPackageId) return;
    setDispatchLoading(true);
    setDispatchError(null);
    setDispatchResponse(null);

    try {
      const res = await fetch(`/api/seller/packages/${dispatchPackageId}/dispatch`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al despachar");
      setDispatchResponse(data);
    } catch (err: any) {
      setDispatchError(err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  // State and handler for dispatching a package (optional, can be triggered after payment confirmation to test the delivery flow)
  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-950 min-h-screen text-white space-y-12">
      
      {/* =========================================
          1. Buyer App Simulation Section
          ========================================= */}
      <section>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Paso 1: Simulador de Buyer</h1>
        <p className="text-slate-400 mb-6">Envia el carrito y genera la orden.</p>

        <button
          onClick={handleSimulatePurchase}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-colors mb-6 shadow-lg text-lg"
        >
          {loading ? "Procesando compra..." : "🛒 Simular Compra de Buyer"}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500 p-4 rounded-xl mb-6">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-xl">
            <h2 className="text-emerald-400 font-bold mb-4">Orden Creada (Copiá el ID si querés):</h2>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-emerald-400 border border-emerald-500/30">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <hr className="border-slate-800" />

      {/* =========================================
          2. Payments App Simulation Section
          ========================================= */}
      <section>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Paso 2: Webhook de Payments</h1>
        <p className="text-slate-400 mb-6">
          Simula que la App de Payments valida el pago e invoca tu PATCH.
        </p>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Payment Order ID</label>
            <input 
              type="text" 
              value={paymentOrderIdInput}
              onChange={(e) => setPaymentOrderIdInput(e.target.value)}
              placeholder="uuid-pay-..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Estado de la transacción</label>
            <select 
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="validado">Validado (Cambia DB a PREPARING)</option>
              <option value="rechazado">Rechazado (Cambia DB a CANCELLED)</option>
              <option value="error_raro">Forzar error de estado</option>
            </select>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={paymentLoading || !paymentOrderIdInput}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors mt-2 shadow-lg"
          >
            {paymentLoading ? "Avisando a Seller..." : "💸 Disparar Webhook de Pago"}
          </button>
        </div>

        {paymentError && (
          <div className="bg-red-500/10 border border-red-500 p-4 rounded-xl mt-6">
            <p className="text-red-400 font-mono text-sm">{paymentError}</p>
          </div>
        )}

        {paymentResponse && (
          <div className="bg-purple-500/10 border border-purple-500 p-6 rounded-xl mt-6">
            <h2 className="text-purple-400 font-bold mb-4">Respuesta de tu Webhook:</h2>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-purple-400 border border-purple-500/30">
              {JSON.stringify(paymentResponse, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <hr className="border-slate-800" />

      {/* =========================================
          3. Dispatch Simulation Section (Delivery App)
          ========================================= */}
      <section>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Paso 3: Seller Despacha Paquete</h1>
        <p className="text-slate-400 mb-6">Avisa a Delivery App que el paquete (ya pagado) está listo para retirar.</p>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Package ID (UUID de tu tabla packages)</label>
            <input 
              type="text" 
              value={dispatchPackageId}
              onChange={(e) => setDispatchPackageId(e.target.value)}
              placeholder="uuid del paquete..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleDispatch}
            disabled={dispatchLoading || !dispatchPackageId}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors mt-2 shadow-lg"
          >
            {dispatchLoading ? "Llamando a Delivery..." : "📦 Llamar Repartidor (Despachar)"}
          </button>
        </div>

        {dispatchError && (
          <div className="bg-red-500/10 border border-red-500 p-4 rounded-xl mt-6">
            <p className="text-red-400 font-mono text-sm">{dispatchError}</p>
          </div>
        )}

        {dispatchResponse && (
          <div className="bg-orange-500/10 border border-orange-500 p-6 rounded-xl mt-6">
            <h2 className="text-orange-400 font-bold mb-4">Respuesta exitosa:</h2>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-orange-400 border border-orange-500/30">
              {JSON.stringify(dispatchResponse, null, 2)}
            </pre>
          </div>
        )}
      </section>

    </div>
  );
}