import { pgTable, serial, text, integer, uuid, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS ---
export const packageStatusEnum = pgEnum("package_status", [
  "PREPARING", 
  "READY_TO_PICKUP", 
  "IN_TRANSIT", 
  "DELIVERED",
  "CANCELLED"
]);

//---Main tables (stores and products)---

export const stores = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  address: text("address"),
  lat: real("lat"),
  lng: real("lng"),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"), 
  price: real("price").notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url"), 
  storeId: text("store_id")
    .references(() => stores.id, { onDelete: 'cascade' }) 
    .notNull(),
});

//---Transactional tables (packages and package_items)---

export const packages = pgTable("packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentOrderId: text("payment_order_id").notNull(), 
  storeId: text("store_id").references(() => stores.id).notNull(), 
  buyerId: text("buyer_id").notNull(), 
  buyerAddress: text("buyer_address").notNull(), 
  shippingCost: real("shipping_cost").notNull(), 
  deliveryTripId: text("delivery_trip_id"), 
  status: packageStatusEnum("status").default("PREPARING").notNull(),
});

export const packageItems = pgTable("package_items", {
  id: serial("id").primaryKey(),
  packageId: uuid("package_id").references(() => packages.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid("product_id").references(() => products.id),
  productName: text("product_name").notNull(), 
  quantity: integer("quantity").notNull(),
  priceAtPurchase: real("price_at_purchase").notNull(), 
});


//---Relations---
export const packagesRelations = relations(packages, ({ one }) => ({
  store: one(stores, {
    fields: [packages.storeId],
    references: [stores.id],
  }),
}));