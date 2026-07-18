/*This component is responsible for rendering the form to edit a product's details.
It uses the useActionState hook to handle the form submission and display a success message when the update is successful.
The form includes fields for the product's name, description, price, stock, and image URL, and buttons to save changes or
go back to the store's page. */
/*It also includes a button to generate a product description using an AI model,
which sends a request to the /api/seller/generate-description endpoint and updates the description field with the response.*/
"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProductAction } from "@/app/actions/products";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function EditProductForm({ product, storeId }: { product: any, storeId: string }) {
  const [productName, setProductName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const [state, action, isPending] = useActionState(updateProductAction, { 
    success: false 
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Producto actualizado correctamente");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

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
      toast.error(error.message || "Hubo un error al generar la descripción");
    } finally {
      setIsGenerating(false);
    }
  };

  // Tailwind CSS classes for consistent styling of inputs and labels
  const inputClasses = "w-full p-3 mt-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 focus:bg-white transition-all shadow-sm";
  const labelClasses = "block text-[11px] font-bold tracking-widest uppercase text-slate-500";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="storeId" value={storeId} />

      <div>
        <label className={labelClasses}>Nombre del producto</label>
        <input 
          name="name" 
          value={productName} 
          onChange={(e) => setProductName(e.target.value)} 
          className={inputClasses} 
          required 
        />
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <label className={labelClasses}>Descripción</label>
          <button 
            type="button" 
            onClick={handleGenerateDescription} 
            disabled={isGenerating || !productName} 
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
          >
            {isGenerating ? "Generando..." : <><Sparkles className="w-3 h-3" /> Mejorar con IA</>}
          </button>
        </div>
        <textarea 
          name="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className={`${inputClasses} resize-none`} 
          rows={3} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Precio ($)</label>
          <input 
            type="number" 
            step="0.01" 
            name="price" 
            defaultValue={product.price} 
            className={inputClasses} 
            required 
          />
        </div>
        <div>
          <label className={labelClasses}>Stock disponible</label>
          <input 
            type="number" 
            name="stock" 
            defaultValue={product.stock} 
            className={inputClasses} 
            required 
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>URL de Imagen</label>
        <input 
          name="imageUrl" 
          type="url" 
          defaultValue={product.imageUrl || ""} 
          className={inputClasses} 
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Link 
          href={`/stores/${storeId}`} 
          className="w-1/3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <button 
          type="submit" 
          disabled={isPending} 
          className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}