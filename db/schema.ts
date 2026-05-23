import { pgTable, serial, text, integer, uuid, real } from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
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