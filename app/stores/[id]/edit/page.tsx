/*This page is the edition interface for a specific store, allowing the owner or admin to edit the store's details.*/
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import EditStoreForm from "@/app/components/EditStoreForm"; 

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Resolvemos la promesa de los params (Next.js 15)
  const { id } = await params;

  // 2. Buscamos la tienda en la base de datos
  const store = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .then((res) => res[0]);

  // 3. Manejo de error si no existe
  if (!store) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-xl font-bold">Tienda no encontrada</h1>
      </div>
    );
  }

  // 4. Formulario de edición (ahora importado como componente)
  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6">Editando: {store.name}</h1>
      
      {/* Le pasamos la data de la tienda y el ID al formulario */}
      <EditStoreForm store={store} storeId={id} />
    </div>
  );
}