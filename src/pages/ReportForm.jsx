import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './ReportForm.css';

export default function ReportForm() {
    const reportRef = useRef();

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
        llaves_si: false,
        llaves_no: false,

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
        const element = reportRef.current;
        const opt = {
            margin: [10, 10, 10, 10], // top, left, bottom, right
            filename: `Informe_Tecnico_${data.numInforme || 'S/N'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
        };

        // temporalmente oculta los bordes y botones si es necesario 
        // antes de generar (html2pdf copia el DOM directamente)
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="report-container anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Crear Informe Técnico</h1>
                    <p className="page-sub">Generador de informes en PDF (Independiente)</p>
                </div>
                <button className="btn btn--primary" onClick={handleDownloadPdf}>
                    📄 Descargar PDF
                </button>
            </div>

            {/* Este es el contenedor exacto que se renderizará a PDF */}
            <div className="report-canvas-wrapper glass">
                <div className="report-canvas" ref={reportRef}>
                    <div className="report-border">

                        {/* HEADER */}
                        <div className="rep-header">
                            <div className="rep-logo">
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#E47935' }}>VAT&C</span>
                                <div style={{ fontSize: '8px', color: '#555', marginTop: '4px' }}>Logo provisional</div>
                            </div>
                            <div className="rep-title">
                                <h1>INFORME TÉCNICO</h1>
                            </div>
                            <div className="rep-meta">
                                <label>Fecha <input type="text" name="fecha" value={data.fecha} onChange={handleChange} /></label>
                                <label>Nº Informe <input type="text" name="numInforme" value={data.numInforme} onChange={handleChange} /></label>
                            </div>
                        </div>

                        {/* INFORMACIÓN DEL CLIENTE */}
                        <div className="rep-section">
                            <h2 className="rep-section-title">INFORMACIÓN DEL CLIENTE</h2>
                            <div className="rep-grid-2col">
                                <label className="rep-row">
                                    <span>Razón Social:</span>
                                    <input type="text" name="razonSocial" value={data.razonSocial} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Marca:</span>
                                    <input type="text" name="marca" value={data.marca} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Serial del Equipo:</span>
                                    <input type="text" name="serial" value={data.serial} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Modelo:</span>
                                    <input type="text" name="modelo" value={data.modelo} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Rif:</span>
                                    <input type="text" name="rif" value={data.rif} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Procesadora:</span>
                                    <input type="text" name="procesadora" value={data.procesadora} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Incidencia<br />Reportada:</span>
                                    <input type="text" name="incidencia" value={data.incidencia} onChange={handleChange} />
                                </label>
                                <label className="rep-row">
                                    <span>Operadora:</span>
                                    <input type="text" name="operadora" value={data.operadora} onChange={handleChange} />
                                </label>
                            </div>
                        </div>

                        {/* RECEPCIÓN DE EQUIPO */}
                        <div className="rep-section">
                            <h2 className="rep-section-title">RECEPCIÓN DE EQUIPO</h2>
                            <div className="rep-grid-2col rep-tables">

                                <div className="rep-table-group">
                                    <div className="rep-table-header">
                                        <span>Accesorios:</span>
                                        <div className="rep-sino"><span>SI</span><span>NO</span></div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Caja</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="acc_caja" value="si" onChange={handleChange} />
                                            <input type="radio" name="acc_caja" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Cargador</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="acc_cargador" value="si" onChange={handleChange} />
                                            <input type="radio" name="acc_cargador" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Batería</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="acc_bateria" value="si" onChange={handleChange} />
                                            <input type="radio" name="acc_bateria" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Sim Card</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="acc_sim" value="si" onChange={handleChange} />
                                            <input type="radio" name="acc_sim" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Etiqueta de garantía</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="acc_etiqueta" value="si" onChange={handleChange} />
                                            <input type="radio" name="acc_etiqueta" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="rep-table-group">
                                    <div className="rep-table-header">
                                        <span>Accesorios adicionales:</span>
                                        <div className="rep-sino"><span>SI</span><span>NO</span></div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Forro</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="add_forro" value="si" onChange={handleChange} />
                                            <input type="radio" name="add_forro" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Declaración de Cont.</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="add_declaracion" value="si" onChange={handleChange} />
                                            <input type="radio" name="add_declaracion" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="rep-table-row">
                                        <span>Rollo Térmico</span>
                                        <div className="rep-checks">
                                            <input type="radio" name="add_rollo" value="si" onChange={handleChange} />
                                            <input type="radio" name="add_rollo" value="no" onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* EVALUACIÓN TÉCNICA */}
                        <div className="rep-section">
                            <h2 className="rep-section-title">EVALUACIÓN TÉCNICA</h2>

                            <div className="rep-eval-block">
                                <span className="rep-eval-label">Diagnostico Técnico:</span>
                                <input type="text" name="diagnostico" className="rep-eval-input" value={data.diagnostico} onChange={handleChange} />
                            </div>

                            <div className="rep-eval-block">
                                <span className="rep-eval-label">Servicio a realizar:</span>
                                <input type="text" name="servicio" className="rep-eval-input" value={data.servicio} onChange={handleChange} />
                            </div>

                            <div className="rep-eval-block rep-eval-block--tall">
                                <span className="rep-eval-label">Evidencias /<br />Observaciones:</span>
                                <textarea name="evidencias" className="rep-eval-textarea" value={data.evidencias} onChange={handleChange}></textarea>
                            </div>

                            <div className="rep-eval-footer">
                                <div className="rep-condicion">
                                    <span>Condición del<br />equipo:</span>
                                    <div className="rep-cond-checks">
                                        <label>Garantía <input type="checkbox" name="cond_garantia" checked={data.cond_garantia} onChange={handleChange} /></label>
                                        <label>Cotización <input type="checkbox" name="cond_cotizacion" checked={data.cond_cotizacion} onChange={handleChange} /></label>
                                        <label>Irreparable <input type="checkbox" name="cond_irreparable" checked={data.cond_irreparable} onChange={handleChange} /></label>
                                    </div>
                                </div>
                                <div className="rep-nivel">
                                    <span>Nivel de falla:</span>
                                    <div className="rep-nivel-checks">
                                        <label>Nivel 0 <input type="checkbox" name="nivel_0" checked={data.nivel_0} onChange={handleChange} /></label>
                                        <label>Nivel 1 <input type="checkbox" name="nivel_1" checked={data.nivel_1} onChange={handleChange} /></label>
                                        <label>Nivel 2 <input type="checkbox" name="nivel_2" checked={data.nivel_2} onChange={handleChange} /></label>
                                    </div>
                                </div>
                                <div className="rep-llaves">
                                    <span>Requiere<br />Carga de Llaves:</span>
                                    <div className="rep-llaves-checks">
                                        <label>NO <input type="radio" name="llaves_req" value="no" onChange={handleChange} /></label>
                                        <label>SI <input type="radio" name="llaves_req" value="si" onChange={handleChange} /></label>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="rep-footer">
                            <label>Técnico encargado: <input type="text" name="tecnico" value={data.tecnico} onChange={handleChange} /></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
