import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDevicesPaged, deleteDevice, ESTATUSES_CASO, ESTATUSES_REPARACION, getReportUrl, getUniqueAliados, getDeviceById } from '../store';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './DeviceList.css';
import './shared.css';

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
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [viewingDevice, setViewingDevice] = useState(null);
    const [copiedSerial, setCopiedSerial] = useState(null);
    const pageSize = 10;
    const navigate = useNavigate();

    const isSearching = !!(search || filterCaso || filterRep || filterAliado);

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
        if (isSearching) {
            load();
        }
    }, [page, filterCaso, filterRep, filterAliado]);

    // Recargar cuando cambie la búsqueda (con debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (isSearching) {
                if (page === 1) load();
                else setPage(1);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    async function handleDelete(id) {
        await deleteDevice(id);
        setConfirm(null);
        if (isSearching) load();
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
            {/* Conditional Header: Hero Search vs Results Header */}
            {!isSearching ? (
                <div className="hero-search anim-fadeUp">
                    <h1 className="hero-search__title">Buscador de Equipos</h1>
                    <p className="hero-search__sub">Encuentra cualquier caso por serial, razón social o RIF.</p>
                    
                    <div className="large-search">
                        <span className="large-search__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                        <input
                            className="large-search__input"
                            type="text"
                            placeholder="Escribe el serial o nombre..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                        {search && (
                            <button className="large-search__clear" onClick={() => setSearch('')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}
                    </div>

                    <div className="hero-search__tags">
                        <span className="tag-label">O filtra por:</span>
                        <select className="tag-select" value={filterAliado} onChange={handleAliadoChange}>
                            <option value="">Aliado</option>
                            {aliados.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <select className="tag-select" value={filterRep} onChange={e => setFilterRep(e.target.value)}>
                            <option value="">Reparación</option>
                            {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Resultados de Búsqueda</h1>
                        <p className="page-sub">
                            {total} equipo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {!isSearching ? (
                <div className="empty-mini anim-fadeUp" style={{ border: 'none', background: 'transparent' }}>
                    <p>Usa el buscador arriba para encontrar equipos por serial o nombre. ✨</p>
                </div>
            ) : (
                <>
                    {/* Filters for Search Results */}
                    <div className="device-list__filters anim-fadeUp">
                        <div className="search-box">
                            <span className="search-box__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </span>
                            <input
                                className="search-box__input"
                                type="text"
                                placeholder="Refinar búsqueda..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <select className="filter-select" value={filterCaso} onChange={e => setFilterCaso(e.target.value)}>
                                <option value="">Estatus Caso</option>
                                {ESTATUSES_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select className="filter-select" value={filterRep} onChange={e => setFilterRep(e.target.value)}>
                                <option value="">Reparación</option>
                                {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select className="filter-select" value={filterAliado} onChange={handleAliadoChange}>
                                <option value="">Aliado</option>
                                {aliados.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            <button className="btn btn--ghost" onClick={() => {
                                setSearch('');
                                setFilterCaso('');
                                setFilterRep('');
                                setFilterAliado('');
                            }}>
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Results Cards */}
                    {loading ? (
                        <div className="empty-state anim-fadeIn">
                            <div className="loader-ring"></div>
                            <p>Cargando resultados...</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="empty-state anim-fadeUp">
                            <p>No se encontraron equipos con esos filtros.</p>
                        </div>
                    ) : (
                        <div className="results-grid">
                            {devices.map(d => (
                                <div 
                                    key={d.id} 
                                    className="result-card anim-slideIn"
                                    onClick={() => {
                                        setDetailLoading(true);
                                        getDeviceById(d.id).then(fullDevice => {
                                            setViewingDevice(fullDevice);
                                            setDetailLoading(false);
                                        }).catch(() => setDetailLoading(false));
                                    }}
                                >
                                    <div className="result-card__header">
                                        <span className="result-card__date">{formatDate(d.fecha)}</span>
                                        <StatusBadge status={d.estatus_caso} type="caso" />
                                    </div>
                                    
                                    <h3 className="result-card__title">{d.razon_social}</h3>
                                    
                                    <div className="result-card__details">
                                        <div className="detail-p">
                                            <span className="label">Serial</span>
                                            <span className="value"><code>{d.serial}</code></span>
                                        </div>
                                        <div className="detail-p">
                                            <span className="label">Modelo</span>
                                            <span className="value">{d.modelo || '—'}</span>
                                        </div>
                                        <div className="detail-p">
                                            <span className="label">Aliado</span>
                                            <span className="value">{d.aliado}</span>
                                        </div>
                                        <div className="detail-p">
                                            <span className="label">REPARACIÓN</span>
                                            <span className="value">{d.estatus}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="result-card__footer">
                                        <div className="result-card__badges">
                                            <StatusBadge status={d.estatus} type="reparacion" />
                                        </div>
                                        <div className="result-card__actions" onClick={e => e.stopPropagation()}>
                                            <button 
                                                className="action-card-btn" 
                                                title="Copiar Serial"
                                                onClick={(e) => copyToClipboard(e, d.serial)}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            </button>
                                            <button 
                                                className="action-card-btn" 
                                                title="Editar"
                                                onClick={() => navigate(`/devices/${d.id}/edit`)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button 
                                                className="action-card-btn action-card-btn--delete" 
                                                title="Eliminar"
                                                onClick={() => setConfirm({ id: d.id, serial: d.serial })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {copiedSerial === d.serial && <div className="copied-toast">Serial Copiado!</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="btn btn--ghost btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
                            <span>Página {page} de {totalPages}</span>
                            <button className="btn btn--ghost btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(null)}>
                    <div className="modal glass" onClick={e => e.stopPropagation()}>
                        <h3 className="modal__title">¿Eliminar caso?</h3>
                        <p className="modal__body">Se eliminará el caso <code>{confirm.serial}</code>. Esta acción es permanente.</p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancelar</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(confirm.id)}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {(viewingDevice || detailLoading) && (
                <div className="modal-overlay" onClick={() => setViewingDevice(null)}>
                    <div className="modal modal--wide glass" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Detalles del Caso</h3>
                            <button className="modal__close" onClick={() => setViewingDevice(null)}>×</button>
                        </div>
                        <div className="modal__body">
                            {detailLoading ? <p>Cargando...</p> : <CaseDetails form={viewingDevice} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
