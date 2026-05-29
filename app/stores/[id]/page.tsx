/*This page displays the dashboard for a specific store by its ID */
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AutoRefresh from "@/app/components/AutoRefresh";
import DeleteProductForm from "@/app/components/DeleteProductForm";
import { SignOutButton } from "@clerk/nextjs";
import LogoutButton from "@/app/components/LogoutButton";

interface StorePageProps {
  params: Promise<{ id: string }>;
}

export default async function StoreDashboardPage({ params }: StorePageProps) {
  const { id: storeId } = await params;
  const { userId, sessionClaims } = await auth();
  const user = await currentUser();
  
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "system_admin" || role === "admin";
  const isOwner = userId === storeId;

  // 1. Fetching the store data with strict access control and handling the webhook
  const storeData = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  // 2. Access control: if the store doesn't exist, it could be either because it's still being created 
  // (webhook in progress) or because it truly doesn't exist. 
  // We use Clerk's timestamps to safely differentiate a Sign Up from a Sign In.
  if (!storeData) {
    if (isOwner || storeId.startsWith("user_")) {
      
      // We check if it's a Sign Up by comparing Clerk's timestamps.
      // We give a 5-second (5000 ms) margin for any internal Clerk latency.
      const isSignUp = user && user.lastSignInAt && (user.lastSignInAt - user.createdAt < 5000);

      if (isSignUp) {
        // If it's a new account, we assume the webhook is in progress and show a loading state.
        return <AutoRefresh />;
      } else {
// If it's an old account without a store, we throw an error screen and bounce them to the landing.
// If it's an old account without a store, we throw an error screen and bounce them to the landing.
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

  //Forces the owner to complete the onboarding if they haven't filled out the address and location info,
  //ensuring that all stores have this critical information before being accessed.
  if (isOwner && (!storeData.address || !storeData.lat || !storeData.lng)) {
    redirect(`/stores/${storeId}/edit?onboarding=true`);
  }

  // 3. Fetching the products of the store (only if the store exists and the user has access)
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      
      {/* --- BARRA SUPERIOR (Navegación y Usuario) --- */}
      <div className="flex justify-between items-center mb-6 min-h-[40px]">
        <div>
          {isAdmin && (
            <Link href="/admin/stores" className="inline-block text-sm text-amber-400 hover:underline font-medium">
              ← Volver al Panel de Control Admin
            </Link>
          )}
        </div>
        
        {/* Botón de Perfil / Sign Out de Clerk */}
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

  {/* --- BOTÓN DE EDICIÓN (Agregá esto acá) --- */}
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
            <h2 className="text-xl font-bold text-slate-200">Catálogo de Productos</h2>
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
              No hay productos cargados en esta tienda todavía.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
{storeProducts.map((product) => (
                <div key={product.id} className="relative bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between group">
                  
                  {/* --- BOTONES DE EDICIÓN / ELIMINACIÓN --- */}
                  {(isOwner || isAdmin) && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Link 
                        href={`/stores/${storeId}/products/${product.id}/edit`}
                        className="bg-blue-600/90 hover:bg-blue-500 text-white p-2 rounded-lg text-xs shadow-md backdrop-blur-sm transition-all"
                        title="Editar Producto"
                      >
                        ✏️
                      </Link>
                      {/* Nuestro nuevo Client Component para eliminar */}
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
          )}
        </div>

        {/* ... Formulario ... */}
      </div>
    </div>
  );
}