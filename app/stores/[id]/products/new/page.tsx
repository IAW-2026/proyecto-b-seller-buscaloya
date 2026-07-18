/*This page is responsible for rendering the form to create a new product within a specific store. 
It uses the useActionState hook to handle the form submission and display success or error messages 
based on the result of the createProductAction. The form includes fields for the
product's name, description, price, stock, and image URL, as well as a button to generate 
a product description using an AI model. The storeId is passed as a hidden input field to ensure that 
the new product is associated with the correct store. */
"use client";

import { useActionState, useState, useEffect, use } from "react";
import { createProductAction } from "@/app/actions/products";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storeId } = use(params);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [state, action, isPending] = useActionState(createProductAction, {
    success: false
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("¡Producto creado exitosamente!");
      setProductName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");
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

  // Tailwind classes for inputs and labels to maintain consistency across the form
  const inputClasses = "w-full p-3 mt-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 focus:bg-white transition-all shadow-sm";
  const labelClasses = "block text-[11px] font-bold tracking-widest uppercase text-slate-500";

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden flex justify-center items-start">

      {/* Luces de fondo de la app */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      {/* Panel Blanco Suavizado */}
      <div className="relative z-10 w-full max-w-2xl mt-4 md:mt-10 bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 md:p-12 text-slate-900">

        <div className="inline-block py-1 px-3 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
          Inventario
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tighter text-slate-900">
          Crear Nuevo <span className="text-red-600">Producto</span>
        </h1>

        <form action={action} className="space-y-5">
          <input type="hidden" name="storeId" value={storeId} />

          <div>
            <label className={labelClasses}>Nombre del producto</label>
            <input
              name="name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={inputClasses}
              placeholder="Ej: Hamburguesa Doble Cheddar"
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
                {isGenerating ? "Generando..." : <><Sparkles className="w-3 h-3" /> Completar con IA</>}
              </button>
            </div>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} resize-none`}
              placeholder="Contanos qué ingredientes trae o detalles del producto..."
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClasses}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Stock disponible</label>
              <input
                type="number"
                name="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClasses}
                placeholder="Ej: 50"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>URL de Imagen</label>
            <input
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/producto.jpg"
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
              {isPending ? "Guardando..." : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}