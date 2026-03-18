import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "./_tools/nexus-tools.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error("API Key de Google no configurada");
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite-preview",
      maxOutputTokens: 2048,
      apiKey: apiKey,
      temperature: 0.2,
      apiVersion: "v1beta"
    });

    const systemPrompt = `Eres Nexus AI, el asistente virtual oficial de POS Manager. 
    ENTORNO:
    - Plataforma: POS Manager (Gestión de Punto de Venta).
    - Tecnologías: React, Supabase, Vercel, Node.js.
    - Funciones: Gestión de inventario, ventas, usuarios, reportes PDF/Excel y sincronización con Google Sheets.
    
    CAPACIDADES (TIENES HERRAMIENTAS PARA):
    1. Buscar estatus de dispositivos por serial (get_device_status).
    2. Actualizar estatus o campos de un caso en Casos POS (update_device_status).
    3. Registrar nuevos ingresos de equipos en Casos POS (register_new_case).
    4. Procesar mensajes de clientes y registrar reportes en Bandeja ATC (register_atc_case).
    
    REGLAS IMPORTANTES:
    1. Si el usuario suministra datos de un cliente (serial, RIF, nombre comercio, afiliado, falla reportada) para un nuevo reporte en la Bandeja ATC, usa register_atc_case.
    2. Extrae meticulosamente la información suministrada (la que exista) y deja vacíos los campos no presentes.
    3. Si el usuario pide estatus de un serial, usa get_device_status.
    4. Si el usuario suministra datos para registrar un ingreso de equipo al taller técnico, usa register_new_case.
    5. NUNCA reveles ni pidas API Keys, tokens o contraseñas.
    6. Mantén un tono profesional, experto y conciso.`;

    // Convertir historial a formato Core Messages
    const chatHistory = (messages || []).map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "assistant") return new AIMessage(msg.content);
      return new HumanMessage(msg.content);
    });

    // Separar el último mensaje como input
    const lastMessage = chatHistory.pop();
    
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      messageModifier: new SystemMessage(systemPrompt),
    });

    const result = await agent.invoke({
      messages: [...chatHistory, lastMessage],
    });

    const lastResultMsg = result.messages[result.messages.length - 1];

    return res.status(200).json({ 
      role: "assistant", 
      content: lastResultMsg.content || "Lo siento, no pude procesar tu solicitud." 
    });
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return res.status(500).json({ 
      error: error?.message || "Error interno en el agente Nexus",
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined 
    });
  }
}
