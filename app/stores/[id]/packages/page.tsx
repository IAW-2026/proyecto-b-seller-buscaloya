/*This is the page that will show all the packages for a store and the states of them,
using drizzle and clerk */

import { db } from "@/db";
import { stores, packages, packageItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import DispatchButton from "@/app/components/DispatchButton";

interface PackagesPageProps {
    params: Promise<{ id: string }>
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: "Pago Pendiente", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    PREPARING: { label: "En Preparación", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    READY_TO_PICKUP: { label: "Listo para Retiro", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    IN_TRANSIT: { label: "En Camino", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    DELIVERED: { label: "Entregado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    CANCELLED: { label: "Cancelado", color: "bg-red-500/20 text-red-500 border-red-500/30" },
};

export default async function StorePackagesPage({ params }: PackagesPageProps) {
    const { id: storeId } = await params;
    const { userId, sessionClaims } = await auth();

    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "system_admin" || role === "admin";
    const isOwner = userId === storeId;

    if (!isOwner && !isAdmin) {
        notFound();
    }

    const storeData = await db.query.stores.findFirst({
        where: eq(stores.id, storeId),
    });

    if (!storeData) notFound();

    const storePackages = await db.select().from(packages).where(eq(packages.storeId, storeId));

    let allItems: any[] = [];
    if (storePackages.length > 0) {
        const pkgIds = storePackages.map(p => p.id);
        allItems = await db.select().from(packageItems).where(inArray(packageItems.packageId, pkgIds));
    }

    const packagesWithItems = storePackages.map(pkg => ({
        ...pkg,
        items: allItems.filter(item => item.packageId === pkg.id)
    })).reverse();

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <Link href={`/stores/${storeId}`} className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors font-medium tracking-wide bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5">
                        ← Volver al Dashboard
                    </Link>
                    <div className="flex items-center gap-4 p-2 pl-5 pr-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
                        <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">
                            {isAdmin ? "Administrador" : "Propietario"}
                        </span>
                        <div className="scale-110"><UserButton /></div>
                    </div>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-3">Gestor de <span className="text-red-500">Órdenes</span></h1>
                    <p className="text-gray-400 text-lg">Monitoreá el estado de los paquetes y despachos de <strong className="text-white">{storeData.name}</strong>.</p>
                </header>

                {packagesWithItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white">No hay órdenes registradas</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {packagesWithItems.map((pkg) => {
                            const style = STATUS_STYLES[pkg.status] || { label: pkg.status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
                            const itemsTotal = pkg.items.reduce((acc: number, item: any) => acc + (item.priceAtPurchase * item.quantity), 0);
                            const orderTotal = itemsTotal + pkg.shippingCost;

                            return (
                                <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col h-full">

                                    {/* ENCABEZADO: ID y Estado */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Orden</p>
                                            <h3 className="text-lg font-mono font-bold text-white truncate max-w-[150px]" title={pkg.paymentOrderId}>
                                                {pkg.paymentOrderId.split('-')[0]}...
                                            </h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.color}`}>
                                            {style.label}
                                        </span>
                                    </div>

                                    {/* INFO DEL CLIENTE */}
                                    <div className="mb-5 pb-5 border-b border-white/10">
                                        <p className="text-sm font-medium text-white">{pkg.buyerName || "Cliente sin nombre"}</p>
                                        <p className="text-xs text-gray-400 mt-1">{pkg.buyerPhone}</p>
                                        <p className="text-xs text-gray-400 mt-1 truncate" title={pkg.buyerAddress}>{pkg.buyerAddress}</p>
                                    </div>

                                    {/* LISTA DE PRODUCTOS */}
                                    <div className="flex-grow mb-5">
                                        <h4 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Productos ({pkg.items.length})</h4>
                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {pkg.items.length > 0 ? (
                                                pkg.items.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className="text-white/50 font-mono text-xs">{item.quantity}x</span>
                                                            <span className="text-gray-300 truncate" title={item.productName}>{item.productName}</span>
                                                        </div>
                                                        <span className="text-white font-medium pl-2">${item.priceAtPurchase * item.quantity}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">No hay productos registrados.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* TOTALES */}
                                    <div className="bg-black/30 rounded-2xl p-4 mb-4 border border-white/5">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Envío</span>
                                            <span>${pkg.shippingCost}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-white mt-2 pt-2 border-t border-white/10">
                                            <span>Total a cobrar</span>
                                            <span className="text-red-400">${orderTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* BOTÓN DE DESPACHO */}
                                    <div className="mt-auto pt-2">
                                        {pkg.status === "PREPARING" && <DispatchButton packageId={pkg.id} />}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}