import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDevices, deleteDevice, ESTATUSES_CASO, ESTATUSES_REPARACION } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceList.css';

export default function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCaso, setFilterCaso] = useState('');
    const [filterRep, setFilterRep] = useState('');
    const [confirm, setConfirm] = useState(null); // { id, serial }
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        getAllDevices().then(data => {
            setDevices(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };
    useEffect(load, []);

    const filtered = devices.filter(d => {
        const q = search.toLowerCase();
        const matchSearch =
            (d.serial || '').toLowerCase().includes(q) ||
            (d.razon_social || '').toLowerCase().includes(q) ||
            (d.rif || '').toLowerCase().includes(q) ||
            (d.aliado || '').toLowerCase().includes(q) ||
            (d.modelo || '').toLowerCase().includes(q);
        const matchCaso = filterCaso ? d.estatus_caso === filterCaso : true;
        const matchRep = filterRep ? d.estatus_reparacion === filterRep : true;
        return matchSearch && matchCaso && matchRep;
    });

    async function handleDelete(id) {
        await deleteDevice(id);
        setConfirm(null);
        load();
    }

    return (
        <div className="device-list anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Casos POS</h1>
                    <p className="page-sub">{devices.length} caso{devices.length !== 1 ? 's' : ''} registrado{devices.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                    + Nuevo Caso
                </button>
            </div>

            {/* Filters */}
            <div className="device-list__filters">
                <div className="search-box">
                    <span className="search-box__icon">⊕</span>
                    <input
                        className="search-box__input"
                        type="text"
                        placeholder="Buscar por serial, RIF, razón social, aliado..."
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
            </div>

            {/* Table */}
            {loading ? (
                <div className="empty-state"><span className="empty-state__icon">⏳</span><p>Cargando casos...</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state__icon">{search || filterCaso || filterRep ? '🔍' : '📭'}</span>
                    <p>{search || filterCaso || filterRep ? 'No hay resultados para esta búsqueda.' : 'No hay casos registrados aún.'}</p>
                    {!search && !filterCaso && !filterRep && (
                        <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                            Agregar primero
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-wrap glass">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Serial</th>
                                <th>Aliado</th>
                                <th>Modelo</th>
                                <th>RIF</th>
                                <th>Razón Social</th>
                                <th>Categoría</th>
                                <th>Estatus Caso</th>
                                <th>Estatus Rep.</th>
                                <th>Garantía</th>
                                <th>Cotización</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.id} className="data-table__row">
                                    <td>{d.fecha || '—'}</td>
                                    <td>
                                        <code
                                            className="serial-code serial-code--link"
                                            onClick={() => navigate(`/devices/${d.serial}`)}
                                        >
                                            {d.serial}
                                        </code>
                                    </td>
                                    <td>{d.aliado || '—'}</td>
                                    <td>{d.modelo || '—'}</td>
                                    <td>{d.rif || '—'}</td>
                                    <td>{d.razon_social}</td>
                                    <td>{d.categoria || '—'}</td>
                                    <td><StatusBadge status={d.estatus_caso} type="caso" /></td>
                                    <td><StatusBadge status={d.estatus_reparacion} type="reparacion" /></td>
                                    <td>
                                        <span className={`garantia-badge garantia-badge--${d.garantia ? 'yes' : 'no'}`}>
                                            {d.garantia ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    <td>{d.cotizacion ? `$${Number(d.cotizacion).toFixed(2)}` : '—'}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="action-btn action-btn--edit"
                                                title="Editar"
                                                onClick={() => navigate(`/devices/${d.serial}/edit`)}
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
