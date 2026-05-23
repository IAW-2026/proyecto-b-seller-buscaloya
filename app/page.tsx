import Image from "next/image";
import AuthButton from "./components/AuthButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId, sessionClaims } = await auth();

  // Si ya hay sesión, redirigimos directamente desde el servidor
  if (userId) {
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role === 'system_admin' || role === 'admin') {
      redirect('/admin/stores');
    } else {
      redirect(`/stores/${userId}`);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="absolute top-8 right-8">
        <AuthButton />
      </header>

      <main className="flex flex-col gap-8 row-start-2 items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Seller Module</h1>
          <p className="text-zinc-500 text-sm max-w-[300px]">
            Gestiona tus tiendas y productos de forma centralizada.
          </p>
        </div>
        <p className="text-sm text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
          Inicia sesión arriba para comenzar
        </p>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <span className="text-xs text-zinc-600 italic">IAW 2026 - Seller Module</span>
      </footer>
    </div>
  );
}