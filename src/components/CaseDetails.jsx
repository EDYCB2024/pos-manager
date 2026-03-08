import StatusBadge from './StatusBadge';

export default function CaseDetails({ form }) {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        return `${day}-${month}-${year.slice(-2)}`;
    };

    return (
        <div className="case-details glass anim-fadeIn">
            {/* ─── Cabecera de Estado ────────────────── */}
            <div className="case-details__header">
                <div className="detail-status-group">
                    <div className="detail-status">
                        <span className="detail-status__label">Estatus del Caso</span>
                        <StatusBadge status={form.estatus_caso} type="caso" />
                    </div>
                    <div className="detail-status">
                        <span className="detail-status__label">Estatus Reparación</span>
                        <StatusBadge status={form.estatus} type="reparacion" />
                    </div>
                </div>
                {form.fecha_final && (
                    <div className="detail-date-final">
                        <span className="detail-date-final__label">Finalizado el</span>
                        <span className="detail-date-final__value">{formatDate(form.fecha_final)}</span>
                    </div>
                )}
            </div>

            <div className="case-details__grid">
                {/* ─── Sección: Identificación ──────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="m21 16 1.4-1.4a2 2 0 0 0 0-2.8l-5.6-5.6a2 2 0 0 0-2.8 0L12.6 7.6" /><path d="m3 16-1.4-1.4a2 2 0 0 1 0-2.8l5.6-5.6a2 2 0 0 1 2.8 0l1.4 1.4" /><path d="M17 11h.01" /><path d="M7 11h.01" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M3 16h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" /></svg>
                        Información del Equipo
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Serial" value={form.serial} isCode />
                        <DetailItem label="Modelo" value={form.modelo} />
                        <DetailItem label="Fecha Ingreso" value={formatDate(form.fecha)} />
                        <DetailItem label="Aliado" value={form.aliado} />
                        <DetailItem label="Nro de Guía" value={form.nro_guia} />
                        <DetailItem label="Serial Reemplazo" value={form.serial_reemplazo} />
                        <DetailItem label="Garantía" value={form.garantia} />
                        <DetailItem label="Acepta Plan" value={form.acepta_plan} />
                    </div>
                </div>

                {/* ─── Sección: Cliente ────────────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Datos del Cliente
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Razón Social" value={form.razon_social} isBold />
                        <DetailItem label="RIF" value={form.rif} isCode />
                        <DetailItem label="Nro de Ingreso" value={form.ingreso} />
                        <DetailItem label="Procesadora" value={form.procesadora} />
                    </div>
                </div>

                {/* ─── Sección: Técnico y Costos ────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        Gestión y Costos
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Técnico" value={form.tecnico} />
                        <DetailItem label="Nivel" value={form.nivel} />
                        <DetailItem label="Categoría" value={form.categoria} />
                        <DetailItem label="Cotización" value={form.cotizacion ? `$${form.cotizacion}` : '—'} />
                        <DetailItem label="Informe Técnico" value={form.informe} isCode />
                    </div>
                </div>

                {/* ─── Sección: Falla y Obs ─────────────── */}
                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        Falla Notificada
                    </h4>
                    <p className="detail-description">{form.falla_notificada || 'Sin falla descrita.'}</p>
                </div>

                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5" /><path d="M15 21V15h6" /><path d="M21 3h-6v6h6V3z" /></svg>
                        Observaciones / Diagnóstico
                    </h4>
                    <p className="detail-description detail-description--alt">{form.informes || 'Sin observaciones registradas.'}</p>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isCode, isBold, isStatus }) {
    return (
        <div className="detail-item">
            <span className="detail-item__label">{label}</span>
            <span className={`detail-item__value ${isCode ? 'code' : ''} ${isBold ? 'bold' : ''}`}>
                {value || '—'}
            </span>
        </div>
    );
}
