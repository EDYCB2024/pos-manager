/**
 * SCRIPT PARA GOOGLE APPS SCRIPT
 * Proyecto: POS MANAGER - Sincronizador de Casos
 * 
 * INSTRUCCIONES:
 * 1. En tu Google Sheet, ve a: Extensiones > Apps Script.
 * 2. Borra todo el código que haya y pega este.
 * 3. Configura los valores SUPABASE_URL y SUPABASE_KEY abajo.
 * 4. Guarda con el nombre "Sincronizador Supabase" y presiona "Ejecutar > onOpen".
 * 
 * CABECERAS RECOMENDADAS (en la primera fila de tu Excel):
 * Fecha, Aliado, Modelo, Razon Social, Serial, Rif, Ingreso, Serial Reemplazo,
 * Falla Notificada, Categoria, Fecha Final, Estatus Caso, Estatus, Nivel, 
 * Garantia, Informe, Cotizacion, Repuesto 1, Repuesto 2, Repuesto 3, 
 * Procesadora, Tecnico, Sync Status
 */

// --- CONFIGURACIÓN ---
const CONFIG = {
    SUPABASE_URL: "https://vbqcahlqszcfqhlfmutq.supabase.co",
    SUPABASE_KEY: "YOUR_SUPABASE_SERVICE_ROLE_KEY", // Recomiendo usar SERVICE_ROLE_KEY para ignorar RLS en inserciones masivas
    TABLE_NAME: "casos_pos",
    SHEET_NAME: "Casos" // Cambia esto si tu hoja tiene otro nombre
};

/**
 * Crea un menú personalizado en Google Sheets al abrir el archivo.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🛠️ Supabase')
        .addItem('🚀 Sincronizar Casos Nuevos', 'syncNewCases')
        .addToUi();
}

/**
 * Función principal para sincronizar datos.
 */
function syncNewCases() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
        SpreadsheetApp.getUi().alert('Error: No se encontró la hoja "' + CONFIG.SHEET_NAME + '"');
        return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // La primera fila son los encabezados
    const rows = data.slice(1); // El resto son los datos

    // Buscamos la columna de "Estatus Sinc" (opcional para no repetir)
    // Si no existe, el script intentará subir todo.
    const syncColIdx = headers.indexOf('Sync Status');

    const casesToPush = [];
    const rowsToUpdate = [];

    rows.forEach((row, index) => {
        // Si tenemos una columna de Sync Status y ya dice "OK", saltamos
        if (syncColIdx !== -1 && row[syncColIdx] === 'OK') return;

        // Mapeo dinámico basado en encabezados
        const payload = {};
        headers.forEach((header, i) => {
            if (header && header !== 'Sync Status') {
                // Convertimos el encabezado a minúsculas y snake_case para que coincida con la DB
                const dbField = header.toLowerCase().replace(/ /g, '_');
                let value = row[i];

                // --- TRATAMIENTO DE DATOS ---
                // Si el valor está vacío, lo tratamos para evitar errores de Supabase
                if (value === "" || value === null || value === undefined) {
                    if (dbField === 'fecha' || dbField === 'fecha_final') {
                        value = null; // Fechas obligatoriamente null si están vacías
                    } else if (dbField === 'estatus_caso') {
                        value = 'Abierto'; // Default de la DB
                    } else if (dbField === 'estatus') {
                        value = 'Pendiente'; // Default de la DB
                    } else {
                        value = ""; // Para campos de texto, "" evita errores de NOT NULL
                    }
                }

                payload[dbField] = value;
            }
        });

        casesToPush.push(payload);
        rowsToUpdate.push(index + 2); // Guardamos el número de fila real (1-indexed + header)
    });

    if (casesToPush.length === 0) {
        SpreadsheetApp.getUi().alert('No hay casos nuevos para sincronizar.');
        return;
    }

    // --- ENVIAR A SUPABASE POR LOTES (BATCHING) ---
    const BATCH_SIZE = 500;
    let syncedCount = 0;

    // Obtenemos los valores actuales de la columna de Sync Status para actualizarlos en lote
    let statusValues = [];
    if (syncColIdx !== -1) {
        statusValues = sheet.getRange(2, syncColIdx + 1, rows.length, 1).getValues();
    }

    for (let i = 0; i < casesToPush.length; i += BATCH_SIZE) {
        const batch = casesToPush.slice(i, i + BATCH_SIZE);
        const rowsBatchIndices = rowsToUpdate.map((num, idx) => idx).slice(i, i + BATCH_SIZE);

        const options = {
            method: 'post',
            contentType: 'application/json',
            headers: {
                'apikey': CONFIG.SUPABASE_KEY,
                'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            payload: JSON.stringify(batch),
            muteHttpExceptions: true
        };

        try {
            const response = UrlFetchApp.fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLE_NAME}`, options);
            const code = response.getResponseCode();

            if (code >= 200 && code < 300) {
                // Preparamos la actualización masiva en memoria para este lote
                if (syncColIdx !== -1) {
                    rowsBatchIndices.forEach(idxInRows => {
                        const originalRowIndex = rowsToUpdate[idxInRows] - 2; // Índice en la tabla rows (data real)
                        statusValues[originalRowIndex][0] = 'OK';
                    });

                    // Escribimos el progreso al Excel de golpe para este lote
                    sheet.getRange(2, syncColIdx + 1, statusValues.length, 1).setValues(statusValues);
                }

                syncedCount += batch.length;
                Utilities.sleep(100);
            } else {
                SpreadsheetApp.getUi().alert(`Error en lote (fila ${rowsToUpdate[i]}): ` + response.getContentText());
                break;
            }
        } catch (e) {
            SpreadsheetApp.getUi().alert('Error de conexión: ' + e.toString());
            break;
        }
    }

    if (syncedCount > 0) {
        SpreadsheetApp.getUi().alert(`🚀 Sincronización Completa!\n\nSe subieron ${syncedCount} casos correctamente.`);
    }
}
