import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDevicesPaged, deleteDevice, getDeviceById, ESTATUSES_CASO, ESTATUSES_REPARACION } from '../store';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './DeviceList.css'; 
import './shared.css';

export default function AllyBestPay() {
    const [devices, setDevices] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filterCaso, setFilterCaso] = useState('');
    const [filterRep, setFilterRep] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [viewingDevice, setViewingDevice] = useState(null);
    const [copiedSerial, setCopiedSerial] = useState(null);
    const pageSize = 15;
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        // Specifically filter by ally "BESTPAY"
        getDevicesPaged({ page, pageSize, search, filterCaso, filterRep, filterAliado: 'BESTPAY' }).then(({ data, count }) => {
            setDevices(data);
            setTotal(count || 0);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [page, filterCaso, filterRep]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (page === 1) load();
            else setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    async function handleDelete(id) {
        await deleteDevice(id);
        setConfirm(null);
        load();
    }

    const totalPages = Math.ceil(total / pageSize);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        // Try parsing ISO format YYYY-MM-DD
        const parts = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (parts) {
            const [_, y, m, d] = parts;
            return `${d}-${m}-${y.slice(-2)}`;
        }
        // Fallback for other formats (like GMT strings)
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd}-${mm}-${yy}`;
    };

    const copyToClipboard = (e, text) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedSerial(text);
        setTimeout(() => setCopiedSerial(null), 1000);
    };

    return (
        <div className="device-list anim-fadeUp">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px dashed var(--border)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-card)',
                        color: 'var(--text-muted)',
                        fontSize: '24px'
                    }}>
                        🏢
                    </div>
                    <div>
                        <h1 className="page-title">Equipos Aliado Best Pay</h1>
                        <p className="page-sub">
                            {total} equipo{total !== 1 ? 's' : ''} gestionado{total !== 1 ? 's' : ''} para BEST PAY
                        </p>
                    </div>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--minimal" onClick={() => navigate('/devices/new?mode=massive&aliado=BEST PAY')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        Carga Masiva
                    </button>
                    <button className="btn btn--minimal" onClick={() => navigate('/devices/new?aliado=BEST PAY')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Nuevo Equipo
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="device-list__filters anim-fadeUp">
                <div className="search-box">
                    <span className="search-box__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </span>
                    <input
                        className="search-box__input"
                        type="text"
                        placeholder="Buscar en Best Pay..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-box__clear" onClick={() => setSearch('')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                </div>
                
                <div className="filter-group">
                    <select 
                        className="filter-select" 
                        value={filterCaso} 
                        onChange={e => setFilterCaso(e.target.value)}
                    >
                        <option value="">Estatus Caso</option>
                        {ESTATUSES_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        className="filter-select" 
                        value={filterRep} 
                        onChange={e => setFilterRep(e.target.value)}
                    >
                        <option value="">Reparación</option>
                        {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button className="btn btn--primary" onClick={() => { setPage(1); load(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        Buscar
                    </button>

                    {(search || filterCaso || filterRep) && (
                        <button className="btn btn--ghost" onClick={() => {
                            setSearch('');
                            setFilterCaso('');
                            setFilterRep('');
                            setPage(1);
                        }}>
                            Limpiar
                        </button>
                    )}
                </div>

                <div style={{ marginLeft: 'auto' }}>
                    <button 
                        className="btn btn--secondary" 
                        onClick={() => load()} 
                        title="Refrescar tabla"
                        style={{ padding: '10px' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8M21 3v5h-5"/></svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="empty-state anim-fadeIn">
                    <div className="loader-ring"></div>
                    <p>Cargando tabla de BEST PAY...</p>
                </div>
            ) : devices.length === 0 ? (
                <div className="empty-state anim-fadeUp">
                    <div className="empty-state__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <p>{search ? 'No hay resultados para esta búsqueda en BEST PAY.' : 'No hay casos registrados para BEST PAY.'}</p>
                </div>
            ) : (
                <>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>FECHA</th>
                                    <th>ALIADO</th>
                                    <th>MODELO</th>
                                    <th>RAZÓN SOCIAL</th>
                                    <th>SERIAL</th>
                                    <th>INFORMES</th>
                                    <th>RIF</th>
                                    <th>INGRESO</th>
                                    <th>SERIAL DE REMPLAZO</th>
                                    <th>FALLA NOTIFICADA</th>
                                    <th>CATEGORÍA</th>
                                    <th>FECHA FINAL</th>
                                    <th>ESTATUS DEL CASO</th>
                                    <th>ESTATUS</th>
                                    <th>NIVEL</th>
                                    <th>GARANTIA</th>
                                    <th>INFORME</th>
                                    <th>COTIZACIÓN</th>
                                    <th>REPUESTO/SERVICIO 1</th>
                                    <th>REPUESTO/SERVICIO 2</th>
                                    <th>REPUESTO/SERVICIO 3</th>
                                    <th>OBSERVACIONES</th>
                                    <th>FECHA VENTA</th>
                                    <th>LOTE</th>
                                    <th>FACTURA</th>
                                    <th style={{ textAlign: 'right' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((d, index) => (
                                    <tr
                                        key={d.id}
                                        className="data-table__row"
                                        onClick={() => {
                                            setDetailLoading(true);
                                            getDeviceById(d.id).then(fullDevice => {
                                                setViewingDevice(fullDevice);
                                                setDetailLoading(false);
                                            }).catch(() => setDetailLoading(false));
                                        }}
                                    >
                                        <td className="text-secondary" style={{ fontSize: '12px' }}>{(page - 1) * pageSize + index + 1}</td>
                                        <td>{formatDate(d.fecha)}</td>
                                        <td>{d.aliado}</td>
                                        <td>{d.modelo || '—'}</td>
                                        <td style={{ minWidth: '150px' }}>{d.razon_social}</td>
                                        <td>
                                            <div className="serial-container">
                                                {copiedSerial === d.serial && (
                                                    <span className="copied-tooltip">Copiado</span>
                                                )}
                                                <code className="serial-code">{d.serial}</code>
                                                <button
                                                    className="copy-btn"
                                                    title="Copiar Serial"
                                                    onClick={(e) => copyToClipboard(e, d.serial)}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td>{d.informes || '—'}</td>
                                        <td>{d.rif}</td>
                                        <td>{d.ingreso || '—'}</td>
                                        <td>{d.serial_reemplazo || '—'}</td>
                                        <td>
                                            <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.falla_notificada}>
                                                {d.falla_notificada || '—'}
                                            </div>
                                        </td>
                                        <td>{d.categoria}</td>
                                        <td>{formatDate(d.fecha_final)}</td>
                                        <td><StatusBadge status={d.estatus_caso} type="caso" /></td>
                                        <td><StatusBadge status={d.estatus} type="reparacion" /></td>
                                        <td>{d.nivel || '—'}</td>
                                        <td>{d.garantia || 'No'}</td>
                                        <td>{d.informe || '—'}</td>
                                        <td>{d.cotizacion || '0'}</td>
                                        <td>{d.repuesto_1 || '—'}</td>
                                        <td>{d.repuesto_2 || '—'}</td>
                                        <td>{d.repuesto_3 || '—'}</td>
                                        <td>
                                            <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.observaciones}>
                                                {d.observaciones || '—'}
                                            </div>
                                        </td>
                                        <td>{formatDate(d.fecha_venta)}</td>
                                        <td>{d.lote || '—'}</td>
                                        <td>{d.nro_factura || '—'}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn action-btn--edit"
                                                    title="Editar"
                                                    onClick={() => navigate(`/devices/${d.id}/edit`)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                                <button
                                                    className="action-btn action-btn--delete"
                                                    title="Eliminar"
                                                    onClick={() => setConfirm({ id: d.id, serial: d.serial })}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn--ghost btn--sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                Anterior
                            </button>
                            <span className="pagination__info">Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
                            <button
                                className="btn btn--ghost btn--sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Siguiente
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Confirm dialog */}
            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(null)}>
                    <div className="modal glass" onClick={e => e.stopPropagation()}>
                        <h3 className="modal__title">¿Eliminar caso?</h3>
                        <p className="modal__body">
                            Se eliminará el caso con serial <code className="serial-code">{confirm.serial}</code>. Esta acción no se puede deshacer.
                        </p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancelar</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(confirm.id)}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Case Details Modal */}
            {(viewingDevice || detailLoading) && (
                <div className="modal-overlay" onClick={() => setViewingDevice(null)}>
                    <div className="modal modal--wide glass anim-fadeUp" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Detalles del Caso</h3>
                            <button className="modal__close" onClick={() => { setViewingDevice(null); setDetailLoading(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="modal__body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '0' }}>
                            {detailLoading ? (
                                <div className="empty-state" style={{ padding: '40px' }}>
                                    <div className="loader-ring"></div>
                                    <p>Cargando información detallada...</p>
                                </div>
                            ) : (
                                                                <CaseDetails 
                                    variant="aliados-vertical" 
                                    form={viewingDevice}
                                    actions={(
                                        <div className="action-btns">
                                            <button
                                                className="action-btn action-btn--edit"
                                                title="Editar"
                                                onClick={() => {
                                                    setViewingDevice(null);
                                                    navigate(`/devices/${viewingDevice.id}/edit`);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button
                                                className="action-btn action-btn--delete"
                                                title="Eliminar"
                                                onClick={() => {
                                                    setViewingDevice(null);
                                                    setConfirm({ id: viewingDevice.id, serial: viewingDevice.serial });
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </button>
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
