/*This component is responsible for rendering the form to edit a store's details. 
It uses the useActionState hook to handle the form submission and display a success message when the update is successful. 
The form includes fields for the store's name, email, category, and image URL, and buttons to save changes or go back to the store's page.*/
"use client";

import { useActionState } from "react";
import { updateStoreAction } from "@/app/actions/stores";
import Link from "next/link";

interface EditStoreFormProps {
  store: {
    name: string;
    email: string;
    category: string;
    imageUrl: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  storeId: string;
}

export default function EditStoreForm({ store, storeId }: EditStoreFormProps) {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      await updateStoreAction(formData, storeId);
      return { success: true };
    },
    { success: false }
  );

  return (
    <form action={action} className="space-y-4">
      {/*Success sign */}
      {state.success && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-lg text-sm font-bold text-center">
          ✓ Cambios guardados correctamente
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-400">Nombre de la tienda</label>
        <input 
          name="name" 
          defaultValue={store.name} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">Email</label>
        <input 
          name="email" 
          defaultValue={store.email} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">Categoría</label>
        <input 
          name="category" 
          defaultValue={store.category} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">URL de Imagen</label>
        <input 
          name="imageUrl" 
          defaultValue={store.imageUrl || ""} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">Dirección de retiro</label>
        <input 
          name="address" 
          defaultValue={store.address || ""} 
          placeholder="Ej: San Martín 123, Ciudad"
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400">Latitud</label>
          <input 
            type="number" 
            step="any" /* Permite decimales */
            name="lat" 
            defaultValue={store.lat || ""} 
            placeholder="-34.6037"
            className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white" 
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400">Longitud</label>
          <input 
            type="number" 
            step="any"
            name="lng" 
            defaultValue={store.lng || ""} 
            placeholder="-58.3816"
            className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white" 
          />
        </div>
      </div>

      {/*Action buttons */}
      <div className="flex gap-4 pt-4 mt-4">
        <Link 
          href={`/stores/${storeId}`}
          className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded text-center border border-slate-600 transition-colors"
        >
          Volver
        </Link>
        <button 
          type="submit"
          disabled={isPending}
          className="w-2/3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}