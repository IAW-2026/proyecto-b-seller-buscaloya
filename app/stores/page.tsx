import { db } from "@/db";
import { stores } from "@/db/schema";
import Link from "next/link";

export default async function StoresPage() {
  const allStores = await db.select().from(stores);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Nuestras Tiendas</h1>
      
      <div className="grid gap-4">
        {allStores.map((store) => (
          <div key={store.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-blue-400">{store.name}</h2>
              <p className="text-gray-400 text-sm">{store.category} • {store.email}</p>
            </div>
            <Link 
              href={`/stores/${store.id}`} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition"
            >
              Ver Inventario
            </Link>
          </div>
        ))}
      </div>
      
      <Link href="/" className="inline-block mt-8 text-gray-400 hover:text-white underline text-sm">
        ← Volver al Inicio
      </Link>
    </div>
  );
}