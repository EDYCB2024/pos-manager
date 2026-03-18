import { useState, useEffect } from 'react';
import { getAtcCases } from '../store';
import StatusBadge from '../components/StatusBadge';
import './AtcInbox.css';

export default function AtcInbox() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAtcCases();
            setCases(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Headers requested by the user
    const headers = [
        '#', 'FECHA', 'SERIAL', 'OPERADORA', 'PROVEEDOR WIFI', 'REPORTADO EN',
        'RIF', 'NOMBRE COMERCIO', 'HORA DE REPORTE', 'HORA DE ATENCION',
        'TIEMPO', 'PERSONA CONTACTO', 'TELEFONO CONTACTO', 'CIUDAD',
        'ESTADO', 'REPORTADO POR', 'CATEGORIA DE FALLA', 'FALLA REPORTADA CLIENTE',
        'ANALISTA OPERACIONES TÉCNICAS', 'ESTATUS CASO', 'OBSERVACIONES',
        'OBSERVACION 2', 'OBSERVACION 3', 'VENCIMIENTO CASO'
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString;
    };

    return (
        <div className="atc-inbox anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bandeja ATC</h1>
                    <p className="page-sub">Gestión centralizada de casos de atención al cliente</p>
                </div>
                <div className="page-header__actions">
                    <button 
                        className="btn-icon" 
                        onClick={load} 
                        title="Refrescar bandeja"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8M21 3v5h-5"/>
                        </svg>
                    </button>
                    <button className="btn-icon btn-icon--primary" title="Nuevo Caso ATC">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
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
                                    <td colSpan={headers.length} className="loading-cell">
                                        <div className="loader-ring"></div>
                                        <p>Cargando casos...</p>
                                    </td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="empty-cell">No hay casos en la bandeja de entrada.</td>
                                </tr>
                            ) : (
                                cases.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{formatDate(c.fecha)}</td>
                                        <td><code className="serial-code">{c.serial || '—'}</code></td>
                                        <td>{c.operadora || '—'}</td>
                                        <td>{c.proveedor_wifi || '—'}</td>
                                        <td>{c.afiliado || '—'}</td>
                                        <td>{c.rif || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{c.nombre_comercio || '—'}</td>
                                        <td>{c.hora_reporte || '—'}</td>
                                        <td>{c.hora_atencion || '—'}</td>
                                        <td>{c.tiempo || '—'}</td>
                                        <td>{c.persona_contacto || '—'}</td>
                                        <td>{c.telefono_contacto || '—'}</td>
                                        <td>{c.ciudad || '—'}</td>
                                        <td>{c.estado || '—'}</td>
                                        <td>{c.reportado_by || '—'}</td>
                                        <td>{c.categoria_falla || '—'}</td>
                                        <td>
                                            <div className="truncate-cell" title={c.falla_cliente}>
                                                {c.falla_cliente || '—'}
                                            </div>
                                        </td>
                                        <td>{c.analista_tecnico || '—'}</td>
                                        <td><StatusBadge status={c.estatus_caso} type="caso" /></td>
                                        <td>{c.observaciones || '—'}</td>
                                        <td>{c.observacion_2 || '—'}</td>
                                        <td>{c.observacion_3 || '—'}</td>
                                        <td>{formatDate(c.vencimiento_caso)}</td>
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
