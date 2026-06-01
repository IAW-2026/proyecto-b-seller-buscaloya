/*This is the admin role page for managing all the stores in the platform */
import { db } from '@/db';
import { stores } from '@/db/schema';
import { count } from 'drizzle-orm';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { deleteStoreAction } from '@/app/actions/admin';
import DeleteButton from '@/app/components/DeleteButton';

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
    <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden">
      
      {/* Fondo Premium Oscuro */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Cabecera Oscura */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-block py-1 px-3 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm">
              Admin_Module_v2026
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              Panel de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Global</span>
            </h1>
            <p className="text-gray-400 mt-3 text-sm md:text-base">
              Monitoreo y gestión del ecosistema ({totalStores} tiendas operativas)
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-2 pl-5 pr-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">Administrador</span>
            <div className="scale-110">
              <UserButton />
            </div>
          </div>
        </header>

        {/* CONTENEDOR BLANCO (El "Cuadrado" que pediste con esquinas suavizadas) */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                {/* Cabecera de tabla gris clara para separar del contenido */}
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200">
                  <th className="p-6 font-bold">Nombre de la Tienda</th>
                  <th className="p-6 font-bold">Categoría</th>
                  <th className="p-6 font-bold">Email Comercial</th>
                  <th className="p-6 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {allStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 font-extrabold tracking-tight text-lg text-slate-900">
                      {store.name}
                    </td>
                    <td className="p-6">
                      {/* Badge adaptado al fondo claro */}
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                        {store.category}
                      </span>
                    </td>
                    <td className="p-6 text-slate-500 text-sm font-medium">
                      {store.email}
                    </td>
                    <td className="p-6 flex justify-end gap-3 items-center">
                      {/* Botón negro para altísimo contraste sobre el blanco */}
                      <Link 
                        href={`/stores/${store.id}`}
                        className="inline-flex items-center justify-center bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Administrar →
                      </Link>
                      <form action={deleteStoreAction} className="m-0 flex">
                        <input type="hidden" name="storeId" value={store.id} />
                        {/* El DeleteButton (rojo) va a destacar perfecto acá */}
                        <DeleteButton />
                      </form>
                    </td>
                  </tr>
                ))}
                
                {allStores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-5xl grayscale opacity-50">📭</span>
                        <p className="font-medium text-lg text-slate-500">El ecosistema está vacío. No hay tiendas registradas.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controles de Paginación adaptados al estilo claro */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-6 bg-slate-50 border-t border-slate-200">
              <Link
                href={`/admin/stores?page=${currentPage - 1}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  currentPage <= 1
                    ? "bg-slate-100 border-slate-200 text-slate-400 pointer-events-none"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-sm"
                }`}
              >
                ← Anterior
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">
                  Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
                </span>
              </div>
              <Link
                href={`/admin/stores?page=${currentPage + 1}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  currentPage >= totalPages
                    ? "bg-slate-100 border-slate-200 text-slate-400 pointer-events-none"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-sm"
                }`}
              >
                Siguiente →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}