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
  //1. Solves the promise to get the store ID from the URL parameters
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  //Detect if the onboarding query parameter is present, which can be used to conditionally render
  //content or trigger specific behaviors in the edit form. This is useful for guiding new users through 
  //the editing process if they are coming from an onboarding flow.
  const isOnboarding = resolvedSearchParams.onboarding === "true";

  // 2. Looks up the store in the database using the provided ID. 
  // We use .then to extract the first result since we expect only one store with that ID.
  const store = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .then((res) => res[0]);

  // 3. Handle the case where the store is not found. 
  // This is important to avoid errors when trying to render the edit form with undefined data. 
  // We show a simple message indicating that the store was not found.
if (!store) {
    return <div className="p-8 text-white"><h1 className="text-xl font-bold">Tienda no encontrada</h1></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-lg mt-10">
      
      {/* Mensaje aclaratorio: orienta al usuario de por qué fue redirigido */}
      {isOnboarding && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
          <h2 className="text-blue-400 font-bold text-base mb-1">📍 ¡Configuración inicial necesaria!</h2>
          <p className="text-slate-300 text-sm">
            Para poder activar tu tienda y habilitar tu catálogo de productos, primero necesitamos que completes la dirección real de tu local para que el sistema de repartos pueda operar correctamente.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Configuración de Tienda: {store.name}</h1>
      
      <EditStoreForm store={store} storeId={id} />
    </div>
  );
}