/* This component is responsible for rendering the authentication button. 
It checks if the user is logged in or not and displays the appropriate button (Sign In, Sign Up or User Button). 
It also handles refreshing the page when the authentication state changes.*/
"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

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

  if (userId) {
    return <UserButton />;
  }

  return (
    <div className="flex flex-row items-center gap-3">
      <SignInButton mode="modal">
        <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-all cursor-pointer shadow-md">
          Sign In
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button className="rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold px-4 py-2 text-xs transition-all cursor-pointer shadow-sm">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}