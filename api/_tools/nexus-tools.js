import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "../_lib/supabase.js";

/**
 * Tool for looking up device status by serial number.
 */
export const getDeviceStatusTool = new DynamicStructuredTool({
  name: "get_device_status",
  description: "Busca un dispositivo por su serial para dar información del estatus actual y detalles del caso.",
  schema: z.object({
    serial: z.string().describe("El número de serial del dispositivo (POS)"),
  }),
  func: async ({ serial }) => {
    try {
      // Intentamos buscar por serial exacto primero
      const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .eq('serial', serial.trim())
        .order('id', { ascending: false }) // Suponiendo que el ID más alto es el más reciente
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return "No se encontró ningún caso para ese serial.";
        throw error;
      }
      return JSON.stringify(data);
    } catch (err) {
      return `Error al buscar el dispositivo: ${err.message}`;
    }
  },
});

/**
 * Tool to update status of a device case.
 */
export const updateDeviceStatusTool = new DynamicStructuredTool({
  name: "update_device_status",
  description: "Actualiza el estatus o campos específicos de un caso existente (buscado por serial).",
  schema: z.object({
    serial: z.string().describe("Serial del dispositivo"),
    estatus_caso: z.string().optional().describe("Estatus general ('Abierto'/'Cerrado')"),
    estatus: z.string().optional().describe("Estatus detalle ('Pendiente'/'Listo'/'Entregado')"),
    estatus_reparacion: z.string().optional().describe("Estatus técnico ('Reparado'/'Rechazado'/'En Revisión')"),
    observaciones: z.string().optional().describe("Nuevas observaciones para el técnico"),
  }),
  func: async ({ serial, ...updates }) => {
    try {
      // Buscamos el caso más reciente por serial
      const { data: latest, error: searchError } = await supabase
        .from('casos_pos')
        .select('id')
        .eq('serial', serial.trim())
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (searchError) throw searchError;

      const { data, error } = await supabase
        .from('casos_pos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', latest.id)
        .select()
        .single();

      if (error) throw error;
      return `Éxito: Se actualizó el caso ${data.id} para el serial ${serial}. Nuevos valores: ${Object.keys(updates).join(', ')}`;
    } catch (err) {
      return `Error al actualizar: ${err.message}`;
    }
  },
});

/**
 * Tool to register a new case in the database.
 */
export const registerDeviceInfoTool = new DynamicStructuredTool({
  name: "register_new_case",
  description: "Registra un nuevo ingreso/caso de dispositivo en la base de datos.",
  schema: z.object({
    serial: z.string().describe("Serial del equipo"),
    modelo: z.string().optional().describe("Modelo del equipo"),
    aliado: z.string().optional().describe("Nombre del aliado o cliente"),
    rif: z.string().optional().describe("RIF del cliente"),
    falla_notificada: z.string().optional().describe("Descripción de la falla"),
    razon_social: z.string().optional().describe("Razón social del cliente"),
  }),
  func: async (newCase) => {
    try {
      // Normalizar campos a mayúsculas
      const normalized = {
        ...newCase,
        aliado: newCase.aliado ? newCase.aliado.trim().toUpperCase() : undefined,
        serial: newCase.serial ? newCase.serial.trim().toUpperCase() : undefined,
        rif: newCase.rif ? newCase.rif.trim().toUpperCase() : undefined,
        modelo: newCase.modelo ? newCase.modelo.trim().toUpperCase() : undefined,
      };

      const { data, error } = await supabase
        .from('casos_pos')
        .insert([{
          ...normalized,
          fecha: new Date().toISOString().split('T')[0],
          estatus_caso: 'Abierto',
          estatus_reparacion: 'Pendiente',
          estatus: 'Pendiente',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return `Éxito: Nuevo caso registrado con ID ${data.id}.`;
    } catch (err) {
      return `Error al registrar: ${err.message}`;
    }
  },
});

/**
 * Tool to register a record in Histórico ATC (table 'data').
 */
export const registerAtcCaseTool = new DynamicStructuredTool({
  name: "register_atc_case",
  description: "Registra la información de un cliente en el Histórico ATC. Debe usarse cuando el usuario suministra datos de un reporte o falla (serial, rif, nombre comercio, afiliado, etc.) para ser procesados.",
  schema: z.object({
    serial: z.string().optional().describe("Serial del equipo"),
    rif: z.string().optional().describe("RIF del cliente"),
    nombre_comercio: z.string().optional().describe("Nombre del comercio o razón social"),
    afiliado: z.string().optional().describe("Número de afiliado (reportado en)"),
    falla_cliente: z.string().optional().describe("Descripción de la falla reportada por el cliente"),
    operadora: z.string().optional().describe("Operadora (Digitel, Movistar, etc.)"),
    proveedor_wifi: z.string().optional().describe("Proveedor de internet/wifi"),
    ciudad: z.string().optional().describe("Ciudad del cliente"),
    estado: z.string().optional().describe("Estado federal"),
    persona_contacto: z.string().optional().describe("Persona de contacto"),
    telefono_contacto: z.string().optional().describe("Teléfono de contacto"),
    observaciones: z.string().optional().describe("Observaciones adicionales"),
  }),
  func: async (atcCase) => {
    try {
      // Mapping to 'data' table columns
      const payload = {
        fecha: new Date().toISOString().split('T')[0],
        serial: atcCase.serial?.trim().toUpperCase(),
        rif: atcCase.rif?.trim().toUpperCase(),
        nombre_comercio: atcCase.nombre_comercio,
        reportado_en: atcCase.afiliado?.trim().toUpperCase(),
        falla_reportada_cliente: atcCase.falla_cliente,
        operadora: atcCase.operadora?.trim().toUpperCase(),
        proveedor_wifi: atcCase.proveedor_wifi,
        ciudad: atcCase.ciudad,
        estado: atcCase.estado,
        persona_contacto: atcCase.persona_contacto,
        telefono_contacto: atcCase.telefono_contacto,
        observaciones: atcCase.observaciones,
        hora_de_reporte: new Date().toTimeString().split(' ')[0],
        estatus_caso: 'Abierto'
      };

      const { data, error } = await supabase
        .from('data')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return `Éxito: Caso ATC registrado en el histórico con ID ${data.internal_id}.`;
    } catch (err) {
      return `Error al registrar en ATC: ${err.message}`;
    }
  },
});

/**
 * Tool to get reports for specific days.
 */
export const getDailyReportTool = new DynamicStructuredTool({
  name: "get_daily_report",
  description: "Obtiene un reporte o resumen de casos para un día o rango de días específico.",
  schema: z.object({
    startDate: z.string().describe("Fecha de inicio (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("Fecha de fin (YYYY-MM-DD)"),
    service: z.enum(['atc', 'pos']).describe("Servicio del reporte: 'atc' (tabla data) o 'pos' (tabla casos_pos)")
  }),
  func: async ({ startDate, endDate, service }) => {
    try {
      const table = service === 'atc' ? 'data' : 'casos_pos';
      const lastDate = endDate || startDate;
      
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .gte('fecha', startDate)
        .lte('fecha', lastDate);

      if (error) throw error;

      if (!data || data.length === 0) return `No se encontraron registros para el periodo ${startDate} a ${lastDate} en ${service}.`;

      // Summary
      const summary = data.reduce((acc, curr) => {
        const status = curr.estatus_caso || 'Indefinido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return JSON.stringify({
        total: count,
        periodo: `${startDate} al ${lastDate}`,
        resumen_estatus: summary,
        ejemplos: data.slice(0, 3).map(d => ({
          serial: d.serial,
          comercio: d.nombre_comercio || d.razon_social,
          fecha: d.fecha
        }))
      }, null, 2);
    } catch (err) {
      return `Error al generar reporte: ${err.message}`;
    }
  }
});

/**
 * Tool to track a Zoom Venezuela shipment.
 */
export const trackZoomShipmentTool = new DynamicStructuredTool({
  name: "track_zoom_shipment",
  description: "Rastrea un envío de Zoom Venezuela usando el número de guía para obtener estatus, destinatario e historial de movimientos.",
  schema: z.object({
    nro_guia: z.string().describe("El número de guía de Zoom (ej: 71090585)"),
  }),
  func: async ({ nro_guia }) => {
    try {
      const url = `https://sandbox.zoom.red/baaszoom/public/canguroazul/getZoomTrackWs?tipo_busqueda=1&web=1&codigo=${nro_guia.trim()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.Shipment && data.Shipment.infoZoom) {
        const info = data.Shipment.infoZoom;
        const tracking = data.Shipment.tracking || [];
        
        return JSON.stringify({
          guia: info.num_guiat,
          estatus_actual: info.estatus,
          destinatario: info.nom_des,
          remitente: info.nom_rem,
          fecha_envio: info.fec_env,
          peso: info.peso,
          historial_reciente: tracking.slice(0, 3).map(t => ({
            fecha: t.fecha,
            estatus: t.descripcion_estatus,
            ubicacion: t.ub_rastreo
          }))
        }, null, 2);
      }

      return `No se encontró información para la guía ${nro_guia}. Zoom reportó: ${data.mensaje || 'Información no encontrada'}`;
    } catch (err) {
      return `Error al conectar con Zoom: ${err.message}`;
    }
  },
});

export const tools = [getDeviceStatusTool, updateDeviceStatusTool, registerDeviceInfoTool, registerAtcCaseTool, getDailyReportTool, trackZoomShipmentTool];
