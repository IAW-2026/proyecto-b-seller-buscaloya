/*This page displays the dashboard for a specific store by its ID */
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, count } from "drizzle-orm"; // <-- Agregamos count
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AutoRefresh from "@/app/components/AutoRefresh";
import DeleteProductForm from "@/app/components/DeleteProductForm";
import { SignOutButton } from "@clerk/nextjs";
import LogoutButton from "@/app/components/LogoutButton";

// Updates the payment status of an order based on the webhook received from the Payments App.
// The endpoint is protected with a simple token-based authentication to ensure that only authorized 
// requests can update the payment status. Depending on the status received ("validado" or "rechazado"), 
//it updates the status of all packages associated with the payment order ID in the database to 
//either "PREPARING" or "CANCELLED". If the payment order ID is not found, it returns a 404 error.
interface StorePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function StoreDashboardPage({ params, searchParams }: StorePageProps) {
  const { id: storeId } = await params;
  const { page } = await searchParams; // <-- Obtenemos la query string
  const { userId, sessionClaims } = await auth();
  const user = await currentUser();
  
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";
  const isOwner = userId === storeId;

  // --- Pagination Logic ---
  const currentPage = Number(page) || 1;
  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 1. Fetching the store data
  const storeData = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  // 2. Access control 
  if (!storeData) {
    if (isOwner || storeId.startsWith("user_")) {
      const isSignUp = user && user.lastSignInAt && (user.lastSignInAt - user.createdAt < 5000);
      if (isSignUp) {
        return <AutoRefresh />;
      } else {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-center p-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl">
              <span className="text-5xl mb-4 block">🚫</span>
              <h1 className="text-xl font-bold text-red-400 mb-2">Acceso Denegado</h1>
              <p className="text-slate-400 mb-8 text-sm">
                Tu cuenta de usuario existe, pero no tenés ninguna tienda asociada en nuestro sistema.
              </p>
              <LogoutButton />
            </div>
          </div>
        );
      }
    } else {
      notFound();
    }
  }

  if (!isOwner && !isAdmin) {
    notFound();
  }

  if (isOwner && (!storeData.address || !storeData.lat || !storeData.lng)) {
    redirect(`/stores/${storeId}/edit?onboarding=true`);
  }

  // 3. Fetching total count para saber cuántas páginas hay
  const totalProductsResult = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));
  const totalProducts = totalProductsResult[0].count;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // 4. Fetching the products paginados
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      
      {/* --- BARRA SUPERIOR --- */}
      <div className="flex justify-between items-center mb-6 min-h-[40px]">
        <div>
          {isAdmin && (
            <Link href="/admin/stores" className="inline-block text-sm text-amber-400 hover:underline font-medium">
              ← Volver al Panel de Control Admin
            </Link>
          )}
        </div>
        <div className="bg-slate-900 p-1.5 rounded-full border border-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-800 transition-colors">
          <UserButton />
        </div>
      </div>

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
        {(isOwner || isAdmin) && (
          <div className="flex-none">
            <Link 
              href={`/stores/${storeId}/edit`} 
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              Editar Perfil
            </Link>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-200">Catálogo de Productos ({totalProducts})</h2>
            {(isOwner || isAdmin) && (
              <Link 
                href={`/stores/${storeId}/products/new`}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm"
              >
                + Nuevo Producto
              </Link>
            )}
          </div>
          
          {storeProducts.length === 0 ? (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">
              No hay productos en esta página o aún no has cargado ninguno.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {storeProducts.map((product) => (
                  <div key={product.id} className="relative bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between group">
                    {(isOwner || isAdmin) && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Link 
                          href={`/stores/${storeId}/products/${product.id}/edit`}
                          className="bg-blue-600/90 hover:bg-blue-500 text-white p-2 rounded-lg text-xs shadow-md backdrop-blur-sm transition-all"
                          title="Editar Producto"
                        >
                          ✏️
                        </Link>
                        <DeleteProductForm productId={product.id} storeId={storeId} />
                      </div>
                    )}
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

              {/* --- Pagination Controls --- */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-800">
                  <Link
                    href={`/stores/${storeId}?page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                      currentPage <= 1
                        ? "bg-slate-950 border-slate-800 text-slate-600 pointer-events-none"
                        : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors"
                    }`}
                  >
                    ← Anterior
                  </Link>
                  <span className="text-sm text-slate-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Link
                    href={`/stores/${storeId}?page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                      currentPage >= totalPages
                        ? "bg-slate-950 border-slate-800 text-slate-600 pointer-events-none"
                        : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors"
                    }`}
                  >
                    Siguiente →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}