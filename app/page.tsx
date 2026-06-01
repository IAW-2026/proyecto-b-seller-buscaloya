/*This is the landing page of the app.
It checks if the user is authenticated and redirects them to the apropiate page 
based on their role (admin or regular seller user).
If the user is not authenticated, it shows a welcome message and prompts them to log in. */
"use client";
import AuthButton from "./components/AuthButton";

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full bg-[#0a0a0a]">
      
      {/* MITAD IZQUIERDA: Oscura y Tech */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center px-10 lg:px-24 overflow-hidden py-20 md:py-0">
        <div className="absolute top-0 left-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/15 blur-[100px]" />
        
        <div className="absolute top-8 left-10 lg:left-24">
          <span className="text-xl font-bold tracking-tighter text-white">BUSCALOYA</span>
        </div>

        <div className="relative z-10">
          <div className="inline-block py-1 px-3 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold tracking-widest uppercase mb-6">
            Portal de Vendedores
          </div>
          <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] text-white">
            Gestioná tu <br />
            <span className="text-red-600">
              Ecosistema.
            </span>
          </h1>
          <p className="mt-8 text-lg lg:text-xl text-gray-400 max-w-md leading-relaxed">
            La plataforma líder para conectar tu local con miles de usuarios. 
            Diseñada para darte control total y seguridad operativa.
          </p>
          
          <div className="mt-10 flex gap-4">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* MITAD DERECHA: Panel Blanco con Imagen Maximizada */}
      <div className="relative w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-16 rounded-t-[3rem] md:rounded-t-none md:rounded-l-[4rem] shadow-[-20px_0_50px_rgba(0,0,0,0.3)] z-20">
        
        <div className="absolute top-8 right-10 lg:right-24 text-xs tracking-widest text-slate-400 font-mono uppercase">
          Seller_Module_v2026
        </div>

        {/* Contenedor */}
        <div className="relative w-full max-w-xl xl:max-w-2xl aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.01]">
            
            <img 
              src="/sellerbuscaloya.jpg" 
              alt="Chef entregando pedido de BuscaloYa" 
              className="w-full h-full object-cover"
            />

            {/* Cartel compacto en la esquina inferior derecha (Evita tapar el logo) */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-xl shadow-lg border border-slate-100/80 z-30">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Estado</p>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online & Operativo
                </p>
            </div>
        </div>

      </div>
    </main>
  );
}