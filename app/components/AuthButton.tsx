"use client";

import {
  SignInButton,
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
    <SignInButton mode="modal">
      <button className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black border border-zinc-200 dark:border-zinc-800 transition-opacity hover:opacity-80">
        Sign In
      </button>
    </SignInButton>
  );
}