"use client";

import {
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

export default function AuthButton() {
  const { userId, isLoaded } = useAuth();

  // Evita hydration mismatch
  if (!isLoaded) {
    return null;
  }

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