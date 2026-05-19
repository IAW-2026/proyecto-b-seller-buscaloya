//Page for showing the catalog of a specific store, accessed by clicking on the store card in the stores list page.
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StoreInventoryPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Fetch the store details using the provided ID
  const store = await db.select().from(stores).where(eq(stores.id, id)).then(res => res[0]);

  // If the store doesn't exist, we show a 404 page
  if (!store) return notFound();

  // Fetch the inventory of products for this store
  const inventory = await db.select().from(products).where(eq(products.storeId, id));

  return (
    <div className="min-h-screen bg-black text-white p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/stores" className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Volver a la lista de tiendas
        </Link>

        <header className="mt-8 mb-10 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold text-blue-500">{store.name}</h1>
          <p className="text-zinc-400 mt-2">{store.category} | {store.email}</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-6">Stock de Productos</h2>
          
          {inventory.length === 0 ? (
            <div className="p-10 border border-dashed border-zinc-800 rounded-xl text-center">
              <p className="text-zinc-500 italic">No hay productos cargados en esta tienda todavía.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {inventory.map((item) => (
                <div key={item.id} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-zinc-500 text-sm italic">Stock disponible: {item.stock}</p>
                  </div>
                  <span className="text-green-400 font-mono text-xl font-bold">
                    ${item.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}