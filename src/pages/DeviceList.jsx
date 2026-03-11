import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDevicesPaged, deleteDevice, ESTATUSES_CASO, ESTATUSES_REPARACION, getReportUrl, getUniqueAliados, getDeviceById } from '../store';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './DeviceList.css';

export default function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [filterCaso, setFilterCaso] = useState('');
    const [filterRep, setFilterRep] = useState('');
    const [filterAliado, setFilterAliado] = useState(searchParams.get('aliado') || '');
    const [aliados, setAliados] = useState([]);
    const [confirm, setConfirm] = useState(null); // { id, serial }
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [viewingDevice, setViewingDevice] = useState(null);
    const [copiedSerial, setCopiedSerial] = useState(null);
    const pageSize = 10;
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        getDevicesPaged({ page, pageSize, search, filterCaso, filterRep, filterAliado }).then(({ data, count }) => {
            setDevices(data);
            setTotal(count || 0);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        getUniqueAliados().then(setAliados).catch(console.error);
    }, []);

    // Sincronizar parámetro de la URL con el estado
    useEffect(() => {
        const urlAliado = searchParams.get('aliado') || '';
        if (urlAliado !== filterAliado) {
            setFilterAliado(urlAliado);
        }
    }, [searchParams]);

    const handleAliadoChange = (e) => {
        const val = e.target.value;
        setFilterAliado(val);

        // Actualizar URL
        const params = new URLSearchParams(searchParams);
        if (val) params.set('aliado', val);
        else params.delete('aliado');
        setSearchParams(params);
    };

    // Recargar cuando cambie la página o los filtros
    useEffect(() => {
        load();
    }, [page, filterCaso, filterRep, filterAliado]);

    // Recargar cuando cambie la búsqueda (con debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (page === 1) load();
            else setPage(1); // El cambio de página disparará el otro useEffect
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
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        return `${day}-${month}-${year.slice(-2)}`;
    };

    const copyToClipboard = (e, text) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedSerial(text);
        setTimeout(() => setCopiedSerial(null), 1000); // 1 second
    };

    return (
        <div className="device-list anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lista de Equipos</h1>
                    <p className="page-sub">
                        {total} equipo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                        {totalPages > 1 && ` (Página ${page} de ${totalPages})`}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="device-list__filters glass anim-fadeUp" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div className="search-box">
                    <span className="search-box__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </span>
                    <input
                        className="search-box__input"
                        type="text"
                        placeholder="Buscar por serial, RIF, razón social..."
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
                    <select className="filter-select" value={filterCaso} onChange={e => setFilterCaso(e.target.value)}>
                        <option value="">Estatus caso</option>
                        {ESTATUSES_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="filter-select" value={filterRep} onChange={e => setFilterRep(e.target.value)}>
                        <option value="">Estatus reparación</option>
                        {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="filter-select" value={filterAliado} onChange={handleAliadoChange}>
                        <option value="">Filtrar por Aliado</option>
                        {aliados.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <button className="btn btn--primary" onClick={() => { setPage(1); load(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        Filtrar
                    </button>
                    {(search || filterCaso || filterRep || filterAliado) && (
                        <button className="btn btn--ghost" onClick={() => {
                            setSearch('');
                            setFilterCaso('');
                            setFilterRep('');
                            setFilterAliado('');
                            setPage(1);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></svg>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="empty-state anim-fadeIn">
                    <div className="loader-ring"></div>
                    <p>Cargando casos...</p>
                </div>
            ) : devices.length === 0 ? (
                <div className="empty-state anim-fadeUp">
                    <div className="empty-state__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <p>{search || filterCaso || filterRep ? 'No hay resultados para esta búsqueda.' : 'No hay casos registrados aún.'}</p>
                </div>
            ) : (
                <>
                    <div className="table-wrap">
                        <table className="data-table">
                            <colgroup>
                                <col className="col-fecha" />
                                <col className="col-modelo" />
                                <col className="col-serial" />
                                <col className="col-aliado" />
                                <col className="col-razon" />
                                <col className="col-estatus-caso" />
                                <col className="col-estatus-rep" />
                                <col className="col-plan" />
                                <col className="col-acciones" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Modelo</th>
                                    <th>Serial</th>
                                    <th>Aliado</th>
                                    <th>Razón Social</th>
                                    <th>Estatus Caso</th>
                                    <th>Estatus Rep.</th>
                                    <th>Acepta Plan</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map(d => (
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
                                        <td>{formatDate(d.fecha)}</td>
                                        <td>{d.modelo || '—'}</td>
                                        <td>
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 'max-content' }}>
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
                                        <td>{d.aliado || '—'}</td>
                                        <td>{d.razon_social}</td>
                                        <td><StatusBadge status={d.estatus_caso} type="caso" /></td>
                                        <td><StatusBadge status={d.estatus} type="reparacion" /></td>
                                        <td>{d.acepta_plan || 'No'}</td>
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

                    {/* Pagination Controls */}
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
                            Se eliminará el caso con serial <code className="serial-code">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="m21 16 1.4-1.4a2 2 0 0 0 0-2.8l-5.6-5.6a2 2 0 0 0-2.8 0L12.6 7.6" /><path d="m3 16-1.4-1.4a2 2 0 0 1 0-2.8l5.6-5.6a2 2 0 0 1 2.8 0l1.4 1.4" /><path d="M17 11h.01" /><path d="M7 11h.01" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M3 16h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" /></svg>
                                {confirm.serial}
                            </code>. <br /><br />Esta acción no se puede deshacer.
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
                                <CaseDetails form={viewingDevice} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
