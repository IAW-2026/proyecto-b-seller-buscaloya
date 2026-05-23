// app/stores/[id]/page.tsx
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import AutoRefresh from "@/app/components/AutoRefresh";

interface StorePageProps {
  params: Promise<{ id: string }>;
}

export default async function StoreDashboardPage({ params }: StorePageProps) {
  const { id: storeId } = await params;
  const { userId, sessionClaims } = await auth();
  
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";
  const isOwner = userId === storeId;

  // 1. Fetch de la tienda
  const storeData = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  // 2. Control de acceso estricto y manejo del "Race Condition" del Webhook
  if (!storeData) {
    if (isOwner) {
      // El usuario se acaba de registrar y el webhook todavía está guardando la tienda en la DB.
      // En vez de un 404, le mostramos un mensaje para que espere un segundito.
      return <AutoRefresh />;
    } else {
      // Si no existe la tienda y NO es el dueño, ahí sí tiramos 404.
      notFound();
    }
  }

  // Si existe la tienda, pero no es ni dueño ni admin, lo pateamos
  if (!isOwner && !isAdmin) {
    notFound();
  }
  
  // 3. Fetch de productos
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      {/* ... (todo tu layout y código JSX queda exactamente igual a partir de acá) ... */}
      {isAdmin && (
        <Link href="/admin/stores" className="inline-block text-sm text-amber-400 hover:underline mb-6 font-medium">
          ← Volver al Panel de Control Admin
        </Link>
      )}

      <header className="flex flex-col md:flex-row items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-md">
        {storeData.imageUrl && (
          <img src={storeData.imageUrl} alt={storeData.name} className="w-24 h-24 object-cover rounded-xl border border-slate-700" />
        )}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-100">{storeData.name}</h1>
            {isAdmin && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded uppercase self-center">Modo Editor Admin</span>}
            {isOwner && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold px-2 py-0.5 rounded uppercase self-center">Propietario</span>}
          </div>
          <p className="text-slate-400 text-sm mt-1">{storeData.category} — <span className="italic">{storeData.email}</span></p>
        </div>
      </header>

      {/* Tu layout de productos intacto acá abajo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-200">Catálogo de Productos</h2>
          
          {storeProducts.length === 0 ? (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">
              No hay productos cargados en esta tienda todavía.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storeProducts.map((product) => (
                <div key={product.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <h3 className="font-bold text-slate-100">{product.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900">
                    <span className="text-amber-400 font-bold text-sm">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-500">Stock: {product.stock} u.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ... Formulario ... */}
      </div>
    </div>
  );
}