import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './ReportForm.css';

export default function ReportForm() {
    const reportRef = useRef();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Estado para los campos del formulario
    const [data, setData] = useState({
        fecha: new Date().toLocaleDateString('es-ES'),
        numInforme: '',

        // Info Cliente
        razonSocial: '',
        marca: '',
        serial: '',
        modelo: '',
        rif: '',
        procesadora: '',
        incidencia: '',
        operadora: '',

        // Recepción (Accesorios base: Si, No, N/A)
        acc_caja: '',
        acc_cargador: '',
        acc_bateria: '',
        acc_sim: '',
        acc_etiqueta: '',

        // Recepción (Adicionales)
        add_forro: '',
        add_declaracion: '',
        add_rollo: '',

        // Evaluación Técnica
        diagnostico: '',
        servicio: '',
        evidencias: '',

        // Condiciones
        cond_garantia: false,
        cond_cotizacion: false,
        cond_irreparable: false,

        // Nivel de Falla
        nivel_0: false,
        nivel_1: false,
        nivel_2: false,

        // Carga de Llaves
        llaves_req: '',

        // Footer
        tecnico: ''
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
                margin: [10, 10, 10, 10], // top, left, bottom, right
                filename: `Informe_Tecnico_${data.numInforme || 'S/N'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
            };

            // Genera PDF y restaura vista
            html2pdf().set(opt).from(element).save().then(() => {
                setIsGeneratingPdf(false);
            });
        }, 300); // Dar tiempo al DOM para renderizar CSS de PDF
    };

    return (
        <div className="report-container anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Crear Informe Técnico</h1>
                    <p className="page-sub">Llena los datos del informe a generar</p>
                </div>
                <button className="btn btn--primary" onClick={handleDownloadPdf}>
                    📄 Descargar PDF
                </button>
            </div>

            {/* Contenedor principal estilizado como el App */}
            <div
                className={`report-form-wrapper glass ${isGeneratingPdf ? 'pdf-generation-mode' : ''}`}
                data-pdf-mode={isGeneratingPdf}
                ref={reportRef}
            >

                {/* Header Oculto Visualmente pero para el PDF */}
                <div className="pdf-only-header">
                    <div className="pdf-logo">VAT&C</div>
                    <h2>INFORME TÉCNICO</h2>
                </div>

                <div className="form-section">
                    <h2 className="form-section__title">Encabezado del Informe</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input type="text" className="form-control" name="fecha" value={data.fecha} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Nº Informe</label>
                            <input type="text" className="form-control" name="numInforme" value={data.numInforme} onChange={handleChange} placeholder="PC-0038" />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="form-section__title">Información del Cliente</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Razón Social</label>
                            <input type="text" className="form-control" name="razonSocial" value={data.razonSocial} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Marca</label>
                            <input type="text" className="form-control" name="marca" value={data.marca} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Serial del Equipo</label>
                            <input type="text" className="form-control" name="serial" value={data.serial} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Modelo</label>
                            <input type="text" className="form-control" name="modelo" value={data.modelo} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>RIF</label>
                            <input type="text" className="form-control" name="rif" value={data.rif} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Procesadora</label>
                            <input type="text" className="form-control" name="procesadora" value={data.procesadora} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Incidencia Reportada</label>
                            <input type="text" className="form-control" name="incidencia" value={data.incidencia} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Operadora</label>
                            <input type="text" className="form-control" name="operadora" value={data.operadora} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="form-section__title">Recepción de Equipo</h2>
                    <div className="form-grid form-grid--3col">
                        <div className="form-group">
                            <label>Caja (Si/No)</label>
                            <select className="form-control" name="acc_caja" value={data.acc_caja} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Cargador (Si/No)</label>
                            <select className="form-control" name="acc_cargador" value={data.acc_cargador} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Batería (Si/No)</label>
                            <select className="form-control" name="acc_bateria" value={data.acc_bateria} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sim Card (Si/No)</label>
                            <select className="form-control" name="acc_sim" value={data.acc_sim} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Etiqueta de Garantía (Si/No)</label>
                            <select className="form-control" name="acc_etiqueta" value={data.acc_etiqueta} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Forro (Si/No)</label>
                            <select className="form-control" name="add_forro" value={data.add_forro} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Declaración Cont. (Si/No)</label>
                            <select className="form-control" name="add_declaracion" value={data.add_declaracion} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Rollo Térmico (Si/No)</label>
                            <select className="form-control" name="add_rollo" value={data.add_rollo} onChange={handleChange}>
                                <option value="">Seleccione</option><option value="si">SI</option><option value="no">NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="form-section__title">Evaluación Técnica</h2>
                    <div className="form-group">
                        <label>Diagnóstico Técnico</label>
                        <input type="text" className="form-control" name="diagnostico" value={data.diagnostico} onChange={handleChange} />
                    </div>
                    <div className="form-group mt-3">
                        <label>Servicio a realizar</label>
                        <input type="text" className="form-control" name="servicio" value={data.servicio} onChange={handleChange} />
                    </div>
                    <div className="form-group mt-3">
                        <label>Evidencias / Observaciones</label>
                        <textarea className="form-control form-control--textarea" name="evidencias" value={data.evidencias} onChange={handleChange} rows="4"></textarea>
                    </div>

                    <div className="form-grid mt-4">
                        <div className="form-group">
                            <label>Condición del equipo</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label"><input type="checkbox" name="cond_garantia" checked={data.cond_garantia} onChange={handleChange} /> Garantía</label>
                                <label className="checkbox-label"><input type="checkbox" name="cond_cotizacion" checked={data.cond_cotizacion} onChange={handleChange} /> Cotización</label>
                                <label className="checkbox-label"><input type="checkbox" name="cond_irreparable" checked={data.cond_irreparable} onChange={handleChange} /> Irreparable</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Nivel de falla</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label"><input type="checkbox" name="nivel_0" checked={data.nivel_0} onChange={handleChange} /> Nivel 0</label>
                                <label className="checkbox-label"><input type="checkbox" name="nivel_1" checked={data.nivel_1} onChange={handleChange} /> Nivel 1</label>
                                <label className="checkbox-label"><input type="checkbox" name="nivel_2" checked={data.nivel_2} onChange={handleChange} /> Nivel 2</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Requiere Carga de Llaves</label>
                            <select className="form-control" name="llaves_req" value={data.llaves_req} onChange={handleChange}>
                                <option value="">Seleccione</option>
                                <option value="si">SI</option>
                                <option value="no">NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                        <label>Técnico encargado</label>
                        <input type="text" className="form-control" name="tecnico" value={data.tecnico} onChange={handleChange} />
                    </div>
                </div>

            </div>
        </div>
    );
}
