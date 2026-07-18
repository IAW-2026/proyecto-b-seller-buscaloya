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
import { Package, UtensilsCrossed, Pencil, ArrowRight, PackageOpen } from "lucide-react";

// Updates the payment status of an order based on the webhook received from the Payments App.
// The endpoint is protected with a simple token-based authentication to ensure that only authorized 
// requests can update the payment status. Depending on the status received ("validado" or "rechazado"), 
//it updates the status of all packages associated with the payment order ID in the database to 
//either "PREPARING" or "CANCELLED". If the payment order ID is not found, it returns a 404 error.
interface StorePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>;
}

export default async function StoreDashboardPage({ params, searchParams }: StorePageProps) {
  const { id: storeId } = await params;
  const { page } = await searchParams;
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
          <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-center p-6 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />

            <div className="relative z-10 bg-white/5 border border-white/10 p-10 rounded-3xl max-w-md shadow-2xl backdrop-blur-xl">
              <span className="text-6xl mb-6 block drop-shadow-lg grayscale opacity-80">🚫</span>
              <h1 className="text-2xl font-black text-red-500 mb-3 tracking-tight">Acceso Denegado</h1>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
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

  // 3. Fetching the total count of products for pagination
  const totalProductsResult = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));
  const totalProducts = totalProductsResult[0].count;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // 4. Fetching the products for the current page
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden">

      {/* Fondo  Oscuro */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* --- BARRA SUPERIOR --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 min-h-[40px]">
          <div>
            {isAdmin && (
              <Link href="/admin/stores" className="inline-block text-sm text-gray-400 hover:text-white transition-colors font-medium tracking-wide">
                ← Volver al Panel Admin
              </Link>
            )}
          </div>

          {/* GRUPO DE BOTONES SUPERIOR DERECHO */}
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            {(isOwner || isAdmin) && (
              <Link
                href={`/stores/${storeId}/edit`}
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 px-5 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md shadow-lg hover:scale-105"
              >
                Editar Perfil
              </Link>
            )}

            <div className="flex items-center gap-4 p-2 pl-5 pr-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">
                {isAdmin ? "Administrador" : "Propietario"}
              </span>
              <div className="scale-110">
                <UserButton />
              </div>
            </div>
          </div>
        </div>

        {/* --- HEADER DE LA TIENDA --- */}
        <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
          {storeData.imageUrl && (
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
              <img
                src={storeData.imageUrl}
                alt={storeData.name}
                className="relative w-32 h-32 object-cover rounded-3xl border border-white/10 shadow-2xl"
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-5xl font-extrabold tracking-tighter text-white">{storeData.name}</h1>
              <div className="flex gap-2 justify-center">
                {isAdmin && <span className="bg-white/10 border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Modo Admin</span>}
                {isOwner && <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Propietario</span>}
              </div>
            </div>
            <p className="text-gray-400 text-base">
              <span className="font-medium text-gray-300">{storeData.category}</span> — <span className="italic opacity-80">{storeData.email}</span>
            </p>
          </div>
        </header>

        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* EL CUADRADO BLANCO (Catálogo) */}
          <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catálogo de Productos</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{totalProducts} artículos publicados</p>
              </div>
              {(isOwner || isAdmin) && (
                <Link
                  href={`/stores/${storeId}/products/new`}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform shadow-md hover:shadow-lg hover:scale-105 flex-shrink-0"
                >
                  + Nuevo Producto
                </Link>
              )}
            </div>

            {storeProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <PackageOpen className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Aún no hay productos</h3>
                <p className="text-slate-500 font-medium mb-6">No hay productos en esta página o aún no has cargado ninguno.</p>
                {(isOwner || isAdmin) && (
                  <Link
                    href={`/stores/${storeId}/products/new`}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-transform shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Crear tu primer producto
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Grilla de productos adaptada al fondo blanco */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {storeProducts.map((product) => (
                    <div key={product.id} className="relative bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between group hover:shadow-xl hover:border-slate-200 transition-all">

                      {(isOwner || isAdmin) && (
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Link
                            href={`/stores/${storeId}/products/${product.id}/edit`}
                            className="bg-white/90 hover:bg-white text-slate-900 border border-slate-200 p-2 rounded-lg shadow-md backdrop-blur-sm transition-all"
                            title="Editar Producto"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {/* El DeleteProductForm */}
                          <div className="bg-white/90 rounded-lg shadow-md backdrop-blur-sm">
                            <DeleteProductForm productId={product.id} storeId={storeId} />
                          </div>
                        </div>
                      )}

                      <div>
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm" />
                        )}
                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight">{product.name}</h3>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{product.description || "Sin descripción"}</p>
                      </div>

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60">
                        <span className="text-red-600 font-black text-lg">${product.price.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2.5 py-1 rounded-md">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- Pagination Controls (Fondo Blanco) --- */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                    <Link
                      href={`/stores/${storeId}?page=${currentPage - 1}`}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${currentPage <= 1
                        ? "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-sm"
                        }`}
                    >
                      ← Anterior
                    </Link>
                    <span className="text-sm font-semibold text-slate-500">
                      Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
                    </span>
                    <Link
                      href={`/stores/${storeId}?page=${currentPage + 1}`}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${currentPage >= totalPages
                        ? "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-sm"
                        }`}
                    >
                      Siguiente →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* --- COLUMNA DERECHA (Panel de Gestión de Paquetes) --- */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {(isOwner || isAdmin) && (
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/5">
                    <Package className="w-8 h-8 text-white/90" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">Gestor de Órdenes</h3>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    Administrá los pedidos entrantes, monitoreá el estado logístico y gestioná los despachos a Delivery.
                  </p>

                  <Link
                    href={`/stores/${storeId}/packages`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Abrir Gestor <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}