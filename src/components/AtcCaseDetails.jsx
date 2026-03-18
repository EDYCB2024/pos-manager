import StatusBadge from './StatusBadge';
import '../pages/DeviceForm.css';

export default function AtcCaseDetails({ form }) {
    const val = (v) => v || '—';

    return (
        <div className="case-details anim-fadeIn">
            <div className="case-details__grid">

                {/* ─── Cliente y Comercio ─────────────── */}
                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Cliente y Comercio
                    </h4>
                    <div className="detail-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        <DetailItem label="Nombre Comercio" value={form.nombre_comercio} isBold />
                        <DetailItem label="RIF" value={form.rif} isCode />
                        <DetailItem label="Afiliado (Reportado en)" value={form.afiliado} isCode />
                        <DetailItem label="Persona de Contacto" value={form.persona_contacto} />
                        <DetailItem label="Teléfono de Contacto" value={form.telefono_contacto} />
                        <DetailItem label="Ciudad" value={form.ciudad} />
                        <DetailItem label="Estado" value={form.estado} />
                    </div>
                </div>

                {/* ─── Equipo y Conectividad ──────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                        </svg>
                        Equipo y Conectividad
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Serial" value={form.serial} isCode />
                        <DetailItem label="Operadora" value={form.operadora} />
                        <DetailItem label="Proveedor WiFi" value={form.proveedor_wifi} />
                    </div>
                </div>

                {/* ─── Registro del Reporte ───────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/>
                            <path d="M3 10h18"/>
                        </svg>
                        Registro del Reporte
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Fecha" value={form.fecha} />
                        <DetailItem label="Hora de Reporte" value={form.hora_reporte} />
                        <DetailItem label="Hora de Atención" value={form.hora_atencion} />
                        <DetailItem label="Tiempo" value={form.tiempo} />
                        <DetailItem label="Reportado por" value={form.reportado_by} />
                    </div>
                </div>

                {/* ─── Estado ─────────────────────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22A10 10 0 1 1 12 2a10 10 0 0 1 0 20z"/><path d="M12 6v6l4 2"/>
                        </svg>
                        Estado del Caso
                    </h4>
                    <div className="detail-items">
                        <div className="detail-item">
                            <span className="detail-item__label">Estatus</span>
                            <div style={{ marginTop: '6px' }}>
                                <StatusBadge status={form.estatus_caso} type="caso" />
                            </div>
                        </div>
                        <DetailItem label="Categoría de Falla" value={form.categoria_falla} />
                        <DetailItem label="Analista Técnico" value={form.analista_tecnico} />
                        <DetailItem label="Vencimiento" value={form.vencimiento_caso} />
                    </div>
                </div>

                {/* ─── Falla Reportada ────────────────── */}
                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <path d="M12 9v4"/><path d="M12 17h.01"/>
                        </svg>
                        Falla Reportada por el Cliente
                    </h4>
                    <p className="detail-description">{val(form.falla_cliente)}</p>
                </div>

                {/* ─── Observaciones ──────────────────── */}
                {(form.observaciones || form.observacion_2 || form.observacion_3) && (
                    <div className="detail-section detail-section--wide">
                        <h4 className="detail-section__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5"/>
                                <path d="M15 21V15h6"/><path d="M21 3h-6v6h6V3z"/>
                            </svg>
                            Observaciones / Seguimiento
                        </h4>
                        {form.observaciones && <p className="detail-description">{form.observaciones}</p>}
                        {form.observacion_2 && <p className="detail-description detail-description--alt">{form.observacion_2}</p>}
                        {form.observacion_3 && <p className="detail-description detail-description--alt">{form.observacion_3}</p>}
                    </div>
                )}

            </div>
        </div>
    );
}

function DetailItem({ label, value, isCode, isBold }) {
    return (
        <div className="detail-item">
            <span className="detail-item__label">{label}</span>
            <span className={`detail-item__value ${isCode ? 'code' : ''} ${isBold ? 'bold' : ''}`}>
                {value || '—'}
            </span>
        </div>
    );
}
