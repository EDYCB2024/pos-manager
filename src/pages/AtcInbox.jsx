import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AtcInbox.css';

export default function AtcInbox() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Headers requested by the user
    const headers = [
        '#', 'FECHA', 'SERIAL', 'OPERADORA', 'PROVEEDOR WIFI', 'REPORTADO EN',
        'RIF', 'NOMBRE COMERCIO', 'HORA DE REPORTE', 'HORA DE ATENCION',
        'TIEMPO', 'PERSONA CONTACTO', 'TELEFONO CONTACTO', 'CIUDAD',
        'ESTADO', 'REPORTADO POR', 'CATEGORIA DE FALLA', 'FALLA REPORTADA CLIENTE',
        'ANALISTA OPERACIONES TÉCNICAS', 'ESTATUS CASO', 'OBSERVACIONES',
        'OBSERVACION 2', 'OBSERVACION 3', 'VENCIMIENTO CASO'
    ];

    return (
        <div className="atc-inbox anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bandeja ATC</h1>
                    <p className="page-sub">Gestión centralizada de casos de atención al cliente</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--primary">➕ Nuevo Caso ATC</button>
                </div>
            </div>

            <div className="table-container glass">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={headers.length} className="loading-cell">Cargando casos...</td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="empty-cell">No hay casos en la bandeja de entrada.</td>
                                </tr>
                            ) : (
                                cases.map((c, idx) => (
                                    <tr key={c.id || idx}>
                                        {/* Render cells here */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
