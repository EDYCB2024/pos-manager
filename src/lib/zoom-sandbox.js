/**
 * Zoom Venezuela Sandbox Tracking Service
 */

const API_BASE = '/api/zoom/sandbox';

export async function trackShipment(nro_guia) {
    if (!nro_guia) throw new Error('Número de guía es requerido');
    
    console.log(`[zoom-sandbox] Tracking guide ${nro_guia} at ${API_BASE}`);
    try {
        const response = await fetch(`${API_BASE}/track/${nro_guia}`);
        console.log(`[zoom-sandbox] Status: ${response.status}`);
        const data = await response.json();
        console.log(`[zoom-sandbox] Data:`, data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la consulta');
        }

        const successCode = data.codrespuesta || data.codResponse;
        const message = data.mensaje || data.messageResponse;
        
        // Detailed format: data.Shipment.infoZoom + data.Shipment.tracking
        if (data.Shipment && data.Shipment.infoZoom && successCode === "COD_000") {
            const info = data.Shipment.infoZoom;
            const tracking = data.Shipment.tracking || [];
            
            return {
                success: true,
                data: {
                    nro_guia: info.num_guiat || nro_guia,
                    estatus: info.estatus || 'Desconocido',
                    remitente: info.nom_rem || 'CANGURO AZUL CA',
                    destinatario: info.nom_des || '---',
                    origen: info.des_rem && info.des_rem !== '-' ? info.des_rem : '---',
                    destino: info.des_des && info.des_des !== '-' ? info.des_des : '---',
                    referencia: info.ref_cliente || '',
                    fecha_creacion: info.fec_cre || info.fec_env,
                    piezas: info.piezas || 1,
                    peso: info.peso || 0,
                    servicio: 'ZOOM ENCOMIENDAS',
                    historial: tracking.map(t => ({
                        fecha: t.fecha,
                        hora: t.hora || '--:--:--',
                        estatus: t.descripcion_estatus || t.est_rastreo,
                        ubicacion: t.ub_rastreo || '--',
                        observacion: t.sello
                    }))
                }
            };
        }

        // Fallback or Legacy: Array or entidadRespuesta
        const rawEvents = Array.isArray(data) ? data : (data.entidadRespuesta || []);
        const events = Array.isArray(rawEvents) ? rawEvents : [rawEvents];

        // Flexible success check: Zoom uses COD_000 for success and CODE_000 (among others) for errors
        if (successCode !== "COD_000" || (events.length === 0 && !data.Shipment)) {
            return {
                success: false,
                error: message || 'La guía no existe o no se ha podido recuperar información en el Sandbox.'
            };
        }

        if (events.length === 0) {
            return {
                success: false,
                error: 'No se encontraron movimientos para esta guía en el Sandbox.'
            };
        }

        // Map events to the tracking UI format
        const latestEvent = events[0];
        
        return {
            success: true,
            data: {
                nro_guia: latestEvent.guia || nro_guia,
                estatus: latestEvent.descripcion_estatus || 'Desconocido',
                remitente: 'CANGURO AZUL CA', 
                destinatario: latestEvent.receptor || '---',
                origen: 'CARACAS, DISTRITO CAPITAL',
                destino: '---',
                referencia: latestEvent.referencia,
                fecha_creacion: events[events.length - 1].fecha,
                piezas: 1,
                peso: 0, 
                servicio: 'ZOOM ENCOMIENDAS',
                historial: events.map(t => ({
                    fecha: t.fecha,
                    hora: t.hora || '--:--:--',
                    estatus: t.descripcion_estatus,
                    ubicacion: '--',
                    observacion: t.sello
                }))
            }
        };
    } catch (error) {
        console.error('Zoom Sandbox Tracking Error:', error);
        return {
            success: false,
            error: error.message || 'Error de conexión con el servidor de Zoom'
        };
    }
}
