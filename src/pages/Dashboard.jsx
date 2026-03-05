import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllDevices } from '../store';
import StatCard from '../components/StatCard';
import { utils, writeFile } from 'xlsx';
import './Dashboard.css';

const CASO_COLORS = {
    'CASO ABIERTO': 'blue',
    'CASO CERRADO': 'green',
};
const CASO_ICONS = {
    'CASO ABIERTO': '📥',
    'CASO CERRADO': '✅',
};

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, byCaso: {}, byReparacion: {} });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getStats().then(s => {
            setStats(s);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const data = await getAllDevices();

            // Format data for Excel
            const formattedData = data.map(item => ({
                'ID': item.id,
                'Fecha': item.fecha,
                'Aliado': item.aliado || '',
                'Modelo': item.modelo || '',
                'Razón Social': item.razon_social,
                'Serial': item.serial,
                'RIF': item.rif || '',
                'Ingreso': item.ingreso || '',
                'Serial Reemplazo': item.serial_reemplazo || '',
                'Falla Notificada': item.falla_notificada || '',
                'Categoría': item.categoria || '',
                'Estatus Caso': item.estatus_caso,
                'Estatus Reparación': item.estatus,
                'Nivel': item.nivel || '',
                'Garantía': item.garantia || '',
                'Acepta Plan': item.acepta_plan || '',
                'Técnico': item.tecnico || '',
                'Procesadora': item.procesadora || '',
                'Cotización': item.cotizacion || '',
                'Fecha Final': item.fecha_final || ''
            }));

            const ws = utils.json_to_sheet(formattedData);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Casos POS");

            writeFile(wb, `Reporte_General_POS_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Error al exportar Excel:", error);
            alert("Error al exportar el archivo Excel.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="dashboard anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Resumen general de casos POS</p>
                </div>
                <div className="page-header__actions">
                    <button
                        className="btn btn--secondary"
                        onClick={handleExportExcel}
                        disabled={exporting}
                    >
                        {exporting ? 'Generando...' : '📊 Exportar Excel'}
                    </button>
                    <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                        + Nuevo Caso
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="dashboard__cards grid grid--cols-3">
                <StatCard label="Total Casos" value={stats.total} color="accent" icon="◈" />
                {Object.entries(stats.byCaso).map(([status, count]) => (
                    <StatCard
                        key={status}
                        label={status}
                        value={count}
                        color={CASO_COLORS[status]}
                        icon={CASO_ICONS[status]}
                    />
                ))}
            </div>

        </div>
    );
}
