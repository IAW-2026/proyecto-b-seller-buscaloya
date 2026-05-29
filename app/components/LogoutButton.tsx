/*This component is a simple logout button that uses the Clerk authentication library to sign the user out and redirect them to the homepage. 
The button is used in the case where a user has an account but does not have an associated store, allowing them to easily log out and
return to the home page.*/
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