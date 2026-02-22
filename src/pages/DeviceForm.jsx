import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    addDevice, updateDevice, getDeviceBySerial,
    ESTATUSES_CASO, ESTATUSES_REPARACION, CATEGORIAS, MODELOS
} from '../store';
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
    serial_reemplazo: '',
    falla_notificada: '',
    categoria: CATEGORIAS[0],
    estatus_caso: ESTATUSES_CASO[0],
    estatus_reparacion: ESTATUSES_REPARACION[0],
    garantia: 'No',
    cotizacion: '',
};

export default function DeviceForm() {
    const { serial } = useParams();
    const isEdit = Boolean(serial);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        getDeviceBySerial(serial).then(d => {
            if (!d) { navigate('/devices'); return; }
            setForm({
                ...EMPTY,
                ...d,
                garantia: d.garantia ? 'Sí' : 'No',
                fecha: d.fecha || today,
            });
            setLoading(false);
        });
    }, [serial, isEdit, navigate]);

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
                const existing = await getDeviceBySerial(serial);
                await updateDevice(existing.id, form);
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
                    <h1 className="page-title">{isEdit ? 'Editar Caso' : 'Nuevo Caso'}</h1>
                    <p className="page-sub">{isEdit ? `Serial: ${serial}` : 'Complete los datos del caso POS'}</p>
                </div>
                <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Volver</button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form className="device-form glass" onSubmit={handleSubmit}>

                {/* ─── Identificación del Equipo ─────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Identificación del Equipo</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Fecha *</label>
                            <input className="form-input" type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
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
                            <select className="form-input" name="modelo" value={form.modelo} onChange={handleChange}>
                                {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Serial de Reemplazo</label>
                            <input className="form-input" name="serial_reemplazo" value={form.serial_reemplazo} onChange={handleChange} placeholder="Ej. VX520-009999" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Aliado</label>
                            <input className="form-input" name="aliado" value={form.aliado} onChange={handleChange} placeholder="Nombre del aliado" />
                        </div>
                    </div>
                </div>

                {/* ─── Datos del Cliente ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Datos del Cliente</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">RIF</label>
                            <input className="form-input" name="rif" value={form.rif} onChange={handleChange} placeholder="Ej. J-12345678-9" />
                        </div>
                        <div className="form-field form-field--wide">
                            <label className="form-label">Razón Social *</label>
                            <input className="form-input" name="razon_social" value={form.razon_social} onChange={handleChange} placeholder="Ej. Comercial El Éxito C.A." required />
                        </div>
                    </div>
                </div>

                {/* ─── Estatus y Clasificación ─────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Estatus y Clasificación</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Estatus del Caso</label>
                            <select className="form-input" name="estatus_caso" value={form.estatus_caso} onChange={handleChange}>
                                {ESTATUSES_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Estatus de Reparación</label>
                            <select className="form-input" name="estatus_reparacion" value={form.estatus_reparacion} onChange={handleChange}>
                                {ESTATUSES_REPARACION.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Categoría</label>
                            <select className="form-input" name="categoria" value={form.categoria} onChange={handleChange}>
                                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Garantía</label>
                            <select className="form-input" name="garantia" value={form.garantia} onChange={handleChange}>
                                <option value="Sí">Sí</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Cotización (USD)</label>
                            <input className="form-input" type="number" min="0" step="0.01" name="cotizacion" value={form.cotizacion} onChange={handleChange} placeholder="0.00" />
                        </div>
                    </div>
                </div>

                {/* ─── Falla e Informes ────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Falla e Informes</h3>
                    <div className="form-grid form-grid--single">
                        <div className="form-field">
                            <label className="form-label">Falla Notificada</label>
                            <textarea className="form-input form-textarea" name="falla_notificada" value={form.falla_notificada} onChange={handleChange} rows={3} placeholder="Describe la falla reportada por el cliente..." />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Informes</label>
                            <textarea className="form-input form-textarea" name="informes" value={form.informes} onChange={handleChange} rows={4} placeholder="Describe el diagnóstico y trabajo realizado..." />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar caso'}
                    </button>
                </div>
            </form>
        </div>
    );
}
