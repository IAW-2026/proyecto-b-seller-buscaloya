"use client";

export default function DeleteButton() {
  return (
    <button 
      type="submit"
      className="inline-flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white p-1.5 rounded transition-all"
      onClick={(e) => {
        if (!confirm('¿Estás seguro de eliminar esta tienda y todos sus productos?')) {
          e.preventDefault();
        }
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg>
    </button>
  );
}