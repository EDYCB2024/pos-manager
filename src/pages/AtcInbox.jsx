import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAtcCases, deleteAtcCase } from '../store';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './AtcInbox.css';

const EMPTY_FORM = {
    fecha: '', serial: '', operadora: '', proveedor_wifi: '', afiliado: '',
    rif: '', nombre_comercio: '', hora_reporte: '', hora_atencion: '',
    tiempo: '', persona_contacto: '', telefono_contacto: '', ciudad: '',
    estado: '', reportado_by: '', categoria_falla: '', falla_cliente: '',
    analista_tecnico: '', estatus_caso: 'Abierto', observaciones: '',
    observacion_2: '', observacion_3: '', vencimiento_caso: '',
};

export default function AtcInbox() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [editing, setEditing] = useState(null); // { id, form }
    const [saving, setSaving] = useState(false);

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

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await deleteAtcCase(id);
            setConfirm(null);
            load();
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    const openEdit = (c) => {
        const form = { ...EMPTY_FORM };
        Object.keys(EMPTY_FORM).forEach(k => { form[k] = c[k] ?? ''; });
        setEditing({ id: c.id, form });
    };

    const handleEditChange = (field, value) => {
        setEditing(prev => ({ ...prev, form: { ...prev.form, [field]: value } }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...editing.form };
            // Clean empty strings to null for optional fields
            Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

            const { error } = await supabase
                .from('casos_atc')
                .update(payload)
                .eq('id', editing.id);

            if (error) throw error;
            setEditing(null);
            load();
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const headers = [
        '#', 'FECHA', 'SERIAL', 'OPERADORA', 'PROVEEDOR WIFI', 'REPORTADO EN',
        'RIF', 'NOMBRE COMERCIO', 'HORA DE REPORTE', 'HORA DE ATENCION',
        'TIEMPO', 'PERSONA CONTACTO', 'TELEFONO CONTACTO', 'CIUDAD',
        'ESTADO', 'REPORTADO POR', 'CATEGORIA DE FALLA', 'FALLA REPORTADA CLIENTE',
        'ANALISTA OPERACIONES TÉCNICAS', 'ESTATUS CASO', 'OBSERVACIONES',
        'OBSERVACION 2', 'OBSERVACION 3', 'VENCIMIENTO CASO', 'ACCIONES'
    ];

    const formatDate = (d) => d || '—';

    /* ── Edit modal fields config ─────────────────────── */
    const editFields = [
        { key: 'fecha', label: 'Fecha', type: 'date' },
        { key: 'serial', label: 'Serial', type: 'text' },
        { key: 'operadora', label: 'Operadora', type: 'text' },
        { key: 'proveedor_wifi', label: 'Proveedor WiFi', type: 'text' },
        { key: 'afiliado', label: 'Afiliado (Reportado en)', type: 'text' },
        { key: 'rif', label: 'RIF', type: 'text' },
        { key: 'nombre_comercio', label: 'Nombre Comercio', type: 'text' },
        { key: 'hora_reporte', label: 'Hora de Reporte', type: 'time' },
        { key: 'hora_atencion', label: 'Hora de Atención', type: 'time' },
        { key: 'tiempo', label: 'Tiempo', type: 'text' },
        { key: 'persona_contacto', label: 'Persona de Contacto', type: 'text' },
        { key: 'telefono_contacto', label: 'Teléfono de Contacto', type: 'text' },
        { key: 'ciudad', label: 'Ciudad', type: 'text' },
        { key: 'estado', label: 'Estado', type: 'text' },
        { key: 'reportado_by', label: 'Reportado por', type: 'text' },
        { key: 'categoria_falla', label: 'Categoría de Falla', type: 'text' },
        { key: 'falla_cliente', label: 'Falla Reportada', type: 'textarea' },
        { key: 'analista_tecnico', label: 'Analista Técnico', type: 'text' },
        { key: 'estatus_caso', label: 'Estatus Caso', type: 'select', options: ['Abierto', 'Cerrado'] },
        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
        { key: 'observacion_2', label: 'Observación 2', type: 'textarea' },
        { key: 'observacion_3', label: 'Observación 3', type: 'textarea' },
        { key: 'vencimiento_caso', label: 'Vencimiento Caso', type: 'datetime-local' },
    ];

    return (
        <div className="atc-inbox anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bandeja ATC</h1>
                    <p className="page-sub">Gestión centralizada de casos de atención al cliente</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-icon" onClick={load} title="Refrescar bandeja">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8M21 3v5h-5" />
                        </svg>
                    </button>
                    <button className="btn-icon btn-icon--primary" title="Nuevo Caso ATC">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
                                    <tr
                                        key={c.id}
                                        className="data-table__row"
                                        onClick={() => setViewing(c)}
                                    >
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
                                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                            <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className="action-btn action-btn--edit"
                                                    title="Editar"
                                                    onClick={() => openEdit(c)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn action-btn--delete"
                                                    title="Eliminar"
                                                    onClick={() => setConfirm({ id: c.id, serial: c.serial })}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
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

            {/* ── View Details Modal (portaled to body) ── */}
            {viewing && createPortal(
                <div className="modal-overlay" onClick={() => setViewing(null)}>
                    <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Detalles del Caso ATC #{viewing.id}</h3>
                            <button className="modal__close" onClick={() => setViewing(null)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <CaseDetails form={{
                                razon_social: viewing.nombre_comercio,
                                rif: viewing.rif,
                                serial: viewing.serial,
                                modelo: viewing.operadora ? `Operadora: ${viewing.operadora}` : null,
                                procesadora: viewing.proveedor_wifi ? `WiFi: ${viewing.proveedor_wifi}` : null,
                                aliado: viewing.afiliado,
                                ingreso: viewing.hora_reporte,
                                nro_guia: viewing.reportado_by,
                                fecha: viewing.fecha,
                                fecha_final: viewing.vencimiento_caso,
                                tecnico: viewing.analista_tecnico,
                                categoria: viewing.categoria_falla,
                                estatus_caso: viewing.estatus_caso,
                                estatus: null,
                                falla_notificada: viewing.falla_cliente,
                                observaciones: [
                                    viewing.observaciones,
                                    viewing.observacion_2,
                                    viewing.observacion_3
                                ].filter(Boolean).join('\n\n') || null,
                                nivel: viewing.persona_contacto ? `${viewing.persona_contacto} — ${viewing.telefono_contacto || ''}` : null,
                                garantia: viewing.ciudad ? `${viewing.ciudad}, ${viewing.estado || ''}` : null,
                            }} />
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/* ── Edit Modal ─────────────────────────────── */}
            {editing && (

                <div className="modal-overlay" onClick={() => setEditing(null)}>
                    <div className="modal modal--wide atc-edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Editar Caso ATC #{editing.id}</h3>
                            <button className="modal__close" onClick={() => setEditing(null)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal__body atc-edit-body">
                            <div className="atc-edit-grid">
                                {editFields.map(({ key, label, type, options }) => (
                                    <div key={key} className={`atc-field ${type === 'textarea' ? 'atc-field--full' : ''}`}>
                                        <label className="atc-field__label">{label}</label>
                                        {type === 'textarea' ? (
                                            <textarea
                                                className="atc-field__input"
                                                value={editing.form[key] || ''}
                                                onChange={e => handleEditChange(key, e.target.value)}
                                                rows={2}
                                            />
                                        ) : type === 'select' ? (
                                            <select
                                                className="atc-field__input"
                                                value={editing.form[key] || ''}
                                                onChange={e => handleEditChange(key, e.target.value)}
                                            >
                                                {options.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                className="atc-field__input"
                                                type={type}
                                                value={editing.form[key] || ''}
                                                onChange={e => handleEditChange(key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancelar</button>
                            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ─────────────────────────── */}
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
