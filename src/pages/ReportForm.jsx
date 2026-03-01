import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import vatcLogo from '../assets/vatc-logo.jpg';
import './ReportForm.css';

export default function ReportForm() {
    const reportRef = useRef();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // Estado para los campos del formulario
    const [data, setData] = useState({
        fecha: new Date().toLocaleDateString('es-ES'),
        numInforme: '',

        razonSocial: '', marca: '', serial: '', modelo: '',
        rif: '', procesadora: '', incidencia: '', operadora: '',

        acc_caja: '', acc_cargador: '', acc_bateria: '', acc_sim: '', acc_etiqueta: '',
        add_forro: '', add_declaracion: '', add_rollo: '',

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
                        {isPreview ? 'Nomal' : '👁️ Vista Previa'}
                    </button>
                    <button className="btn btn--primary" onClick={handleDownloadPdf}>
                        📄 Descargar PDF
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

                {/* ─── Información del Cliente ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Información del Cliente</h3>
                    <div className="form-grid">
                        <div className="form-field form-field--wide">
                            <label className="form-label">Razón Social</label>
                            <input type="text" className="form-input" name="razonSocial" value={data.razonSocial} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">RIF</label>
                            <input type="text" className="form-input" name="rif" value={data.rif} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Marca</label>
                            <input type="text" className="form-input" name="marca" value={data.marca} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Modelo</label>
                            <input type="text" className="form-input" name="modelo" value={data.modelo} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Serial del Equipo</label>
                            <input type="text" className="form-input" name="serial" value={data.serial} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Procesadora</label>
                            <input type="text" className="form-input" name="procesadora" value={data.procesadora} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Operadora</label>
                            <input type="text" className="form-input" name="operadora" value={data.operadora} onChange={handleChange} />
                        </div>
                        <div className="form-field form-field--wide">
                            <label className="form-label">Incidencia Reportada</label>
                            <input type="text" className="form-input" name="incidencia" value={data.incidencia} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* ─── Recepción de Equipo ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Recepción de Equipo (Accesorios)</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Caja</label>
                            <select className="form-input" name="acc_caja" value={data.acc_caja} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Cargador</label>
                            <select className="form-input" name="acc_cargador" value={data.acc_cargador} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Batería</label>
                            <select className="form-input" name="acc_bateria" value={data.acc_bateria} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Sim Card</label>
                            <select className="form-input" name="acc_sim" value={data.acc_sim} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Etiqueta de Garantía</label>
                            <select className="form-input" name="acc_etiqueta" value={data.acc_etiqueta} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Forro</label>
                            <select className="form-input" name="add_forro" value={data.add_forro} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Declaración Cont.</label>
                            <select className="form-input" name="add_declaracion" value={data.add_declaracion} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Rollo Térmico</label>
                            <select className="form-input" name="add_rollo" value={data.add_rollo} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ─── Evaluación Técnica ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Evaluación Técnica</h3>
                    <div className="form-grid form-grid--single">
                        <div className="form-field">
                            <label className="form-label">Diagnóstico Técnico</label>
                            <input type="text" className="form-input" name="diagnostico" value={data.diagnostico} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Servicio a realizar</label>
                            <input type="text" className="form-input" name="servicio" value={data.servicio} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Evidencias / Observaciones</label>
                            <textarea className="form-input form-textarea" name="evidencias" value={data.evidencias} onChange={handleChange} rows={3}></textarea>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="form-section__title">Condición del Equipo</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Condición (Check)</label>
                            <div className="checkbox-group report-checkboxes report-checkboxes--col" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label><input type="checkbox" name="cond_garantia" checked={data.cond_garantia} onChange={handleChange} /> Garantía</label>
                                <label><input type="checkbox" name="cond_cotizacion" checked={data.cond_cotizacion} onChange={handleChange} /> Cotización</label>
                                <label><input type="checkbox" name="cond_irreparable" checked={data.cond_irreparable} onChange={handleChange} /> Irreparable</label>
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Nivel de falla (Check)</label>
                            <div className="checkbox-group report-checkboxes report-checkboxes--col" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label><input type="checkbox" name="nivel_0" checked={data.nivel_0} onChange={handleChange} /> Nivel 0</label>
                                <label><input type="checkbox" name="nivel_1" checked={data.nivel_1} onChange={handleChange} /> Nivel 1</label>
                                <label><input type="checkbox" name="nivel_2" checked={data.nivel_2} onChange={handleChange} /> Nivel 2</label>
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Requiere Carga de Llaves</label>
                            <select className="form-input" name="llaves_req" value={data.llaves_req} onChange={handleChange}>
                                <option value="">Seleccione</option>
                                <option value="si">SI</option>
                                <option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Técnico encargado</label>
                            <input type="text" className="form-input" name="tecnico" value={data.tecnico} onChange={handleChange} />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
