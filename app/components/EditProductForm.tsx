/*This component is responsible for rendering the form to edit a product's details.
It uses the useActionState hook to handle the form submission and display a success message when the update is successful.
The form includes fields for the product's name, description, price, stock, and image URL, and buttons to save changes or
go back to the store's page. */
/*It also includes a button to generate a product description using an AI model,
which sends a request to the /api/seller/generate-description endpoint and updates the description field with the response.*/
"use client";

import { useActionState, useState } from "react";
import { updateProductAction } from "@/app/actions/products";
import Link from "next/link";

export default function EditProductForm({ product, storeId }: { product: any, storeId: string }) {
  // Estados para controlar el nombre (para enviarlo a la IA) y la descripción (para que la IA la rellene)
  const [productName, setProductName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      await updateProductAction(formData, product.id, storeId);
      return { success: true };
    },
    { success: false }
  );

  const handleGenerateDescription = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!productName) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/seller/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDescription(data.description);
    } catch (error: any) {
      alert(error.message || "Hubo un error al generar la descripción");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form action={action} className="space-y-4">
      {state.success && (
        <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded-lg text-sm font-bold text-center mb-4">
          ✓ Producto actualizado correctamente
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-400">Nombre del producto</label>
        <input 
          name="name" 
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" 
          required 
        />
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <label className="block text-sm font-medium text-slate-400">Descripción</label>
          <button 
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating || !productName}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded disabled:opacity-50 transition-colors shadow-sm"
          >
            {isGenerating ? "Generando..." : "✨ Autocompletar con IA"}
          </button>
        </div>
        <textarea 
          name="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white" 
          rows={3} 
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400">Precio ($)</label>
          <input type="number" step="0.01" name="price" defaultValue={product.price} className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400">Stock disponible</label>
          <input type="number" name="stock" defaultValue={product.stock} className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">URL de Imagen</label>
        <input name="imageUrl" type="url" defaultValue={product.imageUrl || ""} className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" />
      </div>

      <div className="flex gap-4 pt-6">
        <Link 
          href={`/stores/${storeId}`}
          className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded text-center border border-slate-600 transition-colors"
        >
          Volver
        </Link>
        <button 
          type="submit"
          disabled={isPending}
          className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}