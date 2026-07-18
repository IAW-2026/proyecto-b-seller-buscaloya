/*This page is the edition interface for a specific store, allowing the owner or admin to edit the store's details.*/
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import EditStoreForm from "@/app/components/EditStoreForm";

interface EditStorePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditStorePage({ params, searchParams }: EditStorePageProps) {
  // 1. Solves the promise to get the store ID from the URL parameters
  const { id: storeId } = await params;
  const resolvedSearchParams = await searchParams;

  // Detects if the onboarding query parameter is present, which can be used to conditionally render
  // content or trigger specific behaviors in the edit form. This is useful for guiding new users through 
  // the editing process if they are coming from an onboarding flow.
  const isOnboarding = resolvedSearchParams.onboarding === "true";

  // 2. Looks up the store in the database using the provided ID. 
  // We use .then to extract the first result since we expect only one store with that ID.
  const store = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .then((res) => res[0]);

  // 3. Handles the case where the store is not found. 
  // This is important to avoid errors when trying to render the edit form with undefined data. 
  // We show a simple message indicating that the store was not found.
  if (!store) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="relative z-10 bg-white/5 border border-white/10 p-10 rounded-3xl max-w-md shadow-2xl backdrop-blur-xl text-center">
          <span className="text-6xl mb-6 block drop-shadow-lg grayscale opacity-80">🔍</span>
          <h1 className="text-2xl font-black text-red-500 mb-3 tracking-tight">Tienda no encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden flex justify-center items-start">

      {/* Fondo Oscuro (Mismo que el resto de la app) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      {/* CUADRADO BLANCO SUAVIZADO */}
      <div className="relative z-10 w-full max-w-3xl mt-4 md:mt-10 bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 md:p-12 text-slate-900">

        {/* Etiqueta superior */}
        <div className="inline-block py-1 px-3 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
          Modo Edición
        </div>

        {/* Mensaje aclaratorio: orienta al usuario de por qué fue redirigido */}
        {isOnboarding && (
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
            <h2 className="text-blue-700 font-bold text-base mb-1 flex items-center gap-2">
              <span className="text-lg">📍</span> ¡Configuración inicial necesaria!
            </h2>
            <p className="text-blue-600/80 text-sm leading-relaxed mt-2">
              Para poder activar tu tienda y habilitar tu catálogo de productos, primero necesitamos que completes la dirección real de tu local para que el sistema de repartos pueda operar correctamente.
            </p>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tighter text-slate-900">
          Configuración: <span className="text-red-600">{store.name}</span>
        </h1>

        {/* Pasamos a renderizar el formulario aquí dentro del panel blanco */}
        <EditStoreForm store={store} storeId={storeId} />
      </div>
    </div>
  );
}