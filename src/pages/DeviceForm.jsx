import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDevice, updateDevice, getDeviceBySerial, ESTATUSES, MODELOS } from '../store';
import './DeviceForm.css';

const EMPTY = {
    serial: '', rif: '', razonSocial: '', modelo: MODELOS[0],
    estatus: ESTATUSES[0], garantia: 'No',
    fechaIngreso: '', fechaFinal: '',
    informe: '', observaciones: '', cotizacion: '',
};

export default function DeviceForm() {
    const { serial } = useParams();
    const isEdit = Boolean(serial);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const d = getDeviceBySerial(serial);
            if (!d) { navigate('/devices'); return; }
            setForm({ ...EMPTY, ...d });
        }
    }, [serial, isEdit, navigate]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.serial.trim()) { setError('El serial es obligatorio.'); return; }
        if (!form.razonSocial.trim()) { setError('La razón social es obligatoria.'); return; }
        setSaving(true);
        try {
            if (isEdit) {
                updateDevice(serial, form);
            } else {
                addDevice(form);
            }
            navigate(isEdit ? `/devices/${form.serial}` : '/devices');
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    return (
        <div className="device-form-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{isEdit ? 'Editar Equipo' : 'Nuevo Equipo'}</h1>
                    <p className="page-sub">{isEdit ? `Serial: ${serial}` : 'Complete los datos del punto de venta'}</p>
                </div>
                <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Volver</button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form className="device-form glass" onSubmit={handleSubmit}>

                {/* ─── Identificación ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Identificación</h3>
                    <div className="form-grid">
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
                            <label className="form-label">RIF</label>
                            <input className="form-input" name="rif" value={form.rif} onChange={handleChange} placeholder="Ej. J-12345678-9" />
                        </div>
                        <div className="form-field form-field--wide">
                            <label className="form-label">Razón Social *</label>
                            <input className="form-input" name="razonSocial" value={form.razonSocial} onChange={handleChange} placeholder="Ej. Comercial El Éxito C.A." required />
                        </div>
                    </div>
                </div>

                {/* ─── Estado y Fechas ─────────────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Estado y Fechas</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Estatus</label>
                            <select className="form-input" name="estatus" value={form.estatus} onChange={handleChange}>
                                {ESTATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
                            <label className="form-label">Fecha de Ingreso</label>
                            <input className="form-input" type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Fecha Final</label>
                            <input className="form-input" type="date" name="fechaFinal" value={form.fechaFinal} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Cotización (USD)</label>
                            <input className="form-input" type="number" min="0" step="0.01" name="cotizacion" value={form.cotizacion} onChange={handleChange} placeholder="0.00" />
                        </div>
                    </div>
                </div>

                {/* ─── Informe y Observaciones ─────────────── */}
                <div className="form-section">
                    <h3 className="form-section__title">Informe Técnico</h3>
                    <div className="form-grid form-grid--single">
                        <div className="form-field">
                            <label className="form-label">Informe</label>
                            <textarea className="form-input form-textarea" name="informe" value={form.informe} onChange={handleChange} rows={4} placeholder="Describe el trabajo realizado..." />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Observaciones</label>
                            <textarea className="form-input form-textarea" name="observaciones" value={form.observaciones} onChange={handleChange} rows={3} placeholder="Notas adicionales..." />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar equipo'}
                    </button>
                </div>
            </form>
        </div>
    );
}
