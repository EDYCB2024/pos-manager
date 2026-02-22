import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDevices, deleteDevice, ESTATUSES } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceList.css';

export default function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [confirm, setConfirm] = useState(null);
    const navigate = useNavigate();

    const load = () => setDevices(getAllDevices());
    useEffect(load, []);

    const filtered = devices.filter(d => {
        const q = search.toLowerCase();
        const matchSearch =
            d.serial.toLowerCase().includes(q) ||
            d.razonSocial.toLowerCase().includes(q) ||
            d.rif.toLowerCase().includes(q) ||
            d.modelo.toLowerCase().includes(q);
        const matchFilter = filter ? d.estatus === filter : true;
        return matchSearch && matchFilter;
    });

    function handleDelete(serial) {
        deleteDevice(serial);
        setConfirm(null);
        load();
    }

    return (
        <div className="device-list anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Equipos</h1>
                    <p className="page-sub">{devices.length} equipo{devices.length !== 1 ? 's' : ''} registrado{devices.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                    + Nuevo Equipo
                </button>
            </div>

            {/* Filters */}
            <div className="device-list__filters">
                <div className="search-box">
                    <span className="search-box__icon">⊕</span>
                    <input
                        className="search-box__input"
                        type="text"
                        placeholder="Buscar por serial, RIF, razón social, modelo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-box__clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>
                <select
                    className="filter-select"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="">Todos los estatus</option>
                    {ESTATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state__icon">{search || filter ? '🔍' : '📭'}</span>
                    <p>{search || filter ? 'No hay resultados para esta búsqueda.' : 'No hay equipos registrados aún.'}</p>
                    {!search && !filter && (
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
                                <th>Serial</th>
                                <th>RIF</th>
                                <th>Razón Social</th>
                                <th>Modelo</th>
                                <th>Estatus</th>
                                <th>Garantía</th>
                                <th>Ingreso</th>
                                <th>Cotización</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.id} className="data-table__row">
                                    <td>
                                        <code
                                            className="serial-code serial-code--link"
                                            onClick={() => navigate(`/devices/${d.serial}`)}
                                        >
                                            {d.serial}
                                        </code>
                                    </td>
                                    <td>{d.rif}</td>
                                    <td>{d.razonSocial}</td>
                                    <td>{d.modelo}</td>
                                    <td><StatusBadge status={d.estatus} /></td>
                                    <td>
                                        <span className={`garantia-badge garantia-badge--${d.garantia === 'Sí' ? 'yes' : 'no'}`}>
                                            {d.garantia}
                                        </span>
                                    </td>
                                    <td>{d.fechaIngreso || '—'}</td>
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
                                                onClick={() => setConfirm(d.serial)}
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
                        <h3 className="modal__title">¿Eliminar equipo?</h3>
                        <p className="modal__body">
                            Se eliminará el equipo con serial <code className="serial-code">{confirm}</code>. Esta acción no se puede deshacer.
                        </p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancelar</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(confirm)}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
