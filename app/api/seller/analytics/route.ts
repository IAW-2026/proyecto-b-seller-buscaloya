/*This route is the seller service microservice for the analytics module
it returns the top selling stores and the top selling product per store
and uses a service token for authentication.
*/
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        // 1. M2M Authorization(SELLER_API_KEY)
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token || token !== process.env.SELLER_API_KEY) {
            return NextResponse.json({
                error: "unauthorized",
                message: "La API Key proporcionada es inválida o no tiene permisos para este servicio del módulo Seller."
            }, { status: 401 });
        }

        // 2. Metric: Top selling stores based on total revenue 
        // Filters cancelled orders to reflect actual sales.
        const topStoresQuery = await db.execute(sql`
            SELECT 
                s.id as store_id,
                s.name as store_name,
                COUNT(DISTINCT p.id)::int as total_orders,
                SUM(pi.quantity * pi.price_at_purchase)::float as total_revenue
            FROM packages p
            JOIN stores s ON p.store_id = s.id
            JOIN package_items pi ON pi.package_id = p.id
            WHERE p.status != 'CANCELLED'
            GROUP BY s.id, s.name
            ORDER BY total_revenue DESC
        `);

        // 3. Metric: Top selling product per store based on total quantity sold
        // Uses a CTE (Common Table Expression) and ROW_NUMBER() to partition by store
        // and extract only the product number 1 in quantity of units sold.
        const topProductPerStoreQuery = await db.execute(sql`
            WITH product_sales AS (
                SELECT 
                    p.store_id,
                    pi.product_id,
                    pi.product_name,
                    SUM(pi.quantity)::int as total_quantity_sold,
                    SUM(pi.quantity * pi.price_at_purchase)::float as total_product_revenue,
                    ROW_NUMBER() OVER (
                        PARTITION BY p.store_id 
                        ORDER BY SUM(pi.quantity) DESC
                    ) as rank
                FROM packages p
                JOIN package_items pi ON pi.package_id = p.id
                WHERE p.status != 'CANCELLED'
                GROUP BY p.store_id, pi.product_id, pi.product_name
            )
            SELECT 
                s.name as store_name,
                ps.store_id,
                ps.product_id,
                ps.product_name,
                ps.total_quantity_sold,
                ps.total_product_revenue
            FROM product_sales ps
            JOIN stores s ON ps.store_id = s.id
            WHERE ps.rank = 1
            ORDER BY ps.total_quantity_sold DESC
        `);

        // Ensures reading compatibility according to the database driver resolved by Drizzle
        const top_selling_stores = Array.isArray(topStoresQuery) ? topStoresQuery : (topStoresQuery.rows || []);
        const top_product_per_store = Array.isArray(topProductPerStoreQuery) ? topProductPerStoreQuery : (topProductPerStoreQuery.rows || []);

        // 4. Unified response
        return NextResponse.json({
            module: "seller",
            top_selling_stores,
            top_product_per_store
        }, { status: 200 });

    } catch (error) {
        console.error("Error al calcular las analíticas de Seller:", error);
        return NextResponse.json({
            error: "internal_server_error",
            message: "Ocurrió un error inesperado al calcular las analíticas de las tiendas."
        }, { status: 500 });
    }
}