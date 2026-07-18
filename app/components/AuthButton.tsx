/* This component is responsible for rendering the authentication button. 
It checks if the user is logged in or not and displays the appropriate button (Sign In, Sign Up or User Button). 
It also handles refreshing the page when the authentication state changes.*/
"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      router.refresh();
    }
  }, [userId, isLoaded, router]);

  if (!isLoaded) return null;
  if (userId) return <UserButton />;

  return (
    <div className="flex flex-row items-center justify-center gap-3 w-full">
      <SignInButton mode="modal">
        <button className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 text-sm transition-all shadow-lg shadow-red-500/20">
          Sign In
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-2.5 text-sm transition-all shadow-sm">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}