import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import vatcLogo from '../assets/vatc-logo.jpg';
import { TECNICOS, PROCESADORAS, MODELOS, OPERADORAS } from '../store';
import './ReportForm.css';

export default function ReportForm() {
    const reportRef = useRef();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Cliente', 'Equipo', 'Evaluación', 'Condiciones'];

    // Estado para los campos del formulario
    const [data, setData] = useState({
        fecha: new Date().toLocaleDateString('es-ES'),
        numInforme: '',

        razonSocial: '', marca: 'Newland', serial: '', modelo: '',
        rif: '', procesadora: '', incidencia: '', operadora: '',

        acc_caja: false, acc_cargador: false, acc_bateria: false, acc_sim: false, acc_etiqueta: false,
        add_forro: false, add_declaracion: false, add_rollo: false,

        diagnostico: '', servicio: '', evidencias: '',
        cond_garantia: false, cond_cotizacion: false, cond_irreparable: false,
        nivel_0: false, nivel_1: false, nivel_2: false,
        llaves_req: '', tecnico: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDownloadPdf = () => {
        setIsGeneratingPdf(true);

        setTimeout(() => {
            const element = reportRef.current;
            const opt = {
                margin: 0,
                filename: `Informe_Tecnico_${data.numInforme || 'S/N'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                setIsGeneratingPdf(false);
            });
        }, 300);
    };

    return (
        <div className="device-form-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Crear Informe Técnico</h1>
                    <p className="page-sub">Llena los datos del informe a generar en PDF</p>
                </div>
                <div className="page-header__actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button className="btn btn--ghost" onClick={() => setIsPreview(!isPreview)}>
                        {isPreview ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                Normal
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                Vista Previa
                            </>
                        )}
                    </button>
                    <button className="btn btn--primary" onClick={handleDownloadPdf}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        Descargar PDF
                    </button>
                </div>
            </div>

            <form
                className={`device-form glass report-form-custom ${isGeneratingPdf || isPreview ? 'pdf-generation-mode' : ''}`}
                data-pdf-mode={isGeneratingPdf || isPreview}
                ref={reportRef}
                onSubmit={(e) => e.preventDefault()}
            >

                {/* ─── Cabecera del Documento ────────────────────── */}
                <div className="report-header-unified">
                    <div className="report-header__left">
                        <img src={vatcLogo} alt="VAT&C Logo" className="report-logo-img" />
                    </div>
                    <div className="report-header__center">
                        <h2>INFORME TÉCNICO</h2>
                    </div>
                    <div className="report-header__right">
                        <div className="form-field form-field--compact">
                            <label className="form-label">Fecha de Ingreso</label>
                            <input type="text" className="form-input" name="fecha" value={data.fecha} onChange={handleChange} />
                        </div>
                        <div className="form-field form-field--compact">
                            <label className="form-label">Nº Informe</label>
                            <input type="text" className="form-input" name="numInforme" value={data.numInforme} onChange={handleChange} placeholder="Ej. PC-0038" />
                        </div>
                    </div>
                </div>

                {/* ─── Stepper Visual indicator ───────────────────── */}
                {!isGeneratingPdf && !isPreview && (
                    <div className="stepper-indicator">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`step-item ${idx <= activeStep ? 'active' : ''} ${idx < activeStep ? 'completed' : ''}`} onClick={() => idx < activeStep && setActiveStep(idx)}>
                                <div className="step-number">{idx + 1}</div>
                                <span className="step-label">{step}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Información del Cliente (Step 0) ─────────────────────── */}
                {(activeStep === 0 || isGeneratingPdf || isPreview) && (
                    <div className="form-section anim-fadeUp">
                        <h3 className="form-section__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Información del Cliente y Equipo
                        </h3>
                        <div className="report-split-grid">
                            {/* Columna Izquierda: Identificación e Incidencia */}
                            <div className="report-split-column">
                                <div className="form-field">
                                    <label className="form-label">Razón Social</label>
                                    <textarea
                                        className="form-input form-textarea--auto"
                                        name="razonSocial"
                                        value={data.razonSocial}
                                        onChange={handleChange}
                                        rows={1}
                                        placeholder="Nombre de la empresa..."
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Serial del Equipo</label>
                                    <input type="text" className="form-input" name="serial" value={data.serial} onChange={handleChange} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">RIF</label>
                                    <input type="text" className="form-input" name="rif" value={data.rif} onChange={handleChange} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Incidencia Reportada</label>
                                    <textarea
                                        className="form-input form-textarea--auto"
                                        name="incidencia"
                                        value={data.incidencia}
                                        onChange={handleChange}
                                        rows={1}
                                        placeholder="Describe la falla reportada..."
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha: Especificaciones Técnicas */}
                            <div className="report-split-column">
                                <div className="form-field">
                                    <label className="form-label">Marca</label>
                                    <input type="text" className="form-input" name="marca" value={data.marca} onChange={handleChange} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Modelo</label>
                                    <select className="form-input" name="modelo" value={data.modelo} onChange={handleChange}>
                                        <option value="">Seleccione</option>
                                        {MODELOS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Procesadora</label>
                                    <select className="form-input" name="procesadora" value={data.procesadora} onChange={handleChange}>
                                        <option value="">Seleccione</option>
                                        {PROCESADORAS.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Operadora</label>
                                    <select className="form-input" name="operadora" value={data.operadora} onChange={handleChange}>
                                        <option value="">Seleccione</option>
                                        {OPERADORAS.map(o => (
                                            <option key={o} value={o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Recepción de Equipo (Step 1) ─────────────────────── */}
                {(activeStep === 1 || isGeneratingPdf || isPreview) && (
                    <div className="form-section anim-fadeUp">
                        <h3 className="form-section__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="m21 16 1.4-1.4a2 2 0 0 0 0-2.8l-5.6-5.6a2 2 0 0 0-2.8 0L12.6 7.6" /><path d="m3 16-1.4-1.4a2 2 0 0 1 0-2.8l5.6-5.6a2 2 0 0 1 2.8 0l1.4 1.4" /><path d="M17 11h.01" /><path d="M7 11h.01" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M3 16h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" /></svg>
                            Recepción de Equipo (Accesorios)
                        </h3>
                        <div className="form-grid report-checkboxes-grid">
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="acc_caja" checked={data.acc_caja} onChange={handleChange} />
                                    <span>Caja</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="acc_cargador" checked={data.acc_cargador} onChange={handleChange} />
                                    <span>Cargador</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="acc_bateria" checked={data.acc_bateria} onChange={handleChange} />
                                    <span>Batería</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="acc_sim" checked={data.acc_sim} onChange={handleChange} />
                                    <span>Sim Card</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="acc_etiqueta" checked={data.acc_etiqueta} onChange={handleChange} />
                                    <span>Etiqueta Garantía</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="add_forro" checked={data.add_forro} onChange={handleChange} />
                                    <span>Forro Protec.</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="add_declaracion" checked={data.add_declaracion} onChange={handleChange} />
                                    <span>Declaración Cont.</span>
                                </label>
                            </div>
                            <div className="checkbox-field">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="add_rollo" checked={data.add_rollo} onChange={handleChange} />
                                    <span>Rollo Térmico</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Evaluación Técnica (Step 2) ─────────────────────── */}
                {(activeStep === 2 || isGeneratingPdf || isPreview) && (
                    <div className="form-section anim-fadeUp">
                        <h3 className="form-section__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                            Evaluación Técnica
                        </h3>
                        <div className="form-grid form-grid--single">
                            <div className="form-field">
                                <label className="form-label">Diagnóstico Técnico</label>
                                <textarea
                                    className="form-input form-textarea--auto tecnico-primary"
                                    name="diagnostico"
                                    value={data.diagnostico}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Detalle el estado técnico encontrado..."
                                />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Servicio a realizar</label>
                                <textarea
                                    className="form-input form-textarea--auto tecnico-primary"
                                    name="servicio"
                                    value={data.servicio}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Describa las acciones correctivas aplicadas..."
                                />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Evidencias / Observaciones</label>
                                <textarea className="form-input form-textarea" name="evidencias" value={data.evidencias} onChange={handleChange} rows={5} placeholder="Otras anotaciones importantes del equipo..."></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Condición del Equipo (Step 3) ─────────────────────── */}
                {(activeStep === 3 || isGeneratingPdf || isPreview) && (
                    <div className="form-section anim-fadeUp">
                        <h3 className="form-section__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                            Condición del Equipo
                        </h3>
                        <div className="report-compact-row">
                            <div className="form-field">
                                <label className="form-label">Condición</label>
                                <div className="checkbox-row-group">
                                    <label><input type="checkbox" name="cond_garantia" checked={data.cond_garantia} onChange={handleChange} /> Garantía</label>
                                    <label><input type="checkbox" name="cond_cotizacion" checked={data.cond_cotizacion} onChange={handleChange} /> Cotización</label>
                                    <label><input type="checkbox" name="cond_irreparable" checked={data.cond_irreparable} onChange={handleChange} /> Irreparable</label>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Nivel de falla</label>
                                <div className="checkbox-row-group">
                                    <label><input type="checkbox" name="nivel_0" checked={data.nivel_0} onChange={handleChange} /> N0</label>
                                    <label><input type="checkbox" name="nivel_1" checked={data.nivel_1} onChange={handleChange} /> N1</label>
                                    <label><input type="checkbox" name="nivel_2" checked={data.nivel_2} onChange={handleChange} /> N2</label>
                                </div>
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-field">
                                <label className="form-label">Llaves Req.</label>
                                <select className="form-input" name="llaves_req" value={data.llaves_req} onChange={handleChange}>
                                    <option value="">Seleccione</option>
                                    <option value="si">SI</option>
                                    <option value="no">NO</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Técnico encargado</label>
                                <select className="form-input" name="tecnico" value={data.tecnico} onChange={handleChange}>
                                    <option value="">Seleccione</option>
                                    {TECNICOS.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Navigation Buttons ────────────────────────── */}
                {!isGeneratingPdf && !isPreview && (
                    <div className="stepper-actions">
                        <button type="button" className={`btn btn--secondary ${activeStep === 0 ? 'disabled' : ''}`} onClick={() => activeStep > 0 && setActiveStep(v => v - 1)} disabled={activeStep === 0}>
                            Anterior
                        </button>
                        <button type="button" className="btn btn--primary" onClick={() => activeStep < steps.length - 1 ? setActiveStep(v => v + 1) : handleDownloadPdf()}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    Generar PDF
                                </>
                            )}
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
}
