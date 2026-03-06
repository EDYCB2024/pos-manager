import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { addDevicesBulk, MODELOS, CATEGORIAS, ESTATUSES_CASO, ESTATUSES_REPARACION, PROCESADORAS, TECNICOS } from '../store';
import './MassiveUpload.css';

export default function MassiveUpload({ onComplete }) {
    const [data, setData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setError('');

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = utils.sheet_to_json(ws);

                if (jsonData.length === 0) {
                    throw new Error('El archivo está vacío.');
                }

                // Basic validation and mapping
                const mappedData = jsonData.map((row, index) => ({
                    id: index,
                    fecha: row.Fecha || new Date().toISOString().slice(0, 10),
                    serial: String(row.Serial || '').trim(),
                    razon_social: String(row['Razón Social'] || row.RazonSocial || '').trim(),
                    aliado: row.Aliado || '',
                    modelo: row.Modelo || MODELOS[0],
                    rif: row.RIF || '',
                    ingreso: row.Ingreso || '',
                    falla_notificada: row['Falla Notificada'] || row.Falla || '',
                    categoria: row['Categoría'] || CATEGORIAS[0],
                    estatus_caso: row['Estatus Caso'] || ESTATUSES_CASO[0],
                    estatus: row['Estatus Reparación'] || row.Estatus || ESTATUSES_REPARACION[0],
                    procesadora: row.Procesadora || PROCESADORAS[0],
                    tecnico: row['Técnico'] || row.Tecnico || TECNICOS[0],
                    nro_guia: row['Nro de guia'] || row.Guia || '',
                }));

                setData(mappedData);
            } catch (err) {
                setError('Error al procesar el archivo: ' + err.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSave = async () => {
        if (data.length === 0) return;
        setLoading(true);
        setError('');
        try {
            // Validate required fields for all rows
            const invalidRow = data.find(d => !d.serial || !d.razon_social);
            if (invalidRow) {
                throw new Error(`La fila con serial ${invalidRow.serial || 'vacío'} no tiene Razón Social o Serial.`);
            }

            await addDevicesBulk(data);
            alert(`¡Éxito! Se han cargado ${data.length} casos.`);
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="massive-upload">
            <div className="upload-zone glass">
                <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    hidden
                />
                <label htmlFor="file-upload" className="upload-label">
                    <span className="upload-icon">📁</span>
                    {fileName ? <strong>{fileName}</strong> : "Seleccionar archivo Excel o CSV"}
                </label>
                <div className="upload-help">
                    Columnas requeridas: <strong>Serial, Razón Social</strong>.
                    Opcionales: Fecha, Aliado, Modelo, RIF, Falla Notificada, etc.
                </div>
            </div>

            {error && <div className="form-error" style={{ marginTop: '16px' }}>{error}</div>}

            {data.length > 0 && (
                <div className="preview-container glass anim-fadeIn" style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Vista previa de datos ({data.length} filas)</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Serial</th>
                                    <th>Razón Social</th>
                                    <th>Aliado</th>
                                    <th>Modelo</th>
                                    <th>Estatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 10).map(row => (
                                    <tr key={row.id}>
                                        <td>{row.serial}</td>
                                        <td>{row.razon_social}</td>
                                        <td>{row.aliado}</td>
                                        <td>{row.modelo}</td>
                                        <td>{row.estatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length > 10 && <p className="text-muted" style={{ padding: '8px', fontSize: '12px' }}>... y {data.length - 10} filas más.</p>}
                    </div>

                    <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button className="btn btn--ghost" onClick={() => setData([])}>Limpiar</button>
                        <button className="btn btn--primary" onClick={handleSave} disabled={loading}>
                            {loading ? "Cargando..." : `Procesar ${data.length} Casos`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
