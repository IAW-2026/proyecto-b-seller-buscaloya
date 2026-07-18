/*This component is responsible for rendering the form to edit a store's details. 
It uses the useActionState hook to handle the form submission and display a success message when the update is successful. 
The form includes fields for the store's name, email, category, an interactive Mapbox map, and buttons to save changes or go back to the store's page.*/
"use client";

import { useActionState, useState, useEffect } from "react";
import { updateStoreAction } from "@/app/actions/stores";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

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
  // Initializes the latitude and longitude state with the store's current coordinates or defaults to Buenos Aires if not set.
  const [lat, setLat] = useState<number>(store.lat ?? -34.6037);
  const [lng, setLng] = useState<number>(store.lng ?? -58.3816);
  const [address, setAddress] = useState<string>(store.address ?? "");

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateStoreAction(formData, storeId);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    },
    { success: false }
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Cambios guardados correctamente");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Captures clicks on the map to update the latitude and longitude state, which are then included in the form submission via hidden inputs.
  const handleMapClick = async (event: any) => {
    const { lng: clickedLng, lat: clickedLat } = event.lngLat;
    setLat(clickedLat);
    setLng(clickedLng);

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${clickedLng}&latitude=${clickedLat}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].properties.full_address);
      }
    } catch (e) {
      console.error("Error al obtener la calle:", e);
    }
  };

  // Tailwind CSS classes for consistent styling of inputs and labels
  const inputClasses = "w-full p-3 mt-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 focus:bg-white transition-all shadow-sm";

  return (
    <form action={action} className="space-y-6">
      {/* Inputs ocultos */}
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500">Nombre de la tienda</label>
          <input
            name="name"
            defaultValue={store.name}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500">Categoría</label>
          <input
            name="category"
            defaultValue={store.category}
            className={inputClasses}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500">Email Comercial</label>
        <input
          name="email"
          defaultValue={store.email}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500">URL de Imagen (Logo/Fachada)</label>
        <input
          name="imageUrl"
          defaultValue={store.imageUrl || ""}
          className={inputClasses}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div className="pt-2">
        <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500">Dirección de retiro</label>
        <input
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ej: San Martín 123, Ciudad"
          className={inputClasses}
        />
      </div>

      {/* --- MAPBOX SECTION --- */}
      <div className="pt-2">
        <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-3">
          Ubicación en el mapa (Hacé clic para posicionar el local)
        </label>

        {/* Contenedor del mapa con borde gris sutil y sombra suave */}
        <div className="h-[350px] w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md relative transition-all hover:border-slate-300">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 13
            }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            onClick={handleMapClick}
            cursor="crosshair"
          >
            {/* Marcador rojo */}
            <Marker longitude={lng} latitude={lat} color="#dc2626" />
          </Map>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-right font-mono uppercase tracking-widest">
          Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-6 mt-2 border-t border-slate-100">
        <Link
          href={`/stores/${storeId}`}
          className="w-1/3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}