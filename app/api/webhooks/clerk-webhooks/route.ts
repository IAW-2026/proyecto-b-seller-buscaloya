/*This API route is responsible for handling incoming webhooks from Clerk. 
When a new user is created in Clerk, this route listens for the 'user.created' event
and creates a new store in our database with the user's information.
The store ID is set to be the same as the Clerk user ID for easy association between the two systems.
This allows us to automatically create a store for each new user that registers through Clerk, 
streamlining the onboarding process for new sellers on our platform.*/

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { stores } from '@/db/schema'

export async function POST(req: Request) {
  // 1. Obtains the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Falta el CLERK_WEBHOOK_SECRET')
  }

  // 2. Obtains the necessary headers for signature verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: faltan headers de svix', { status: 400 })
  }

  // 3. Obtains the raw body of the request as a string for signature verification
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // 4. Validates the webhook signature using the svix library
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verificando webhook:', err);
    return new Response('Error verificando', { status: 400 })
  }

  // 5. Manage the event based on its type. In this case, we listen for 'user.created' to create a new store in our database.
  const eventType = evt.type;

 if (eventType === 'user.created') {
  const { id, email_addresses, first_name, last_name } = evt.data;
  const primaryEmail = email_addresses?.[0]?.email_address || "";
  const fullName = `${first_name || 'Tienda de'} ${last_name || ''}`.trim();
    
  // Usamos upsert para evitar errores de duplicidad
  await db.insert(stores)
    .values({
      id: id as string, 
      name: fullName,
      email: primaryEmail,
      category: "General", 
    })
    .onConflictDoUpdate({
      target: stores.email, // Esta es la columna que tiene el UNIQUE constraint
      set: {
        name: fullName,
        // Puedes agregar más campos aquí si quieres que se sincronicen
      }
    });

  console.log(`Tienda sincronizada para el usuario ${id}`);
  }
return new Response('Webhook procesado', { status: 200 })
}