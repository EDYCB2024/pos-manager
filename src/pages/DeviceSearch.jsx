import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceBySerial } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceSearch.css';

export default function DeviceSearch() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(undefined); // undefined=not searched, null=not found
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    async function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        const found = await getDeviceBySerial(query.trim());
        setResult(found ?? null);
        setSearching(false);
    }

    const field = (label, value, mono = false) => value ? (
        <div className="detail-field">
            <span className="detail-field__label">{label}</span>
            <span className={`detail-field__value${mono ? ' mono' : ''}`}>{value}</span>
        </div>
    ) : null;

    return (
        <div className="device-search anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buscar por Serial</h1>
                    <p className="page-sub">Ingresa el serial del equipo para ver su estado</p>
                </div>
            </div>

            <form className="search-hero glass" onSubmit={handleSearch}>
                <label className="search-hero__label">Serial del equipo</label>
                <div className="search-hero__row">
                    <input
                        className="search-hero__input"
                        type="text"
                        placeholder="Ej. VX520-001234"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn btn--primary search-hero__btn" disabled={searching}>
                        {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
            </form>

            {result === null && (
                <div className="empty-state anim-fadeUp">
                    <span className="empty-state__icon">🔍</span>
                    <p>No se encontró ningún equipo con serial <code className="serial-code">"{query}"</code>.</p>
                </div>
            )}

            {result && (
                <div className="device-detail glass anim-fadeUp">
                    <div className="device-detail__header">
                        <div>
                            <code className="serial-hero">{result.serial}</code>
                            <p className="device-detail__razon">{result.razon_social}</p>
                        </div>
                        <div className="device-detail__header-right">
                            <StatusBadge status={result.estatus_caso} type="caso" />
                            <StatusBadge status={result.estatus_reparacion} type="reparacion" />
                            <button
                                className="btn btn--ghost btn--sm"
                                onClick={() => navigate(`/devices/${result.serial}/edit`)}
                            >
                                ✎ Editar
                            </button>
                        </div>
                    </div>

                    <div className="detail-grid">
                        {field('RIF', result.rif)}
                        {field('Aliado', result.aliado)}
                        {field('Modelo', result.modelo)}
                        {field('Categoría', result.categoria)}
                        {field('Garantía', result.garantia ? 'Sí' : 'No')}
                        {field('Fecha', result.fecha)}
                        {field('Serial Reemplazo', result.serial_reemplazo)}
                        {field('Cotización', result.cotizacion ? `$${Number(result.cotizacion).toFixed(2)}` : '—')}
                    </div>

                    {result.falla_notificada && (
                        <div className="detail-section">
                            <h4 className="detail-section__title">Falla Notificada</h4>
                            <p className="detail-section__text">{result.falla_notificada}</p>
                        </div>
                    )}
                    {result.informes && (
                        <div className="detail-section">
                            <h4 className="detail-section__title">Informes</h4>
                            <p className="detail-section__text">{result.informes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
