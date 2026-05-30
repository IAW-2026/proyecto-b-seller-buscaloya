/* This file defines an API route for generating product descriptions using Google Generative AI.
It is designed to be used by authenticated sellers to create compelling descriptions for their products based on the product name
and optionally the category. The route handles POST requests, validates the input, interacts with the AI model, 
and returns the generated description in a JSON response. */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  // 1. Seguridad: Solo usuarios autenticados (Sellers)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productName, category } = await req.json();

    if (!productName) {
      return NextResponse.json({ error: "Falta el nombre del producto" }, { status: 400 });
    }

    // 2. Configurates the AI model (you can choose different models or parameters if needed)
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // 3. Makes the prompt for the AI, including the product name and optionally the category to get a more tailored description
    const prompt = `Actúa como un experto en marketing digital. Escribe una descripción atractiva, persuasiva y concisa (máximo 3 oraciones) para un producto llamado "${productName}"${category ? ` de la categoría "${category}"` : ""}. La descripción está orientada a clientes de una app de delivery.`;

    // 4. Calls the AI model to generate the content based on the prompt
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 5. Returns the generated description as a JSON response
    return NextResponse.json({ description: text }, { status: 200 });

  } catch (error) {
    console.error("Error generando descripción con IA:", error);
    return NextResponse.json({ error: "Error al generar la descripción" }, { status: 500 });
  }
}