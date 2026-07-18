[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mlS0D64r)
# seller

Aplicación **Seller** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `<!-- completar -->`.

Esta app corresponde al rol del vendedor en los proyectos de tipo **B (Delivery)** y **C (Marketplace)**.

---
##  Descripción General
Somos la aplicación de tipo **B (Delivery)** **BuscaloYa** (estilo PedidosYa). En mi caso, me tocó desarrollar el **Módulo Seller** (que en esta aplicación cumple un rol de orquestador, al recibir los pedidos y consultas de un comprador del **Módulo Buyer**, así como la comunicación con los otros módulos para toda la lógica de estimación de costos de envío, emisión de ordenes de pago y manejo y control de estado de los paquetes (**Módulo Delivery** y **Módulo Payments**)).

El **Módulo Seller** es el portal de autogestión para los comercios adheridos a la plataforma. Esta aplicación permite a los dueños de locales administrar su presencia en el ecosistema, gestionar su catálogo y ubicación, y a los administradores del sistema moderar la red de comercios.

##  Características Principales
* **Autenticación y Roles Seguros:** Sistema de acceso protegido con jerarquías claras (Propietarios de tiendas vs. Administradores Globales).
* **Gestión de Tienda y Geolocalización:** Configuración de perfil comercial y fijación de coordenadas exactas de retiro en un mapa interactivo (Mapbox).
* **Gestión de Catálogo (CRUD):** Creación, actualización y eliminación de artículos con control de stock, precio e imágenes.
* **Generación de Contenido con IA:** Integración de un asistente inteligente para redactar descripciones de productos de forma automática.
* **Panel Global de Administración (Backoffice):** Interfaz exclusiva para que el staff de la plataforma pueda monitorear, editar o dar de baja tiendas problemáticas.
* **UI/UX:** Interfaz responsiva, fluida y de alto contraste, diseñada para que la carga de datos sea rápida y sin fricciones.

##  Tecnologías Utilizadas
* **Core:** Next.js (App Router) & React
* **Estilos:** Tailwind CSS 
* **Base de Datos:** Drizzle ORM, Vercel y Neon
* **Autenticación:** Clerk
* **Adicionales:** Mapbox GL JS, API Gemini 3.5 Flash(Generación de descripciones en productos), Svix y Zod

## Cuentas para testing
* **Usuario tester:** seller+clerktest@iaw.com (contraseña: iawuser#).
* **Usuario admin:** admin@iaw.com (contraseña: admin_IAW_2026).
## Link del sitio 
* **Link:** https://proyecto-b-seller-buscaloya.vercel.app/
## Uso para el testeo
* **Autenticación:** En la landing page están los botones de **Sign in** y **Sign up**.
* **Sección página Seller:** Luego de autenticar, el usuario es redirigido a la página principal de Seller.
* **Gestión de productos:** En la página de Seller, se pueden crear, editar y eliminar productos.
* **Aclaración en CRUD de productos:** Los campos de imagen y descripción de los productos son opcionales
* **Herramienta adicional:** En la edición y creación de productos, se cuenta con una IA generativa de texto opcional para las descripciones de los mismos.
* **Menú de edición de la Store:** En "Editar Perfil" se pueden editar los campos de la propia Store (mapbox interactivo para dirección de la store).
* **Rol de administrador:** Si se hace **Sign in** como admin, el usuario es redirigido a la página de Admin. En dicha página se encuentra un listado de todas las stores del sistema. El administrador puede eliminarlas, o acceder a la página de cada una y tener el mismo control y acceso que el seller asociado a esa store (CRUD de productos y edición de la store).

> **Nota sobre la Fase 2:** Actualmente, la aplicación maneja la lógica interna del comercio. Los endpoints de la misma se prueban de la siguiente forma:
* **GET /api/stores:** poniendo la URL **/api/stores** (estando previamente autenticado con Clerk).
* **GET /api/stores/{id}/catalog:** poniendo la URL **/api/stores/"id_clerk/catalog** (estando previamente autenticado con Clerk).
* **POST /api/seller/orders:** en la URL **/test-buyer** en el botón **Simular Compra Buyer** (estando previamente autenticado con Clerk).
* **PATCH /api/seller/orders/{id}/payment-status:** en la URL **/test-buyer** luego de simular la compra, en **Disparar Webhook de Pago**.
(Extra)* **POST /delivery-requests:** (endpoint de Delivery) en la URL **/test-buyer**, luego de simular la compra y disparar el Webhook de Pago exitoso, en **Llamar Repartidor(Despachar)** (cambiará el estado de los packages en la DB).
---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
