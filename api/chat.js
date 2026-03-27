import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "./_tools/nexus-tools.js";
import { supabase } from "./_lib/supabase.js";
import { authMiddleware } from "./_lib/middleware.js";

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    const userId = req.user.id;

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

    const currentDate = new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTime = new Date().toLocaleTimeString('es-VE');

    const systemPrompt = `Eres Nexus AI, el asistente virtual oficial de POS Manager. 
    FECHA ACTUAL: ${currentDate}.
    HORA ACTUAL: ${currentTime}.

    ENTORNO:
    - Plataforma: POS Manager (Gestión de Punto de Venta).
    - Tecnologías: React, Supabase, Vercel, Node.js.
    
    CAPACIDADES (TIENES HERRAMIENTAS PARA):
    1. Buscar estatus de dispositivos por serial (get_device_status).
    2. Actualizar estatus o campos de un caso en Casos POS (update_device_status).
    3. Registrar nuevos ingresos de equipos en Casos POS (register_new_case).
    4. Procesar mensajes de clientes y registrar reportes en Bandeja ATC (register_atc_case).
    5. Rastrear envíos de Zoom Venezuela por número de guía (track_zoom_shipment).
    
    REGLAS IMPORTANTES:
    1. Si el usuario suministra datos de un cliente para la Bandeja ATC, usa register_atc_case.
    2. Si el usuario pide estatus de un serial, usa get_device_status.
    3. Si el usuario suministra datos para registrar un ingreso de equipo, usa register_new_case.
    4. Si el usuario pregunta por el rastreo o ubicación de un paquete/guía de Zoom, usa track_zoom_shipment.
    5. Guardamos automáticamente el historial para que recuerdes el contexto.
    6. Mantén un tono profesional, experto y conciso.`;

    // 1. Guardar el último mensaje del usuario en el historial
    const userMsg = messages[messages.length - 1];
    if (userMsg && userMsg.role === "user") {
      try {
        await supabase.from('chat_history').insert({
          user_id: userId,
          role: "user",
          content: userMsg.content
        });
      } catch (e) {
        console.warn("No se pudo guardar historial (tabla inexistente)");
      }
    }

    // Convertir historial a formato Core Messages
    const chatHistory = (messages || []).map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "assistant") return new AIMessage(msg.content);
      return new HumanMessage(msg.content);
    });

    // Separar el último mensaje como input
    const currentInput = chatHistory.pop();
    
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      messageModifier: new SystemMessage(systemPrompt),
    });

    const result = await agent.invoke({
      messages: [...chatHistory, currentInput],
    });

    const lastResultMsg = result.messages[result.messages.length - 1];
    const assistantContent = lastResultMsg.content || "Lo siento, no pude procesar tu solicitud.";

    // 2. Guardar la respuesta del asistente en el historial
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        role: "assistant",
        content: assistantContent
      });
    } catch (e) {
      console.warn("No se pudo guardar historial assistant (tabla inexistente)");
    }

    return res.status(200).json({ 
      role: "assistant", 
      content: assistantContent 
    });
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return res.status(500).json({ 
      error: error?.message || "Error interno en el agente Nexus"
    });
  }
}

export default authMiddleware(handler);
