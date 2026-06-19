/*This is the mock implementation of the POST /seller/orders endpoint.
It implements the entire flow of processing an order from the Seller App perspective, including:
- Receiving the order request from the Buyer App
- Consulting the Delivery App for shipping quotes
- Consulting the Payments App to create a payment order
- Storing the order and package details in the local database
- Returning the response to the Buyer App according to the defined contract. */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products, packages, packageItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server"

//--- Delivery Quote Types ---
interface Location {
  lat: number;
  lng: number;
}

interface DeliveryQuoteRequest {
  pickup_location: Location;
  dropoff_location: Location;
}

interface DeliveryQuoteResponse {
  quote_id: string;
  estimated_cost_ars: number;
  estimated_time_minutes: number;
}

//--- Payment Order Types ---
interface PaymentItem {
  product_id: string;
  seller_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  zip?: string;
}

interface PaymentOrderRequest {
  buyer_id: string;
  items: PaymentItem[];
  delivery_address: DeliveryAddress;
  delivery_cost: number;
  subtotal: number;
  total: number;
  quote_id: string;
}

interface PaymentOrderResponse {
  order_id: string;
  mp_preference_id: string;
  status: string;
  total: number;
  created_at: string;
}

// The call POST /deliveries/quote to the Delivery App
async function requestDeliveryQuote(payload: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
  const deliveryUrl = `${process.env.NEXT_PUBLIC_DELIVERY_APP_URL}/api/deliveries/quote`;
  console.log("[INTEGRATION] Consultando cotización a:", deliveryUrl);

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
    throw new Error(`Error en Delivery App (Cotización): ${errorText}`);
  }

  return response.json();
}



  // Simulates the call POST /payments/orders to the Payments App
  async function requestPaymentOrder(payload: PaymentOrderRequest): Promise<PaymentOrderResponse> {
    // --- CÓDIGO REAL (COMENTADO PARA PROBAR CON BUYER) ---
    /*
    const paymentsUrl = `${process.env.NEXT_PUBLIC_PAYMENTS_APP_URL}/api/payments/orders`;
    console.log("[INTEGRATION] Solicitando orden de pago a:", paymentsUrl);
    
    const response = await fetch(paymentsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYMENTS_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Payments App (Crear Orden): ${errorText}`);
    }
  
    return response.json();
    */

    // --- HARDCODE PARA PRUEBA CON BUYER ---
    console.log("[MOCK] Simulando respuesta de Payments");
    return {
      order_id: `uuid-pay-${Math.floor(Math.random() * 10000)}`,
      mp_preference_id: "MP-MOCK-123",
      status: "payment_pending",
      total: payload.total,
      created_at: new Date().toISOString()
    };
  }


  // Main handler for POST /seller/orders endpoint
  export async function POST(req: Request) {
    // 1. Secure the route: only authenticated users can access it.
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await req.json();
      const { buyer_id, buyer_address, stores: cartStores } = body;
      // 2. Basic validation of the request body and access control: the buyer_id in the request must match
      //the authenticated user's ID.
      if (buyer_id !== userId) {
        return NextResponse.json({ error: "Forbidden: No puedes comprar a nombre de otro usuario" }, { status: 403 });
      }

      if (!buyer_id || !buyer_address || !cartStores || !Array.isArray(cartStores)) {
        return NextResponse.json({ error: "Estructura del carrito inválida" }, { status: 400 });
      }

      let globalSubtotal = 0;
      let globalDeliveryCost = 0;
      const paymentItems = []; //To build the items array for the Payments App request
      const packagesData = []; //To store package info in memory before inserting into DB and building the response
      const quoteIds = []; //To store quote IDs to send to Payments App

      // 3. Iterates over the stores in the cart to process each package separately
      for (const storeCart of cartStores) {
        const { store_id, items } = storeCart;

        // Looks for the store in the database to get its details (like location for delivery quote and name for the response).
        const storeData = await db.query.stores.findFirst({
          where: eq(stores.id, store_id),
        });

        if (!storeData) throw new Error(`Tienda ${store_id} no encontrada`);

        // 4.Calculates delivery quote for this package
        const quote = await requestDeliveryQuote({
          pickup_location: { lat: storeData.lat!, lng: storeData.lng! },
          dropoff_location: { lat: buyer_address.lat, lng: buyer_address.lng }
        });
        globalDeliveryCost += quote.estimated_cost_ars;
        quoteIds.push(quote.quote_id);

        let packageSubtotal = 0;
        const currentPackageItems = [];

        // 5. Processes each item in the package: get product details, calculate subtotals, and prepare data for Payments and DB
        for (const item of items) {
          const productData = await db.query.products.findFirst({
            where: eq(products.id, item.product_id),
          });

          if (!productData) throw new Error(`Producto ${item.product_id} no encontrado`);

          const itemSubtotal = productData.price * item.quantity;
          packageSubtotal += itemSubtotal;
          globalSubtotal += itemSubtotal;

          //Builds the item structure for the Payments App request
          paymentItems.push({
            product_id: productData.id,
            seller_id: storeData.id,
            name: productData.name,
            quantity: item.quantity,
            unit_price: productData.price,
            subtotal: itemSubtotal
          });

          //Builds the item structure for the package to be stored in DB and returned in the response
          currentPackageItems.push({
            productId: productData.id,
            productName: productData.name,
            quantity: item.quantity,
            priceAtPurchase: productData.price
          });
        }

        //Saves the package-level data in memory to later insert into DB and build the response
        packagesData.push({
          storeId: storeData.id,
          storeName: storeData.name,
          shippingCost: quote.estimated_cost_ars,
          items: currentPackageItems
        });
      }

      const globalTotal = globalSubtotal + globalDeliveryCost;

      // 6.Generates the payment order in the Payments App
      const paymentPayload = {
        buyer_id,
        items: paymentItems,
        delivery_address: buyer_address,
        delivery_cost: globalDeliveryCost,
        subtotal: globalSubtotal,
        total: globalTotal,
        quote_id: quoteIds.join(',')
      };

      const paymentResponse = await requestPaymentOrder(paymentPayload);
      const globalPaymentOrderId = paymentResponse.order_id;

      // 7. Saves the order and package details in the local database
      const finalPackagesResponse = [];

      for (const pkg of packagesData) {
        // Inserts the package and get its ID to then insert the related products
        const [insertedPackage] = await db.insert(packages).values({
          paymentOrderId: globalPaymentOrderId,
          storeId: pkg.storeId,
          buyerId: buyer_id,
          buyerAddress: JSON.stringify(buyer_address),
          shippingCost: pkg.shippingCost,
          status: "PREPARING"
        }).returning();

        const itemsToInsert = pkg.items.map(item => ({
          packageId: insertedPackage.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase
        }));

        // Inserts the items related to this package
        await db.insert(packageItems).values(itemsToInsert);

        // Builds the package structure for the response to the Buyer App
        finalPackagesResponse.push({
          package_id: insertedPackage.id,
          store_name: pkg.storeName,
          items: pkg.items.map(i => ({
            product_name: i.productName,
            quantity: i.quantity
          }))
        });
      }

      // 8. Returns the response to the Buyer App according to the defined contract
      return NextResponse.json({
        payment_order_id: globalPaymentOrderId,
        amount: globalTotal,
        packages: finalPackagesResponse
      }, { status: 200 });

    } catch (error: any) {
      console.error("Error procesando orden:", error);
      return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
  }