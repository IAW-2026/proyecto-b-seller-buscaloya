/*This page is the edition interface for a specific product within a store, allowing the owner or admin user to edit the 
product´s details. It fetches the product data based on the storeId and productId from the URL, and renders an EditProductForm
component pre-filled with the product's current information. If the product is not found it shows a 404 page. */
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditProductForm from "@/app/components/EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string; productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id: storeId, productId } = await params;

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, storeId)),
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden flex justify-center items-start">
      
      {/* Luces de fondo de la app */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      {/* Panel Blanco Suavizado */}
      <div className="relative z-10 w-full max-w-2xl mt-4 md:mt-10 bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 md:p-12 text-slate-900">
        
        <div className="inline-block py-1 px-3 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
          Modo Edición
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tighter text-slate-900">
          Modificar: <span className="text-red-600">{product.name}</span>
        </h1>
        
        <EditProductForm product={product} storeId={storeId} />
      </div>
    </div>
  );
}