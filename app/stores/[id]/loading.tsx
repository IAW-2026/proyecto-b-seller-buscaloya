export default function LoadingStoreDashboard() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] p-6 md:p-12 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto animate-pulse">
        
        {/* BARRA SUPERIOR SKELETON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 min-h-[40px]">
          <div className="h-4 w-32 bg-white/5 rounded-full"></div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-white/5 rounded-full"></div>
            <div className="h-10 w-40 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* HEADER SKELETON */}
        <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-32 h-32 bg-white/5 rounded-3xl shrink-0"></div>
          <div className="flex-1 w-full text-center md:text-left">
            <div className="h-12 w-64 bg-white/5 rounded-2xl mb-4 mx-auto md:mx-0"></div>
            <div className="h-5 w-48 bg-white/5 rounded-full mx-auto md:mx-0"></div>
          </div>
        </header>

        {/* GRID SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CATALOGO SKELETON */}
          <div className="lg:col-span-2 bg-white/5 rounded-3xl p-6 md:p-8 h-[600px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="h-8 w-48 bg-white/10 rounded-xl mb-2"></div>
                <div className="h-4 w-32 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-10 w-36 bg-white/10 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fake products */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[280px]">
                  <div>
                    <div className="w-full h-40 bg-white/10 rounded-xl mb-4"></div>
                    <div className="h-6 w-3/4 bg-white/10 rounded-lg mb-2"></div>
                    <div className="h-4 w-full bg-white/10 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GESTOR DE ORDENES SKELETON */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 h-[300px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl mb-5"></div>
              <div className="h-6 w-40 bg-white/5 rounded-xl mb-4"></div>
              <div className="h-4 w-full bg-white/5 rounded-full mb-2"></div>
              <div className="h-4 w-4/5 bg-white/5 rounded-full mb-8"></div>
              <div className="h-12 w-full bg-white/10 rounded-xl"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
