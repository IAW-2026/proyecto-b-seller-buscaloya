/*Testing the connection to the database and fetching data from the "products" table.*/
import { db } from "@/db";
import { products } from "@/db/schema"; 

export default async function TableTest() {
  // Select directo, sin vueltas
  const todosLosProductos = await db.select().from(products);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-black">Datos en Neon DB:</h2>
      {todosLosProductos.length === 0 ? (
        <p className="text-gray-500 italic text-black">Conectado, pero la tabla está vacía.</p>
      ) : (
        <pre className="text-xs text-blue-600 bg-white p-2 border">
          {JSON.stringify(todosLosProductos, null, 2)}
        </pre>
      )}
    </div>
  );
}