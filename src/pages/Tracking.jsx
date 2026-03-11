import { useState } from 'react';
import { getDeviceBySerial } from '../store';
import StatusBadge from '../components/StatusBadge';
import './Tracking.css';

const STAGES = [
    { title: 'Recepción', desc: 'Equipo ingresado al laboratorio' },
    { title: 'Diagnóstico', desc: 'Revisión técnica en proceso' },
    { title: 'Reparación', desc: 'Reparación / Espera de repuestos' },
    { title: 'Finalizado', desc: 'Equipo listo para entrega o despachado' }
];

export default function Tracking() {
    const [serial, setSerial] = useState('');
    const [device, setDevice] = useState(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!serial.trim()) return;
        setLoading(true);
        // getDeviceBySerial already orders by date descending, we pick the first one
        const results = await getDeviceBySerial(serial.trim());
        if (results && results.length > 0) {
            setDevice(results[0]);
        } else {
            setDevice(null);
        }
        setSearched(true);
        setLoading(false);
    };

    const getStageProps = (device, index) => {
        let currentStageIndex = 0;
        let isError = false;

        if (device) {
            if (device.estatus_caso === 'CASO CERRADO' || device.estatus === 'Entregado') {
                currentStageIndex = 3;
            } else if (device.estatus === 'Irreparable') {
                currentStageIndex = 3;
                isError = true;
            } else if (device.estatus === 'Pendiente por pago') {
                currentStageIndex = 2; // se quedó en diag/rep esperando
            } else if (device.estatus === 'En reparación') {
                currentStageIndex = 2;
            } else if (device.estatus === 'En diagnóstico') {
                currentStageIndex = 1;
            }
        }

        const isCompleted = index <= currentStageIndex;
        const isActive = index === currentStageIndex;
        const showError = isError && index === 3;

        return { isCompleted, isActive, showError };
    };

    return (
        <div className="tracking-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tracking de Equipos</h1>
                    <p className="page-sub">Consulta el estado actual de tu equipo por serial</p>
                </div>
            </div>

            <div className="tracking-container">
                <form className="tracking-search glass" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="tracking-search__input"
                        placeholder="Ingresa el serial del equipo (Ej: VX520-1234)"
                        value={serial}
                        onChange={e => setSerial(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn btn--primary" disabled={loading}>
                        {loading ? 'Consultando...' : 'Consultar Etapa'}
                    </button>
                </form>

                {searched && !device && !loading && (
                    <div className="tracking-empty glass anim-fadeIn">
                        <div className="tracking-empty__icon">🔍</div>
                        <p>No encontramos ningún equipo registrado con el serial <strong>{serial}</strong>.</p>
                        <p className="tracking-empty__sub">Verifica si el serial es correcto e inténtalo nuevamente.</p>
                    </div>
                )}

                {device && (
                    <div className="tracking-result glass anim-fadeUp">
                        <div className="tracking-result__header">
                            <div>
                                <h3 className="tracking-result__serial">{device.serial}</h3>
                                <p className="tracking-result__model">{device.marca} {device.modelo}</p>
                            </div>
                            <div className="tracking-result__status">
                                <StatusBadge status={device.estatus_caso} type="caso" />
                            </div>
                        </div>

                        <div className="tracking-timeline">
                            {STAGES.map((stage, i) => {
                                const { isCompleted, isActive, showError } = getStageProps(device, i);

                                let circleClass = "timeline-circle";
                                if (isCompleted) circleClass += " timeline-circle--completed";
                                if (isActive) circleClass += " timeline-circle--active";
                                if (showError) circleClass += " timeline-circle--error";

                                return (
                                    <div key={i} className={`timeline-step ${isCompleted ? 'timeline-step--completed' : ''}`}>
                                        <div className="timeline-indicator">
                                            <div className={circleClass}>
                                                {isCompleted && !showError ? '✓' : showError ? '✕' : (i + 1)}
                                            </div>
                                            {i < STAGES.length - 1 && <div className="timeline-line"></div>}
                                        </div>
                                        <div className="timeline-content">
                                            <h4 className={`timeline-title ${isActive ? 'timeline-title--active' : ''} ${showError ? 'timeline-title--error' : ''}`}>
                                                {showError && i === 3 ? 'Irreparable' : stage.title}
                                            </h4>
                                            <p className="timeline-desc">
                                                {showError && i === 3 ? 'El equipo no pudo ser reparado.' : stage.desc}
                                            </p>

                                            {/* Sub-status specific info */}
                                            {isActive && i === 2 && device.estatus === 'Pendiente por pago' && (
                                                <div className="timeline-alert">
                                                    ⏳ Pendiente por autorización o pago de cotización.
                                                </div>
                                            )}
                                            {isActive && i === 3 && device.estatus === 'Entregado' && (
                                                <div className="timeline-success">
                                                    🎉 Equipo entregado exitosamente.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
