"use client";

import { useState, useTransition, useRef } from "react";
import { saveProductAction, deleteProductAction } from "@/app/actions/products";

// Tipado manual basado en tu base de datos
interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

interface ManagerProps {
  storeId: string;
  initialProducts: Product[];
}

export default function StoreCrudManager({ storeId, initialProducts }: ManagerProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Estado local para edición instantánea
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Al hacer click en Editar, llenamos el formulario usando la API de elementos segura para TypeScript
  const handleEditSelect = (product: Product) => {
    setEditingProduct(product);
    if (formRef.current) {
      const form = formRef.current;
      (form.elements.namedItem("name") as HTMLInputElement).value = product.name;
      (form.elements.namedItem("description") as HTMLTextAreaElement).value = product.description || "";
      (form.elements.namedItem("price") as HTMLInputElement).value = product.price.toString();
      (form.elements.namedItem("stock") as HTMLInputElement).value = product.stock.toString();
      (form.elements.namedItem("imageUrl") as HTMLInputElement).value = product.imageUrl || "";
    }
  };

  // Acción de disparo al enviar el formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await saveProductAction(formData, storeId, editingProduct?.id);
        // Limpiamos todo al terminar de guardar
        setEditingProduct(null);
        formRef.current?.reset();
      } catch (err) {
        alert("Error al guardar producto");
      }
    });
  };

  // Acción de borrado directo
  const handleDelete = async (productId: string) => {
    if (!confirm("¿Seguro querés eliminar este producto del catálogo?")) return;
    
    startTransition(async () => {
      try {
        await deleteProductAction(productId, storeId);
      } catch (err) {
        alert("Error al eliminar producto");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* SECCIÓN IZQUIERDA: Catálogo de Productos */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-200">Catálogo de Productos</h2>
        
        {initialProducts.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">
            No hay productos cargados en esta tienda todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialProducts.map((product) => (
              <div key={product.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative group">
                <div>
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-bold text-slate-100">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description || "Sin descripción"}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900">
                  <span className="text-amber-400 font-bold text-sm">${Number(product.price).toFixed(2)}</span>
                  <span className="text-xs text-slate-500">Stock: {product.stock} u.</span>
                </div>

                {/* Acciones flotantes del ítem */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 p-1 rounded-lg backdrop-blur-xs">
                  <button 
                    onClick={() => handleEditSelect(product)}
                    className="p-1.5 hover:bg-slate-800 text-blue-400 rounded-md text-xs"
                    title="Editar Ítem"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 hover:bg-slate-800 text-red-400 rounded-md text-xs"
                    title="Eliminar Ítem"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN DERECHA: Formulario Mutante (Carga / Edición) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-2 text-slate-200">
          {editingProduct ? "✏️ Editar Ítem" : "Añadir Ítem"}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {editingProduct ? "Modificando el producto seleccionado." : "Ingresá los datos del producto respetando los contratos del Buyer."}
        </p>
        
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del producto</label>
            <input type="text" name="name" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ej: Pizza Especial" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción</label>
            <textarea name="description" rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Detalle de los ingredientes..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Precio ($)</label>
              <input type="number" step="0.01" name="price" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="1500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock Inicial</label>
              <input type="number" name="stock" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">URL de la Imagen</label>
            <input type="url" name="imageUrl" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="https://images.com/..." />
          </div>

          <div className="flex gap-2 mt-2">
            {editingProduct && (
              <button 
                type="button" 
                onClick={() => { setEditingProduct(null); formRef.current?.reset(); }}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              disabled={isPending}
              className={`flex-1 font-bold py-2.5 rounded-lg text-sm transition-colors text-white shadow-md ${
                editingProduct ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isPending ? "Guardando..." : editingProduct ? "Actualizar Ítem" : "Publicar en Catálogo"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}