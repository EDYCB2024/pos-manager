import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeviceById, deleteDevice, getReportUrl } from '../store';
import StatusBadge from '../components/StatusBadge';
import './DeviceDetail.css';

export default function DeviceDetail() {
    const { id } = useParams();
    const [device, setDevice] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getDeviceById(id).then(d => {
            if (!d) navigate('/devices');
            else setDevice(d);
            setLoading(false);
        });
    }, [id, navigate]);

    if (loading) return <div className="loading-state">Cargando...</div>;
    if (!device) return null;

    async function handleDelete() {
        await deleteDevice(device.id);
        navigate('/devices');
    }

    const field = (label, value, mono = false) => (
        <div className="det-field">
            <span className="det-field__label">{label}</span>
            <span className={`det-field__value${mono ? ' mono' : ''}`}>{value ?? '—'}</span>
        </div>
    );

    return (
        <div className="device-detail-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <code className="serial-hero">{device.serial}</code>
                    <p className="page-sub">{device.razon_social}</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Volver</button>
                    <button className="btn btn--secondary" onClick={() => navigate(`/devices/${id}/edit`)}>✎ Editar</button>
                    <button className="btn btn--danger" onClick={() => setConfirm(true)}>🗑 Eliminar</button>
                </div>
            </div>

            <div className="det-status-row">
                <StatusBadge status={device.estatus_caso} type="caso" />
                <StatusBadge status={device.estatus} type="reparacion" />
                {device.garantia === 'Sí' && <span className="garantia-badge garantia-badge--yes">🛡 Garantía</span>}
            </div>

            <div className="det-grid">
                <div className="det-card glass">
                    <h3 className="det-card__title">Datos del Cliente</h3>
                    {field('RIF', device.rif)}
                    {field('Razón Social', device.razon_social)}
                    {field('Aliado', device.aliado)}
                    {field('Procesadora', device.procesadora)}
                    {field('Técnico', device.tecnico)}
                    {field('Ingreso', device.ingreso)}
                </div>
                <div className="det-card glass">
                    <h3 className="det-card__title">Datos del Equipo</h3>
                    {field('Modelo', device.modelo)}
                    {field('Serial', device.serial, true)}
                    {field('Serial Reemplazo', device.serial_reemplazo, true)}
                    {field('Categoría', device.categoria)}
                    {field('Nivel', device.nivel)}
                </div>
                <div className="det-card glass">
                    <h3 className="det-card__title">Falla e Informe</h3>
                    {field('Falla Notificada', device.falla_notificada)}
                    <div className="det-field">
                        <span className="det-field__label">Informe Técnico</span>
                        <div className="det-field__value">
                            {device.informe ? (
                                <a
                                    href={getReportUrl(device.informe)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="report-link-bold"
                                >
                                    📄 {device.informe} (Ver PDF)
                                </a>
                            ) : '—'}
                        </div>
                    </div>
                </div>
                <div className="det-card glass">
                    <h3 className="det-card__title">Caso</h3>
                    {field('Fecha', device.fecha)}
                    {field('Fecha Final', device.fecha_final)}
                    {field('Estatus Caso', device.estatus_caso)}
                    {field('Estatus Reparación', device.estatus)}
                    {field('Cotización', device.cotizacion)}
                </div>
            </div>

            <div className="det-grid">
                <div className="det-card glass">
                    <h3 className="det-card__title">Repuestos y Servicios</h3>
                    {field('Repuesto 1', device.repuesto_1)}
                    {field('Repuesto 2', device.repuesto_2)}
                    {field('Repuesto 3', device.repuesto_3)}
                </div>
            </div>

            {device.falla_notificada && (
                <div className="det-prose glass">
                    <h3 className="det-card__title">Falla Notificada</h3>
                    <p className="det-prose__text">{device.falla_notificada}</p>
                </div>
            )}
            {device.informe && (
                <div className="det-prose glass">
                    <h3 className="det-card__title">Informe Técnico</h3>
                    <p className="det-prose__text">{device.informe}</p>
                </div>
            )}
            {device.informes && (
                <div className="det-prose glass">
                    <h3 className="det-card__title">Observaciones Generales</h3>
                    <p className="det-prose__text">{device.informes}</p>
                </div>
            )}

            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(false)}>
                    <div className="modal glass" onClick={e => e.stopPropagation()}>
                        <h3 className="modal__title">¿Eliminar caso?</h3>
                        <p className="modal__body">
                            Se eliminará el caso <code className="serial-code">{device.serial}</code>. Esta acción no se puede deshacer.
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
