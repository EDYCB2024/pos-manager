# POS Manager & Technical Support System (Nexus)

## Descripción del Proyecto
Este es un sistema integral de **gestión de puntos de venta (POS) y soporte técnico (ATC)** diseñado para optimizar el flujo de trabajo de empresas de servicios técnicos y logística. El núcleo del sistema es la centralización del inventario de dispositivos, el seguimiento de reparaciones y un módulo avanzado de atención al cliente, todo potenciado por un **asistente de inteligencia artificial (Nexus)**.

### Propósito Principal
Automatizar y organizar el ciclo de vida de los dispositivos POS: desde su ingreso a servicio técnico, el reporte de fallas por parte del cliente, la reparación técnica, hasta el envío final y seguimiento de la entrega al comercio.

---

## Características Principales
1.  **Dashboard Operativo:** Visualización en tiempo real de métricas críticas (casos abiertos, reparaciones listas, entregas pendientes).
2.  **Gestión de Casos ATC:** Módulo especializado para el registro y seguimiento de incidencias reportadas por clientes, con filtrado avanzado e histórico.
3.  **Seguimiento Global (Tracking):** Integración con la API de **17track** para el rastreo en tiempo real de múltiples transportistas, permitiendo ver el historial completo de envíos desde la plataforma.
4.  **Nexus AI Assistant:** Un asistente inteligente integrado que utiliza **IA Generativa** para:
    *   Registrar nuevos casos mediante lenguaje natural.
    *   Consultar el estatus de un equipo por serial.
    *   Generar reportes diarios automáticos.
5.  **Administración de Dispositivos:** Control detallado de seriales, modelos, aliados comerciales y estatus técnicos (Pendiente, En Revisión, Reparado).

---

## Stack Tecnológico

### Frontend (Modern UI/UX)
*   **React + Vite:** Para una experiencia de usuario rápida y reactiva.
*   **CSS Dinámico:** Interfaz minimalista estilo SaaS (inspirada en Stripe/Linear) con alta densidad de información.
*   **Componentes Modulares:** Arquitectura basada en componentes reutilizables para escalabilidad.

### Backend & Infraestructura (BaaS)
*   **Supabase:** Utilizado como motor principal de base de datos (**PostgreSQL**), sistema de **Autenticación** y almacenamiento de archivos.
*   **Node.js (API Routes):** Funciones serverless para el manejo de lógica compleja y proxies de APIs.

### Inteligencia Artificial (AI Stack)
*   **LangChain:** Orquestación del agente inteligente.
*   **Gemini / Vertex AI:** Modelos de lenguaje de última generación para procesamiento de lenguaje natural.
*   **Function Calling (Tools):** Integración directa entre la IA y la base de datos para ejecución de comandos.

### Integraciones Externas
*   **17track API:** Para el sistema de rastreo global multicarrier.
*   **Zoom Venezuela API:** (Legacy/Parallel) Para logística local específica.
*   **Lucide React:** Sistema de iconografía profesional.
