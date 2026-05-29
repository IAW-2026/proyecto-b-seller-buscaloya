"use client";

import { useClerk } from "@clerk/nextjs";

export default function LogoutButton() {
  const { signOut } = useClerk();

  return (
    <button 
      onClick={() => signOut({ redirectUrl: "/" })}
      className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md inline-block w-full text-center cursor-pointer"
    >
      ← Cerrar sesión y volver al inicio
    </button>
  );
}