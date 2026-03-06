import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    addDevice, updateDevice, getDeviceById,
    ESTATUSES_CASO, ESTATUSES_REPARACION, CATEGORIAS, MODELOS,
    PROCESADORAS, TECNICOS, OPCIONES_SI_NO
} from '../store';
import MassiveUpload from '../components/MassiveUpload';
import StatusBadge from '../components/StatusBadge';
import './DeviceForm.css';

const today = new Date().toISOString().slice(0, 10);

const EMPTY = {
    fecha: today,
    aliado: '',
    modelo: MODELOS[0],
    razon_social: '',
    serial: '',
    informes: '',
    rif: '',
    ingreso: '',
    serial_reemplazo: '',
    falla_notificada: '',
    categoria: CATEGORIAS[0],
    fecha_final: '',
    estatus_caso: ESTATUSES_CASO[0],
    estatus: ESTATUSES_REPARACION[0],
    nivel: '',
    garantia: '',
    informe: '',
    cotizacion: '',
    repuesto_1: '',
    repuesto_2: '',
    repuesto_3: '',
    procesadora: PROCESADORAS[0],
    tecnico: TECNICOS[0],
    acepta_plan: '',
    nro_guia: '',
};

export default function DeviceForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [uploadMode, setUploadMode] = useState('individual'); // 'individual' or 'massive'
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [isReadOnly, setIsReadOnly] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        getDeviceById(id).then(d => {
            if (!d) { navigate('/devices'); return; }
            setForm({
                ...EMPTY,
                ...d,
                fecha: d.fecha || today,
            });
            setLoading(false);
        });
    }, [id, isEdit, navigate]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.serial.trim()) { setError('El serial es obligatorio.'); return; }
        if (!form.razon_social.trim()) { setError('La razón social es obligatoria.'); return; }
        setSaving(true);
        try {
            if (isEdit) {
                await updateDevice(id, form);
            } else {
                await addDevice(form);
            }
            navigate('/devices');
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    if (loading) return <div className="loading-state">Cargando...</div>;

    return (
        <div className="device-form-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{isEdit ? (isReadOnly ? 'Consulta de Caso' : 'Editar Caso') : 'Nuevo Caso'}</h1>
                    <p className="page-sub">{isEdit ? `Serial: ${form.serial}` : 'Complete los datos del nuevo caso POS'}</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Volver</button>
                    {isEdit && isReadOnly && (
                        <button className="btn btn--primary" onClick={() => setIsReadOnly(false)}>✎ Editar</button>
                    )}
                </div>
            </div>

            {/* Selector de Modo (Individual vs Masivo) */}
            {!isEdit && (
                <div className="tab-container" style={{ marginBottom: '24px' }}>
                    <div className="tab-group glass">
                        <button
                            className={`tab-btn ${uploadMode === 'individual' ? 'active' : ''}`}
                            onClick={() => setUploadMode('individual')}
                        >
                            📝 Carga Individual
                        </button>
                        <button
                            className={`tab-btn ${uploadMode === 'massive' ? 'active' : ''}`}
                            onClick={() => setUploadMode('massive')}
                        >
                            📁 Carga Masiva
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="form-error">{error}</div>}

            {uploadMode === 'individual' ? (
                isReadOnly ? (
                    <CaseDetailsView form={form} />
                ) : (
                    <form className="device-form glass" onSubmit={handleSubmit}>
                        {/* ─── Falla e Informes ────────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">Falla e Información Técnica</h3>
                            <div className="form-grid">
                                <div className="form-field form-field--wide">
                                    <label className="form-label">Falla Notificada</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        name="falla_notificada"
                                        value={form.falla_notificada}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Describe la falla reportada por el cliente..."
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Informe Técnico (Link/ID)</label>
                                    <input
                                        className="form-input"
                                        name="informe"
                                        value={form.informe}
                                        onChange={handleChange}
                                        placeholder="Ej. VT.5151"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ─── Identificación del Equipo ─────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">Identificación del Equipo</h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Fecha *</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        name="fecha"
                                        value={form.fecha}
                                        onChange={handleChange}
                                        required
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Serial *</label>
                                    <input
                                        className="form-input"
                                        name="serial"
                                        value={form.serial}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        placeholder="Ej. VX520-001234"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Modelo</label>
                                    <select className="form-input" name="modelo" value={form.modelo} onChange={handleChange} disabled={isReadOnly}>
                                        {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Serial de Reemplazo</label>
                                    <input className="form-input" name="serial_reemplazo" value={form.serial_reemplazo} onChange={handleChange} placeholder="Ej. VX520-009999" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Aliado</label>
                                    <input className="form-input" name="aliado" value={form.aliado} onChange={handleChange} placeholder="Nombre del aliado" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Garantía</label>
                                    <select className="form-input" name="garantia" value={form.garantia} onChange={handleChange} disabled={isReadOnly}>
                                        <option value="">— Seleccione —</option>
                                        <option value="Sí">Sí</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Acepta plan</label>
                                    <select className="form-input" name="acepta_plan" value={form.acepta_plan} onChange={handleChange} disabled={isReadOnly}>
                                        <option value="">— Seleccione —</option>
                                        {OPCIONES_SI_NO.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Nro de guía</label>
                                    <input
                                        className="form-input"
                                        name="nro_guia"
                                        value={form.nro_guia}
                                        onChange={handleChange}
                                        placeholder="Ej. 12345678"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ─── Datos del Cliente ─────────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">Datos del Cliente</h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">RIF</label>
                                    <input className="form-input" name="rif" value={form.rif} onChange={handleChange} placeholder="Ej. J-12345678-9" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Ingreso</label>
                                    <input className="form-input" name="ingreso" value={form.ingreso} onChange={handleChange} placeholder="Nro. de ingreso" disabled={isReadOnly} />
                                </div>
                                <div className="form-field form-field--wide">
                                    <label className="form-label">Razón Social *</label>
                                    <input className="form-input" name="razon_social" value={form.razon_social} onChange={handleChange} placeholder="Ej. Comercial El Éxito C.A." required disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Procesadora</label>
                                    <select className="form-input" name="procesadora" value={form.procesadora} onChange={handleChange} disabled={isReadOnly}>
                                        {PROCESADORAS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Técnico Encargado</label>
                                    <select className="form-input" name="tecnico" value={form.tecnico} onChange={handleChange} disabled={isReadOnly}>
                                        {TECNICOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ─── Estatus y Clasificación ─────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">Estatus y Clasificación</h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Estatus del Caso</label>
                                    <select className="form-input" name="estatus_caso" value={form.estatus_caso} onChange={handleChange} disabled={isReadOnly}>
                                        {ESTATUSES_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Estatus de Reparación</label>
                                    <select className="form-input" name="estatus" value={form.estatus} onChange={handleChange} disabled={isReadOnly}>
                                        {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Nivel</label>
                                    <input className="form-input" name="nivel" value={form.nivel} onChange={handleChange} placeholder="Nivel técnico" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Categoría</label>
                                    <select className="form-input" name="categoria" value={form.categoria} onChange={handleChange} disabled={isReadOnly}>
                                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Fecha Final</label>
                                    <input className="form-input" type="date" name="fecha_final" value={form.fecha_final} onChange={handleChange} disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Cotización</label>
                                    <input className="form-input" name="cotizacion" value={form.cotizacion} onChange={handleChange} placeholder="Ej. 50.00 o Pendiente" disabled={isReadOnly} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section__title">Repuestos y Servicios</h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Repuesto/Servicio 1</label>
                                    <input className="form-input" name="repuesto_1" value={form.repuesto_1} onChange={handleChange} placeholder="Descripción del repuesto 1" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Repuesto/Servicio 2</label>
                                    <input className="form-input" name="repuesto_2" value={form.repuesto_2} onChange={handleChange} placeholder="Descripción del repuesto 2" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Repuesto/Servicio 3</label>
                                    <input className="form-input" name="repuesto_3" value={form.repuesto_3} onChange={handleChange} placeholder="Descripción del repuesto 3" disabled={isReadOnly} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section__title">Observaciones</h3>
                            <div className="form-grid form-grid--single">
                                <div className="form-field">
                                    <label className="form-label">Observaciones Generales</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        name="informes"
                                        value={form.informes}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe el diagnóstico y trabajo realizado..."
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isReadOnly && (
                            <div className="form-actions anim-fadeIn">
                                <button type="button" className="btn btn--ghost" onClick={() => (isEdit ? setIsReadOnly(true) : navigate(-1))}>
                                    {isEdit ? 'Cancelar edición' : 'Cancelar'}
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={saving}>
                                    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar caso'}
                                </button>
                            </div>
                        )}
                    </form>
                )
            ) : (
                <MassiveUpload onComplete={() => navigate('/devices')} />
            )}
        </div>
    );
}

function CaseDetailsView({ form }) {
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
                    <h4 className="detail-section__title">📦 Información del Equipo</h4>
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
                    <h4 className="detail-section__title">👤 Datos del Cliente</h4>
                    <div className="detail-items">
                        <DetailItem label="Razón Social" value={form.razon_social} isBold />
                        <DetailItem label="RIF" value={form.rif} isCode />
                        <DetailItem label="Nro de Ingreso" value={form.ingreso} />
                        <DetailItem label="Procesadora" value={form.procesadora} />
                    </div>
                </div>

                {/* ─── Sección: Técnico y Costos ────────── */}
                <div className="detail-section">
                    <h4 className="detail-section__title">🔧 Gestión y Costos</h4>
                    <div className="detail-items">
                        <DetailItem label="Técnico" value={form.tecnico} />
                        <DetailItem label="Nivel" value={form.nivel} />
                        <DetailItem label="Categoría" value={form.categoria} />
                        <DetailItem label="Cotización" value={form.cotizacion ? `$${form.cotizacion}` : '—'} />
                        <DetailItem label="Informe Técnico" value={form.informe} isCode />
                    </div>
                </div>

                {/* ─── Sección: Repuestos ──────────────── */}
                {(form.repuesto_1 || form.repuesto_2 || form.repuesto_3) && (
                    <div className="detail-section">
                        <h4 className="detail-section__title">🛠️ Repuestos y Servicios</h4>
                        <ul className="detail-list">
                            {form.repuesto_1 && <li>{form.repuesto_1}</li>}
                            {form.repuesto_2 && <li>{form.repuesto_2}</li>}
                            {form.repuesto_3 && <li>{form.repuesto_3}</li>}
                        </ul>
                    </div>
                )}

                {/* ─── Sección: Falla y Obs ─────────────── */}
                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">⚠️ Falla Notificada</h4>
                    <p className="detail-description">{form.falla_notificada || 'Sin falla descrita.'}</p>
                </div>

                <div className="detail-section detail-section--wide">
                    <h4 className="detail-section__title">📝 Observaciones / Diagnóstico</h4>
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
