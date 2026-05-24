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
  // Desestructuramos ambos IDs de la ruta (storeId y productId)
  const { id: storeId, productId } = await params;

  // Buscamos el producto específico, asegurando que pertenece a esta tienda
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, storeId)),
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-lg mt-10 shadow-lg border border-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Editando: {product.name}</h1>
      
      <EditProductForm product={product} storeId={storeId} />
    </div>
  );
}