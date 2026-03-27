/**
 * Zoom Venezuela Production Tracking Service
 * Based on Eitol/zoom-red-tracking implementation
 */

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/zoom' : '/api/zoom';

export async function trackShipment(nro_guia) {
    if (!nro_guia) throw new Error('Número de guía es requerido');
    
    try {
        const response = await fetch(`${API_BASE}/track/${nro_guia}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Error en la consulta');

        // Check for common Zoom response codes from Eitol library
        if (data.Mensaje === "INFORMACION NO EXISTE EN BASE DE DATOS") {
            return {
                success: false,
                error: 'Este número de guía no existe en la base de datos de Zoom.'
            };
        }

        if (data.Mensaje !== "CONSULTA REALIZADA EXITOSAMENTE") {
            return {
                success: false,
                error: data.Mensaje || 'Error al obtener información de seguimiento.'
            };
        }

        const ship = data.Shipment;
        if (!ship) throw new Error('Información de envío no disponible');

        // Map fields based on tracking_dto.go
        return {
            success: true,
            data: {
                nro_guia: ship.infoZoom?.Nroguia || nro_guia,
                estatus: ship.tracking?.[0]?.Estatus?.Nombre || 'Desconocido',
                remitente: ship.infoZoom?.Remitente?.Nombre,
                destinatario: ship.infoZoom?.Destino?.Nombre,
                origen: `${ship.infoZoom?.Remitente?.Ciudad}, ${ship.infoZoom?.Remitente?.Estado}`,
                destino: `${ship.infoZoom?.Destino?.Ciudad}, ${ship.infoZoom?.Destino?.Estado}`,
                referencia: ship.infoZoom?.Nroguia,
                fecha_creacion: ship.infoZoom?.Fechaguia,
                piezas: ship.infoZoom?.Nropiezas,
                peso: ship.infoZoom?.Peso,
                servicio: ship.infoZoom?.Nombreservicio,
                historial: (ship.tracking || []).map(t => ({
                    fecha: t.Fecha,
                    hora: t.Hora,
                    estatus: t.Estatus?.NombreWeb || t.Estatus?.Nombre,
                    ubicacion: `${t.Ciudad}, ${t.Estado}`,
                    observacion: t.Observacion
                }))
            }
        };
    } catch (error) {
        console.error('Zoom PROD Tracking Error:', error);
        return {
            success: false,
            error: error.message || 'Error de conexión con el servidor de Zoom'
        };
    }
}
