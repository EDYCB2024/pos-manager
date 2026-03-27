import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../components/ui/Modal';
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
                            <CaseDetails 
                                variant="atc-vertical"
                                form={viewing}
                                actions={(
                                    <div className="action-btns">
                                        <button
                                            className="action-btn action-btn--edit"
                                            title="Editar"
                                            onClick={() => {
                                                setViewing(null);
                                                openEdit(viewing);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                                            </svg>
                                        </button>
                                        <button
                                            className="action-btn action-btn--delete"
                                            title="Eliminar"
                                            onClick={() => {
                                                setViewing(null);
                                                setConfirm({ id: viewing.id, serial: viewing.serial });
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                <line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/* ── Modals ───────────────────────────────── */}
            <Modal
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                title={(
                    <>
                        <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm shadow-inner">📝</span>
                        Editar Caso ATC #{editing?.id}
                    </>
                )}
                maxWidth="max-w-4xl"
                footer={(
                    <>
                        <button className="px-6 py-2.5 bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all font-bold" onClick={() => setEditing(null)}>Cancelar</button>
                        <button className="px-8 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-[2px] rounded-xl hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 transition-all font-bold" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </>
                )}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {editFields.map(({ key, label, type, options }) => (
                        <div key={key} className={`flex flex-col gap-1.5 ${type === 'textarea' ? 'md:col-span-2' : ''}`}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                            {type === 'textarea' ? (
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none text-sm font-medium"
                                    value={editing?.form[key] || ''}
                                    onChange={e => handleEditChange(key, e.target.value)}
                                    rows={3}
                                />
                            ) : type === 'select' ? (
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                    value={editing?.form[key] || ''}
                                    onChange={e => handleEditChange(key, e.target.value)}
                                >
                                    {options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    type={type}
                                    value={editing?.form[key] || ''}
                                    onChange={e => handleEditChange(key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={!!confirm}
                onClose={() => setConfirm(null)}
                title="¿Eliminar caso ATC?"
                maxWidth="max-w-sm"
                footer={(
                    <>
                        <button className="flex-1 px-4 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-100 rounded-xl hover:bg-slate-200 transition-all" onClick={() => setConfirm(null)}>Cancelar</button>
                        <button className="flex-[2] px-6 py-3 bg-rose-600 text-white font-bold text-xs uppercase tracking-[2px] rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20" onClick={() => handleDelete(confirm.id)}>Sí, eliminar</button>
                    </>
                )}
            >
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Se eliminará el caso del cliente con serial <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600 font-bold tracking-tight">{confirm?.serial || 'Sin Serial'}</code>. Esta acción no se puede deshacer.
                </p>
            </Modal>

        </div>
    );
}
