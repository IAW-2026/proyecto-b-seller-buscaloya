/*This is the component responsible for rendering the delete product button in the product list of the store dashboard.
It receives the product ID and store ID as props, and when the button is clicked,
it prompts the user for confirmation before proceeding with the deletion.
If the user confirms, it calls the deleteProductAction function, which handles the deletion logic on the server side. 
The button is styled with Tailwind CSS classes for a consistent look and feel.*/
"use client";

import { deleteProductAction } from "@/app/actions/products";

import { Trash2 } from "lucide-react";

export default function DeleteProductForm({ productId, storeId }: { productId: string, storeId: string }) {
  const deleteAction = deleteProductAction.bind(null, productId, storeId);

  return (
    <form action={deleteAction}>
      <button 
        type="submit" 
        className="bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg shadow-md backdrop-blur-sm transition-all"
        title="Eliminar Producto"
        onClick={(e) => {
          if (!window.confirm('¿Estás seguro de que querés eliminar este producto?')) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}