"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck } from "lucide-react";

export default function DispatchButton({ packageId }: { packageId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDispatch = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/seller/packages/${packageId}/dispatch`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Error al despachar el paquete.");
            } else {
                toast.success("¡Paquete despachado con éxito!");
                router.refresh(); // Recarga la página para mostrar el nuevo estado
            }
        } catch (error) {
            toast.error("Error de red al intentar despachar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDispatch}
            disabled={isLoading}
            className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${isLoading
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-red-500/20"
                }`}
        >
            {isLoading ? (
                <span className="animate-pulse">Despachando...</span>
            ) : (
                <>
                    <Truck className="w-5 h-5" /> Reintentar Despacho
                </>
            )}
        </button>
    );
}