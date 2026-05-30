/*This page is responsible for rendering the form to create a new product within a specific store. 
It uses the useActionState hook to handle the form submission and display success or error messages 
based on the result of the createProductAction. The form includes fields for the
product's name, description, price, stock, and image URL, as well as a button to generate 
a product description using an AI model. The storeId is passed as a hidden input field to ensure that 
the new product is associated with the correct store. */
"use client";

import { useActionState, useState, useEffect, use } from "react";
import { createProductAction } from "@/app/actions/products";
import Link from "next/link";

export default function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storeId } = use(params);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Passes the createProductAction to the useActionState hook to handle form submission
  // and manage the action's state, including success and error messages.
  const [state, action, isPending] = useActionState(createProductAction, { 
    success: false 
  });

  // 2.This useEffect hook listens for changes in the action's state, specifically
  // when the product creation is successful.
  useEffect(() => {
    if (state.success) {
      setProductName("");
      setDescription("");
    }
  }, [state.success]);

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
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-lg mt-10 shadow-lg border border-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-emerald-400">Crear Nuevo Producto</h1>

      <form action={action} className="space-y-4">
        {/* 3. CAMPO OCULTO: Esto evita tener que pasar el storeId por parámetros raros */}
        <input type="hidden" name="storeId" value={storeId} />

        {/* Mensaje de Éxito */}
        {state?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-lg text-sm font-bold text-center mb-4">
            ✓ Producto creado exitosamente.
          </div>
        )}

        {/* Mensaje de Error */}
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg text-sm font-bold text-center mb-4">
            ⚠️ {state.error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-400">Nombre del producto</label>
          <input name="name" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm font-medium text-slate-400">Descripción</label>
            <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !productName} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded disabled:opacity-50 transition-colors shadow-sm">
              {isGenerating ? "Generando..." : "✨ Autocompletar con IA"}
            </button>
          </div>
          <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white" rows={3} />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400">Precio ($)</label>
            <input type="number" step="0.01" name="price" className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400">Stock disponible</label>
            <input type="number" name="stock" className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">URL de Imagen</label>
          <input name="imageUrl" type="url" placeholder="https://..." className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" />
        </div>

        <div className="flex gap-4 pt-6">
          <Link href={`/stores/${storeId}`} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded text-center border border-slate-600 transition-colors">
            Volver a la Tienda
          </Link>
          <button type="submit" disabled={isPending} className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
            {isPending ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}