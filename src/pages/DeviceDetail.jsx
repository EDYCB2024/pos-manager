import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeviceBySerial, deleteDevice } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceDetail.css';

export default function DeviceDetail() {
    const { serial } = useParams();
    const [device, setDevice] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const d = getDeviceBySerial(serial);
        if (!d) navigate('/devices');
        else setDevice(d);
    }, [serial, navigate]);

    if (!device) return null;

    function handleDelete() {
        deleteDevice(serial);
        navigate('/devices');
    }

    const field = (label, value, mono = false) => (
        <div className="det-field">
            <span className="det-field__label">{label}</span>
            <span className={`det-field__value${mono ? ' mono' : ''}`}>{value || '—'}</span>
        </div>
    );

    return (
        <div className="device-detail-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <code className="serial-hero">{device.serial}</code>
                    <p className="page-sub">{device.razonSocial}</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Volver</button>
                    <button className="btn btn--secondary" onClick={() => navigate(`/devices/${serial}/edit`)}>✎ Editar</button>
                    <button className="btn btn--danger" onClick={() => setConfirm(true)}>🗑 Eliminar</button>
                </div>
            </div>

            <div className="det-status-row">
                <StatusBadge status={device.estatus} />
                {device.garantia === 'Sí' && <span className="garantia-badge garantia-badge--yes">🛡 Garantía</span>}
            </div>

            <div className="det-grid">
                <div className="det-card glass">
                    <h3 className="det-card__title">Datos del Cliente</h3>
                    {field('RIF', device.rif)}
                    {field('Razón Social', device.razonSocial)}
                </div>
                <div className="det-card glass">
                    <h3 className="det-card__title">Datos del Equipo</h3>
                    {field('Modelo', device.modelo)}
                    {field('Serial', device.serial, true)}
                </div>
                <div className="det-card glass">
                    <h3 className="det-card__title">Fechas y Cotización</h3>
                    {field('Fecha de Ingreso', device.fechaIngreso)}
                    {field('Fecha Final', device.fechaFinal)}
                    {field('Cotización', device.cotizacion ? `$${Number(device.cotizacion).toFixed(2)}` : null)}
                </div>
            </div>

            {device.informe && (
                <div className="det-prose glass">
                    <h3 className="det-card__title">Informe Técnico</h3>
                    <p className="det-prose__text">{device.informe}</p>
                </div>
            )}
            {device.observaciones && (
                <div className="det-prose glass">
                    <h3 className="det-card__title">Observaciones</h3>
                    <p className="det-prose__text">{device.observaciones}</p>
                </div>
            )}

            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(false)}>
                    <div className="modal glass" onClick={e => e.stopPropagation()}>
                        <h3 className="modal__title">¿Eliminar equipo?</h3>
                        <p className="modal__body">
                            Se eliminará <code className="serial-code">{serial}</code>. Esta acción no se puede deshacer.
                        </p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setConfirm(false)}>Cancelar</button>
                            <button className="btn btn--danger" onClick={handleDelete}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
