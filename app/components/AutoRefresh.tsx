/*This component automatically refreshes the page at regular intervals */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Le decimos a Next.js que recargue los datos en segundo plano cada 2 segundos
    const interval = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
      <h2 className="text-2xl font-bold mb-4 animate-pulse">Preparando tu tienda...</h2>
      <p className="text-slate-400 mb-6">Estamos configurando tu espacio de vendedor en nuestros servidores.</p>
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}