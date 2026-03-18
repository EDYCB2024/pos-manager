import { useState, useEffect } from 'react';
import { getAtcCases, deleteAtcCase } from '../store';
import StatusBadge from '../components/StatusBadge';
import './AtcInbox.css';

export default function AtcInbox() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(null);

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

    const handleDelete = async (id) => {
        try {
            await deleteAtcCase(id);
            setConfirm(null);
            load();
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    // Headers requested by the user
    const headers = [
        '#', 'FECHA', 'SERIAL', 'OPERADORA', 'PROVEEDOR WIFI', 'REPORTADO EN',
        'RIF', 'NOMBRE COMERCIO', 'HORA DE REPORTE', 'HORA DE ATENCION',
        'TIEMPO', 'PERSONA CONTACTO', 'TELEFONO CONTACTO', 'CIUDAD',
        'ESTADO', 'REPORTADO POR', 'CATEGORIA DE FALLA', 'FALLA REPORTADA CLIENTE',
        'ANALISTA OPERACIONES TÉCNICAS', 'ESTATUS CASO', 'OBSERVACIONES',
        'OBSERVACION 2', 'OBSERVACION 3', 'VENCIMIENTO CASO', 'ACCIONES'
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
                                    <th key={i} style={h === 'ACCIONES' ? { textAlign: 'right' } : {}}>{h}</th>
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
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className="action-btn action-btn--delete"
                                                    title="Eliminar"
                                                    onClick={() => setConfirm({ id: c.id, serial: c.serial })}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line x1="10" x2="10" y1="11" y2="17" />
                                                        <line x1="14" x2="14" y1="11" y2="17" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm dialog */}
            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(null)}>
                    <div className="modal glass" onClick={e => e.stopPropagation()}>
                        <h3 className="modal__title">¿Eliminar caso ATC?</h3>
                        <p className="modal__body">
                            Se eliminará el caso del cliente con serial <code className="serial-code">{confirm.serial || 'Sin Serial'}</code>. Esta acción no se puede deshacer.
                        </p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancelar</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(confirm.id)}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
