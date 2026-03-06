import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDevicesPaged, deleteDevice, ESTATUSES_CASO, ESTATUSES_REPARACION, getReportUrl, getUniqueAliados } from '../store';
import StatusBadge from '../components/StatusBadge';
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
    const navigate = useNavigate();
    const pageSize = 10;

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

    return (
        <div className="device-list anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Casos POS</h1>
                    <p className="page-sub">
                        {total} caso{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                        {totalPages > 1 && ` (Página ${page} de ${totalPages})`}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="device-list__filters">
                <div className="search-box">
                    <span className="search-box__icon">⊕</span>
                    <input
                        className="search-box__input"
                        type="text"
                        placeholder="Buscar por serial, RIF, razón social..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-box__clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>
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
                    🔍 Buscar
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="empty-state"><span className="empty-state__icon">⏳</span><p>Cargando casos...</p></div>
            ) : devices.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state__icon">{search || filterCaso || filterRep ? '🔍' : '📭'}</span>
                    <p>{search || filterCaso || filterRep ? 'No hay resultados para esta búsqueda.' : 'No hay casos registrados aún.'}</p>
                </div>
            ) : (
                <>
                    <div className="table-wrap glass">
                        <table className="data-table responsive-table">
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
                                    <tr key={d.id} className="data-table__row">
                                        <td data-label="Fecha">{formatDate(d.fecha)}</td>
                                        <td data-label="Modelo">{d.modelo || '—'}</td>
                                        <td data-label="Serial">
                                            <code
                                                className="serial-code serial-code--link"
                                                onClick={() => navigate(`/devices/${d.id}`)}
                                            >
                                                {d.serial}
                                            </code>
                                        </td>
                                        <td data-label="Aliado">{d.aliado || '—'}</td>
                                        <td data-label="Razón Social">{d.razon_social}</td>
                                        <td data-label="Caso"><StatusBadge status={d.estatus_caso} type="caso" /></td>
                                        <td data-label="Reparación"><StatusBadge status={d.estatus} type="reparacion" /></td>
                                        <td data-label="Plan">{d.acepta_plan || 'No'}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn action-btn--edit"
                                                    title="Editar"
                                                    onClick={() => navigate(`/devices/${d.id}/edit`)}
                                                >✎</button>
                                                <button
                                                    className="action-btn action-btn--delete"
                                                    title="Eliminar"
                                                    onClick={() => setConfirm({ id: d.id, serial: d.serial })}
                                                >🗑</button>
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
                                className="btn btn--ghost"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                ← Anterior
                            </button>
                            <span className="pagination__info">Página {page} de {totalPages}</span>
                            <button
                                className="btn btn--ghost"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Siguiente →
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
        </div>
    );
}
