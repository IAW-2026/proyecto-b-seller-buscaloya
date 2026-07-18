/*This file defines the validation schemas for product and store data using the Zod library.
These schemas are used to ensure that the data submitted through forms meets the required criteria
before being processed or stored in the database. The productSchema validates fields related to products, 
while the storeSchema validates fields related to the store's information. 
Both schemas include specific rules for each field, such as minimum lengths, valid URLs, and proper formatting
for numbers and emails.*/
import { z } from "zod";

// Validation schema for product creation and editing
export const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder los 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder los 500 caracteres").optional(),
  // z.coerce transforms the input to a number, which allows us to handle cases where the input is a string (e.g., from a form) and ensures that it is a valid number before applying the min validation.
  price: z.union([z.string(), z.number()])
    .refine(val => val !== "" && !isNaN(Number(val)), { message: "El precio debe ser un número válido" })
    .transform(val => Number(val))
    .pipe(
      z.number()
        .min(0, "El precio no puede ser negativo")
        .max(1000000000, "El precio es demasiado alto")
    ),
  stock: z.union([z.string(), z.number()])
    .refine(val => val !== "" && !isNaN(Number(val)), { message: "El stock debe ser un número válido" })
    .transform(val => Number(val))
    .pipe(
      z.number()
        .min(0, "El stock no puede ser negativo")
        .max(1000000, "El stock es demasiado alto")
        .refine(val => Number.isInteger(val), "El stock debe ser un número entero")
    ),
  imageUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional(),
});

// Validation schema for store information updating
export const storeSchema = z.object({
  name: z.string().min(2, "El nombre de la tienda es obligatorio").max(100, "El nombre no puede exceder los 100 caracteres"),
  email: z.string().email("Debe ser un email válido").max(255, "El email es demasiado largo"),
  category: z.string().min(2, "La categoría es obligatoria").max(50, "La categoría no puede exceder los 50 caracteres"),
  imageUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional(),
  address: z.string().min(5, "La dirección debe ser más específica").max(255, "La dirección no puede exceder los 255 caracteres"),
  // If the string is empty, it transforms to null; otherwise, it parses to a float
  lat: z.string().optional().transform((val) => (val ? parseFloat(val) : null)),
  lng: z.string().optional().transform((val) => (val ? parseFloat(val) : null)),
});