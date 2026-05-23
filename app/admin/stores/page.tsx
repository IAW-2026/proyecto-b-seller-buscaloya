import { db } from '@/db';
import { stores } from '@/db/schema';
import Link from 'next/link';

export default async function AdminStoresPage() {

  const allStores = await db.select().from(stores);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-amber-400">Panel de Control Global (Admin)</h1>
        <p className="text-slate-400 mt-2">Monitoreo y gestión de todas las tiendas registradas en la plataforma</p>
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
                <td className="p-4 text-right">
                  <Link 
                    href={`/stores/${store.id}`}
                    className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-medium px-3 py-1 rounded transition-all"
                  >
                    Administrar Catálogo →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {allStores.length === 0 && (
          <p className="p-8 text-center text-slate-500 italic">No hay comercios registrados en el sistema actualmente.</p>
        )}
      </div>
    </div>
  );
}