import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceBySerial } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceSearch.css';

export default function DeviceSearch() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(undefined); // undefined=not searched, null=not found
    const navigate = useNavigate();

    function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        setResult(getDeviceBySerial(query.trim()));
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
                    <button type="submit" className="btn btn--primary search-hero__btn">Buscar</button>
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
                            <p className="device-detail__razon">{result.razonSocial}</p>
                        </div>
                        <div className="device-detail__header-right">
                            <StatusBadge status={result.estatus} />
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
                        {field('Modelo', result.modelo)}
                        {field('Garantía', result.garantia)}
                        {field('Fecha de Ingreso', result.fechaIngreso)}
                        {field('Fecha Final', result.fechaFinal || '—')}
                        {field('Cotización', result.cotizacion ? `$${Number(result.cotizacion).toFixed(2)}` : '—')}
                    </div>

                    {result.informe && (
                        <div className="detail-section">
                            <h4 className="detail-section__title">Informe Técnico</h4>
                            <p className="detail-section__text">{result.informe}</p>
                        </div>
                    )}
                    {result.observaciones && (
                        <div className="detail-section">
                            <h4 className="detail-section__title">Observaciones</h4>
                            <p className="detail-section__text">{result.observaciones}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
