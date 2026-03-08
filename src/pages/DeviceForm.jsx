import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    addDevice, updateDevice, getDeviceById,
    ESTATUSES_CASO, ESTATUSES_REPARACION, CATEGORIAS, MODELOS,
    PROCESADORAS, TECNICOS, OPCIONES_SI_NO
} from '../store';
import MassiveUpload from '../components/MassiveUpload';
import StatusBadge from '../components/StatusBadge';
import CaseDetails from '../components/CaseDetails';
import './DeviceForm.css';

const today = new Date().toISOString().slice(0, 10);

const EMPTY = {
    fecha: today,
    aliado: '',
    modelo: MODELOS[0],
    marca: 'Newland',
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
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [uploadMode, setUploadMode] = useState('individual'); // 'individual' or 'massive'
    const [form, setForm] = useState(() => {
        const aliadoParam = searchParams.get('aliado');
        const serialParam = searchParams.get('serial');
        return {
            ...EMPTY,
            ...(aliadoParam && { aliado: aliadoParam }),
            ...(serialParam && { serial: serialParam })
        };
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [isReadOnly, setIsReadOnly] = useState(isEdit);

    useEffect(() => {
        const aliadoParam = searchParams.get('aliado');
        const serialParam = searchParams.get('serial');
        if (!isEdit) {
            setForm(prev => ({
                ...prev,
                ...(aliadoParam && { aliado: aliadoParam }),
                ...(serialParam && { serial: serialParam })
            }));
        }
    }, [searchParams, isEdit]);

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
                    <CaseDetails form={form} />
                ) : (
                    <form className="device-form glass anim-fadeUp" onSubmit={handleSubmit}>
                        {/* ─── Falla e Informes ────────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                Falla Notificada
                            </h3>
                            <div className="form-grid form-grid--single">
                                <div className="form-field">
                                    <label className="form-label">Falla Notificada</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        name="falla_notificada"
                                        value={form.falla_notificada}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Escribe la falla que reporta el cliente..."
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ─── Información Inicial ─────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                Identificación y Aliado
                            </h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Fecha de Ingreso</label>
                                    <input className="form-input" type="date" name="fecha" value={form.fecha} onChange={handleChange} disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Serial del Equipo</label>
                                    <input className="form-input" name="serial" value={form.serial} onChange={handleChange} placeholder="Serial único del POS" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Aliado / Punto de Venta</label>
                                    <input className="form-input" name="aliado" value={form.aliado} onChange={handleChange} placeholder="Nombre del aliado" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Nro de Guía</label>
                                    <input className="form-input" name="nro_guia" value={form.nro_guia} onChange={handleChange} placeholder="Si aplica..." disabled={isReadOnly} />
                                </div>
                            </div>
                        </div>

                        {/* ─── Datos del Cliente ─────────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                Datos del Cliente
                            </h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Razón Social</label>
                                    <input className="form-input" name="razon_social" value={form.razon_social} onChange={handleChange} placeholder="Nombre del comercio" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">RIF</label>
                                    <input className="form-input" name="rif" value={form.rif} onChange={handleChange} placeholder="J-12345678-0" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Nro de Ingreso</label>
                                    <input className="form-input" name="ingreso" value={form.ingreso} onChange={handleChange} placeholder="Control interno" disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Procesadora</label>
                                    <select className="form-input" name="procesadora" value={form.procesadora} onChange={handleChange} disabled={isReadOnly}>
                                        {PROCESADORAS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ─── Especificaciones del Equipo ─────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                Especificaciones del Equipo
                            </h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Marca</label>
                                    <input className="form-input" name="marca" value={form.marca} onChange={handleChange} disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Modelo</label>
                                    <select className="form-input" name="modelo" value={form.modelo} onChange={handleChange} disabled={isReadOnly}>
                                        {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Serial de Reemplazo</label>
                                    <input className="form-input" name="serial_reemplazo" value={form.serial_reemplazo} onChange={handleChange} placeholder="Si aplica..." disabled={isReadOnly} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Acepta Plan</label>
                                    <select className="form-input" name="acepta_plan" value={form.acepta_plan} onChange={handleChange} disabled={isReadOnly}>
                                        <option value="">Seleccione</option>
                                        <option value="Sí">Sí</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Garantía</label>
                                    <select className="form-input" name="garantia" value={form.garantia} onChange={handleChange} disabled={isReadOnly}>
                                        <option value="">Seleccione</option>
                                        {OPCIONES_SI_NO.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Informe Técnico (Nro)</label>
                                    <input className="form-input" name="informe" value={form.informe} onChange={handleChange} placeholder="Nro de informe" disabled={isReadOnly} />
                                </div>
                            </div>
                        </div>

                        {/* ─── Técnico ─────────────────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                Técnico Responsable
                            </h3>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Técnico encargado</label>
                                    <select className="form-input" name="tecnico" value={form.tecnico} onChange={handleChange} disabled={isReadOnly}>
                                        {TECNICOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ─── Estatus y Clasificación ───────────────────── */}
                        <div className="form-section">
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2z" /><path d="M22 12H12v10h10V12z" /><path d="M22 2h-10v10h10V2z" /><path d="M12 12H2v10h10V12z" /></svg>
                                Estatus y Clasificación
                            </h3>
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
                            <h3 className="form-section__title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5" /><path d="M15 21V15h6" /><path d="M21 3h-6v6h6V3z" /></svg>
                                Observaciones
                            </h3>
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
