/*This component is responsible for rendering the form to edit a store's details. 
It uses the useActionState hook to handle the form submission and display a success message when the update is successful. 
The form includes fields for the store's name, email, category, an interactive Mapbox map, and buttons to save changes or go back to the store's page.*/
"use client";

import { useActionState, useState } from "react";
import { updateStoreAction } from "@/app/actions/stores";
import Link from "next/link";
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
      await updateStoreAction(formData, storeId);
      return { success: true };
    },
    { success: false }
  );

  // Captures clicks on the map to update the latitude and longitude state, which are then included in the form submission via hidden inputs.
const handleMapClick = async (event: any) => {
    const { lng: clickedLng, lat: clickedLat } = event.lngLat;
    setLat(clickedLat);
    setLng(clickedLng);

    // ESTO es lo que te falta para que el nombre de la calle cambie
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${clickedLng}&latitude=${clickedLat}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Esto actualiza el nombre de la calle en tu input
        // Asegurate de tener un setAddress en tu estado o usar la referencia del input
        // Si usas un estado 'address', poné esto:
        setAddress(data.features[0].properties.full_address);
      }
    } catch (e) {
      console.error("Error al obtener la calle:", e);
    }
  };

  return (
    <form action={action} className="space-y-4">
      {/* Inputs ocultos pero reactivos: se alimentan del estado del mapa 
        y empaquetan las coordenadas dentro del FormData automáticamente.
      */}
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

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
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">Email</label>
        <input 
          name="email" 
          defaultValue={store.email} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">Categoría</label>
        <input 
          name="category" 
          defaultValue={store.category} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">URL de Imagen</label>
        <input 
          name="imageUrl" 
          defaultValue={store.imageUrl || ""} 
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
        />
      </div>

      <div>
       <label className="block text-sm font-medium text-slate-400">Dirección de retiro</label>
       <input 
          name="address" 
          value={address} // Ahora el input está atado al estado
          onChange={(e) => setAddress(e.target.value)} // Permite que el usuario edite a mano
          placeholder="Ej: San Martín 123, Ciudad"
          className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded text-white"
        />
      </div>  
      

      {/* --- SECCIÓN NUEVA: MAPBOX MAP INTERACTIVO --- */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Ubicación en el mapa (Hacé clic para posicionar el local)
        </label>
        <div className="h-[320px] w-full rounded-lg overflow-hidden border border-slate-700 shadow-inner relative">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 13
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11" 
            onClick={handleMapClick}
            cursor="crosshair"
          >
            {/* El marcador toma el color ámbar para respetar los estilos de tus botones */}
            <Marker longitude={lng} latitude={lat} color="#f59e0b" />
          </Map>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 text-right italic">
          Coordenadas fijadas: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
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