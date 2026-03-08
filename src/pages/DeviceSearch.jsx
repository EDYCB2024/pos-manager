import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceBySerial, getReportUrl } from '../store';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './DeviceSearch.css';

export default function DeviceSearch() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(undefined); // undefined=not searched, null=not found
    const [searching, setSearching] = useState(false);
    const [viewingDevice, setViewingDevice] = useState(null);
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

            {result && result.length === 0 && (
                <div className="empty-state anim-fadeUp">
                    <span className="empty-state__icon">🔍</span>
                    <p>No se encontró ningún equipo con serial <code className="serial-code">"{query}"</code>.</p>
                </div>
            )}

            {result && result.length > 0 && result.map(d => (
                <div key={d.id} className="device-detail glass anim-fadeUp" style={{ marginBottom: '2rem' }}>
                    <div className="device-detail__header">
                        <div>
                            <code className="serial-hero">{d.serial}</code>
                            <p className="device-detail__razon">{d.razon_social}</p>
                            <span className="badge badge--ingreso">Ingreso: {d.ingreso || '—'}</span>
                        </div>
                        <div className="device-detail__header-right">
                            <StatusBadge status={d.estatus_caso} type="caso" />
                            <StatusBadge status={d.estatus} type="reparacion" />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn--secondary btn--sm"
                                    onClick={() => setViewingDevice(d)}
                                >
                                    Ver Detalle
                                </button>
                                <button
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => navigate(`/devices/${d.id}/edit`)}
                                >
                                    ✎ Editar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-grid">
                        {field('RIF', d.rif)}
                        {field('Aliado', d.aliado)}
                        {field('Procesadora', d.procesadora)}
                        {field('Técnico', d.tecnico)}
                        {field('Ingreso', d.ingreso)}
                        {field('Modelo', d.modelo)}
                        {field('Categoría', d.categoria)}
                        <div className="detail-field">
                            <span className="detail-field__label">Informe Técnico</span>
                            <div className="detail-field__value">
                                {d.informe ? (
                                    <a
                                        href={getReportUrl(d.informe)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="report-link"
                                    >
                                        📄 {d.informe}
                                    </a>
                                ) : '—'}
                            </div>
                        </div>
                        {field('Nivel', d.nivel)}
                        {field('Garantía', d.garantia || 'No')}
                        {field('Acepta Plan', d.acepta_plan || 'No')}
                        {field('Fecha', d.fecha)}
                        {field('Fecha Final', d.fecha_final)}
                        {field('Serial Reemplazo', d.serial_reemplazo)}
                        {field('Cotización', d.cotizacion)}
                    </div>

                    {(d.falla_notificada || d.informe || d.informes) && (
                        <div className="detail-sections">
                            {d.falla_notificada && (
                                <div className="detail-section">
                                    <h4 className="detail-section__title">Falla Notificada</h4>
                                    <p className="detail-section__text">{d.falla_notificada}</p>
                                </div>
                            )}
                            {d.informe && (
                                <div className="detail-section">
                                    <h4 className="detail-section__title">Informe Técnico</h4>
                                    <p className="detail-section__text">{d.informe}</p>
                                </div>
                            )}
                            {d.informes && (
                                <div className="detail-section">
                                    <h4 className="detail-section__title">Observaciones Generales</h4>
                                    <p className="detail-section__text">{d.informes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            {/* Case Details Modal */}
            {viewingDevice && (
                <div className="modal-overlay" onClick={() => setViewingDevice(null)}>
                    <div className="modal modal--wide glass anim-fadeUp" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Detalles del Caso</h3>
                            <button className="modal__close" onClick={() => setViewingDevice(null)}>✕</button>
                        </div>
                        <div className="modal__body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '0' }}>
                            <CaseDetails form={viewingDevice} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
