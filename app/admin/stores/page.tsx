/*This is the admin role page for managing all the stores in the platform */
import { db } from '@/db';
import { stores } from '@/db/schema';
import { count } from 'drizzle-orm'; // <-- Importamos count
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { deleteStoreAction } from '@/app/actions/admin';
import DeleteButton from '@/app/components/DeleteButton';

// Additional imports for pagination and access control
export default async function AdminStoresPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const { page } = await searchParams;
  
  // --- Pagination Logic ---
  const currentPage = Number(page) || 1;
  const ITEMS_PER_PAGE = 10;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 1. Fetching total count of stores for pagination
  const totalStoresResult = await db.select({ count: count() }).from(stores);
  const totalStores = totalStoresResult[0].count;
  const totalPages = Math.ceil(totalStores / ITEMS_PER_PAGE);

  // 2. Fetching the stores for the current page with limit and offset
  const allStores = await db
    .select()
    .from(stores)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-400">Panel de Control Global (Admin)</h1>
          <p className="text-slate-400 mt-2">Monitoreo y gestión de todas las tiendas ({totalStores} registradas)</p>
        </div>
        <div className="bg-slate-900 p-2 rounded-full border border-slate-800">
          <UserButton />
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-slate-300 text-sm uppercase tracking-wider border-b border-slate-700">
              <th className="p-4">Nombre de la Tienda</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Email Comercial</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {allStores.map((store) => (
              <tr key={store.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-medium">{store.name}</td>
                <td className="p-4 text-slate-400">{store.category}</td>
                <td className="p-4 text-slate-400 text-sm">{store.email}</td>
                <td className="p-4 flex justify-end gap-2 text-right">
                  <Link 
                    href={`/stores/${store.id}`}
                    className="inline-flex items-center bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-medium px-3 py-1.5 rounded transition-all text-sm"
                  >
                    Administrar →
                  </Link>
                  <form action={deleteStoreAction}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <DeleteButton />
                  </form>
                </td>
              </tr>
            ))}
            {allStores.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500 italic">
                  No hay tiendas para mostrar en esta página.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-slate-800/30 border-t border-slate-800">
            <Link
              href={`/admin/stores?page=${currentPage - 1}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                currentPage <= 1
                  ? "bg-slate-900 border-slate-800 text-slate-600 pointer-events-none"
                  : "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              }`}
            >
              ← Anterior
            </Link>
            <span className="text-sm text-slate-400 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <Link
              href={`/admin/stores?page=${currentPage + 1}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                currentPage >= totalPages
                  ? "bg-slate-900 border-slate-800 text-slate-600 pointer-events-none"
                  : "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              }`}
            >
              Siguiente →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}