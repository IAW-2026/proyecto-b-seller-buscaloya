/*This page is the interface for creating a new product within a specific store.
It uses the useActionState hook to handle the form submission and display a success message when the product is created succesfully.*/
"use client";

import { useActionState, use } from "react";
import { createProductAction } from "@/app/actions/products";
import Link from "next/link";

export default function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  // En Client Components usamos React.use() para desenvolver la promesa
  const { id: storeId } = use(params);

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      await createProductAction(formData, storeId);
      return { success: true };
    },
    { success: false }
  );

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-lg mt-10 shadow-lg border border-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-emerald-400">Crear Nuevo Producto</h1>

      <form action={action} className="space-y-4">
        {state.success && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-lg text-sm font-bold text-center mb-4">
            ✓ Producto creado exitosamente. ¡Podés seguir agregando o volver a la tienda!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400">Nombre del producto</label>
          <input name="name" className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">Descripción</label>
          <textarea name="description" className="w-full p-2 mt-1 bg-slate-950 border border-slate-700 rounded text-white" rows={3} />
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
          <Link 
            href={`/stores/${storeId}`}
            className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded text-center border border-slate-600 transition-colors"
          >
            Volver a la Tienda
          </Link>
          <button 
            type="submit"
            disabled={isPending}
            className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}