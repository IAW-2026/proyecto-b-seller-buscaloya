/*This file defines the validation schemas for product and store data using the Zod library.
These schemas are used to ensure that the data submitted through forms meets the required criteria
before being processed or stored in the database. The productSchema validates fields related to products, 
while the storeSchema validates fields related to the store's information. 
Both schemas include specific rules for each field, such as minimum lengths, valid URLs, and proper formatting
for numbers and emails.*/
import { z } from "zod";

// Validation schema for product creation and editing
export const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  // z.coerce transforms the input to a number, which allows us to handle cases where the input is a string (e.g., from a form) and ensures that it is a valid number before applying the min validation.
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  imageUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional(),
});

// Validation schema for store information updating
export const storeSchema = z.object({
  name: z.string().min(2, "El nombre de la tienda es obligatorio"),
  email: z.string().email("Debe ser un email válido"),
  category: z.string().min(2, "La categoría es obligatoria"),
  imageUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional(),
  address: z.string().min(5, "La dirección debe ser más específica"),
  // If the string is empty, it transforms to null; otherwise, it parses to a float
  lat: z.string().optional().transform((val) => (val ? parseFloat(val) : null)),
  lng: z.string().optional().transform((val) => (val ? parseFloat(val) : null)),
});