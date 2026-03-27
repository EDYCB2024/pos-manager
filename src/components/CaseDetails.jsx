import StatusBadge from './StatusBadge';

export default function CaseDetails({ form, variant = 'table', actions = null }) {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) return datePart;
        return `${day}-${month}-${year.slice(-2)}`;
    };

    if (variant === 'atc-vertical') {
        const atcRows = [
            { label: '# ID', value: form.id },
            { label: 'FECHA', value: formatDate(form.fecha) },
            { label: 'SERIAL', value: <code className="serial-code">{form.serial}</code> },
            { label: 'OPERADORA', value: form.operadora },
            { label: 'PROVEEDOR WIFI', value: form.proveedor_wifi },
            { label: 'REPORTADO EN', value: form.afiliado },
            { label: 'RIF', value: form.rif },
            { label: 'NOMBRE COMERCIO', value: form.nombre_comercio },
            { label: 'HORA DE REPORTE', value: form.hora_reporte },
            { label: 'HORA DE ATENCION', value: form.hora_atencion },
            { label: 'TIEMPO', value: form.tiempo },
            { label: 'PERSONA CONTACTO', value: form.persona_contacto },
            { label: 'TELEFONO CONTACTO', value: form.telefono_contacto },
            { label: 'CIUDAD', value: form.ciudad },
            { label: 'ESTADO', value: form.estado },
            { label: 'REPORTADO POR', value: form.reportado_by },
            { label: 'CATEGORIA DE FALLA', value: form.categoria_falla },
            { label: 'FALLA REPORTADA CLIENTE', value: form.falla_cliente },
            { label: 'ANALISTA OPERACIONES TÉCNICAS', value: form.analista_tecnico },
            { label: 'ESTATUS CASO', value: <StatusBadge status={form.estatus_caso} type="caso" /> },
            { label: 'OBSERVACIONES', value: form.observaciones },
            { label: 'OBSERVACION 2', value: form.observacion_2 },
            { label: 'OBSERVACION 3', value: form.observacion_3 },
            { label: 'VENCIMIENTO CASO', value: formatDate(form.vencimiento_caso) },
        ];

        return (
            <div className="case-details-table anim-fadeIn">
                <table className="details-table details-table--atc">
                    <thead>
                        <tr>
                            <th>Propiedad</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {atcRows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="prop-name">{row.label}</td>
                                <td className="prop-value">{row.value || '—'}</td>
                            </tr>
                        ))}
                        {actions && (
                            <tr>
                                <td className="prop-name">ACCIONES</td>
                                <td className="prop-value">{actions}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    if (variant === 'aliados-vertical') {
        const aliadoRows = [
            { label: 'N°', value: form.nro_caso || form.n || '—' },
            { label: 'FACTURA', value: formatDate(form.nro_factura) },
            { label: 'PROCESADORA', value: form.procesadora },
            { label: 'FECHA', value: formatDate(form.fecha) },
            { label: 'ALIADO', value: form.aliado },
            { label: 'MODELO', value: form.modelo },
            { label: 'RAZÓN SOCIAL', value: form.razon_social },
            { label: 'SERIAL', value: <code className="serial-code">{form.serial}</code> },
            { label: 'INFORME', value: form.informes },
            { label: 'RIF', value: form.rif },
            { label: 'INGRESO', value: form.ingreso },
            { label: 'SERIAL DE REMPLAZO', value: form.serial_reemplazo },
            { label: 'FALLA NOTIFICADA', value: form.falla_notificada },
            { label: 'CATEGORÍA', value: form.categoria },
            { label: 'FECHA FINAL', value: formatDate(form.fecha_final) },
            { label: 'ESTATUS DEL CASO', value: <StatusBadge status={form.estatus_caso} type="caso" /> },
            { label: 'ESTATUS', value: <StatusBadge status={form.estatus} type="reparacion" /> },
            { label: 'NIVEL', value: form.nivel },
            { label: 'GARANTIA', value: form.garantia },
            { label: 'INFORME2', value: form.informe },
            { label: 'COTIZACIÓN', value: form.cotizacion },
            { label: 'REPUESTO/SERVICIO 1', value: form.repuesto_1 },
            { label: 'REPUESTO/SERVICIO 2', value: form.repuesto_2 },
            { label: 'REPUESTO/SERVICIO 3', value: form.repuesto_3 },
            { label: 'OBSERVACIONES', value: form.observaciones },
        ];

        // Filter out rows where label matches table headers that might not exist in the form
        // But the user wants them to match the table, so we show them even if empty (—)
        // unless they are specific fields like 'PROCESADORA' which only certain allies have.

        return (
            <div className="case-details-table anim-fadeIn">
                <table className="details-table details-table--aliados">
                    <thead>
                        <tr>
                            <th>Propiedad</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aliadoRows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="prop-name">{row.label}</td>
                                <td className="prop-value">{row.value || '—'}</td>
                            </tr>
                        ))}
                        {actions && (
                            <tr>
                                <td className="prop-name">ACCIONES</td>
                                <td className="prop-value">{actions}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    if (variant === 'table') {
        const rows = [
            { label: 'Razón Social', value: form.razon_social, category: 'CLIENTE' },
            { label: 'RIF', value: form.rif, category: 'CLIENTE' },
            { label: 'Procesadora', value: form.procesadora, category: 'EQUIPO' },
            { label: 'Serial del Equipo', value: form.serial, category: 'EQUIPO' },
            { label: 'Modelo', value: form.modelo, category: 'EQUIPO' },
            { label: 'Marca', value: form.marca, category: 'EQUIPO' },
            { label: 'Serial Reemplazo', value: form.serial_reemplazo, category: 'EQUIPO' },
            { label: 'Garantía', value: form.garantia, category: 'PROCESO' },
            { label: 'Acepta Plan', value: form.acepta_plan, category: 'PROCESO' },
            { label: 'Nro de Ingreso', value: form.ingreso, category: 'PROCESO' },
            { label: 'Nro Factura', value: form.nro_factura, category: 'PROCESO' },
            { label: 'Lote', value: form.lote, category: 'PROCESO' },
            { label: 'Fecha de Ingreso', value: formatDate(form.fecha), category: 'REGISTRO' },
            { label: 'Aliado', value: form.aliado, category: 'REGISTRO' },
            { label: 'Técnico', value: form.tecnico, category: 'TÉCNICO' },
            { label: 'Estatus Caso', value: <StatusBadge status={form.estatus_caso} type="caso" />, category: 'ESTADO' },
            { label: 'Estatus Reparación', value: <StatusBadge status={form.estatus} type="reparacion" />, category: 'ESTADO' },
            { label: 'Falla Notificada', value: form.falla_notificada, category: 'DETALLES' },
            { label: 'Observaciones', value: form.observaciones || form.informes, category: 'DETALLES' },
        ];

        return (
            <div className="case-details-table anim-fadeIn">
                <table className="details-table">
                    <thead>
                        <tr>
                            <th>Propiedad</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="prop-name">{row.label}</td>
                                <td className="prop-value">{row.value || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="case-details anim-fadeIn">
            <div className="case-details__grid">
                {/* ─── Sección: Cliente y Equipo ──────────── */}
                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><rect x="14" y="2" width="8" height="12" rx="1" /></svg>
                        Cliente y Especificaciones del Equipo
                    </h4>
                    <div className="detail-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        <DetailItem label="Razón Social" value={form.razon_social} isBold />
                        <DetailItem label="RIF" value={form.rif} isCode />
                        <DetailItem label="Procesadora" value={form.procesadora} />
                        <DetailItem label="Nro de Ingreso" value={form.ingreso} />
                        <DetailItem label="Serial del Equipo" value={form.serial} isCode />
                        <DetailItem label="Modelo" value={form.modelo} />
                        <DetailItem label="Marca" value={form.marca} />
                        <DetailItem label="Serial Reemplazo" value={form.serial_reemplazo} />
                        <DetailItem label="Garantía" value={form.garantia} />
                        <DetailItem label="Acepta Plan" value={form.acepta_plan} />
                        <DetailItem label="Nro Factura" value={form.nro_factura} isCode />
                        <DetailItem label="Lote" value={form.lote} isCode />
                        <DetailItem label="Fecha Venta" value={formatDate(form.fecha_venta)} />
                        <DetailItem label="Informe Técnico" value={form.informe} isCode />
                    </div>
                </div>

                {/* ─── Sección: Registro e Ingreso ────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Registro de Ingreso
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Fecha Ingreso" value={formatDate(form.fecha)} />
                        <DetailItem label="Aliado" value={form.aliado} />
                        <DetailItem label="Nro de Guía" value={form.nro_guia} />
                    </div>
                </div>

                {/* ─── Sección: Técnico y Clasificación ────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Gestión Técnica
                    </h4>
                    <div className="detail-items">
                        <DetailItem label="Técnico" value={form.tecnico} />
                        <DetailItem label="Nivel" value={form.nivel} />
                        <DetailItem label="Categoría" value={form.categoria} />
                        <DetailItem label="Cotización" value={form.cotizacion ? `$${form.cotizacion}` : '—'} />
                    </div>
                </div>

                {/* ─── Sección: Estado y Resolución ─────────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22A10 10 0 1 1 12 2a10 10 0 0 1 0 20z" /><path d="M12 6v6l4 2" /></svg>
                        Estado y Resolución
                    </h4>
                    <div className="detail-items">
                        <div className="detail-item">
                            <span className="detail-item__label">Estatus del Caso</span>
                            <div style={{ marginTop: '6px' }}><StatusBadge status={form.estatus_caso} type="caso" /></div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-item__label">Estatus de Reparación</span>
                            <div style={{ marginTop: '6px' }}><StatusBadge status={form.estatus} type="reparacion" /></div>
                        </div>
                        {form.fecha_final && (
                            <DetailItem label="Finalizado el" value={formatDate(form.fecha_final)} isBold />
                        )}
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
                    <p className="detail-description detail-description--alt">{form.observaciones || form.informes || 'Sin observaciones registradas.'}</p>
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
