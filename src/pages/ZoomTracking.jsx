import React, { useState } from 'react';
import { trackShipment } from '../lib/zoom-sandbox';
import { 
  Truck, Search, History, ArrowRight, Package, Clock, MapPin, 
  AlertCircle, CheckCircle2, Info, Receipt, Calendar, Tag, Layers, ExternalLink, Box,
  ChevronRight, Clipboard, RefreshCw
} from 'lucide-react';
import './shared.css';

export default function ZoomTracking() {
  const [guia, setGuia] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('zoom_sandbox_history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleTrack = async (e, forceGuia = null) => {
    e?.preventDefault();
    const query = forceGuia || guia;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trackShipment(query.trim());
      if (response.success) {
        setResult(response.data);
        const newHistory = [
          { 
            guia: query.trim(), 
            date: new Date().toISOString(), 
            status: response.data.estatus || 'Consultado',
          },
          ...history.filter(h => h.guia !== query.trim()).slice(0, 5)
        ];
        setHistory(newHistory);
        localStorage.setItem('zoom_sandbox_history', JSON.stringify(newHistory));
      } else {
        setError(response.error || 'No se pudo obtener información del envío.');
      }
    } catch (err) {
      setError('Error inesperado al conectar con el servicio de Zoom Sandbox.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('entrega') || s.includes('recibido') || s.includes('entregado')) return <CheckCircle2 className="text-secondary" size={24} />;
    if (s.includes('transito') || s.includes('ruta') || s.includes('camino') || s.includes('custodia')) return <Clock className="text-primary" size={24} />;
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
        <path d="M10 18h4M4 18l2-6 2 4M21 18l-2-6-2 4M10 10l2-4 2 4M10 6a2 2 0 1 1 4 0M12 12v6" />
      </svg>
    );
  };

  return (
    <div className="zoom-tracking-container anim-fadeUp" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div className="header-text">
          <h1 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Tracking de Logística</h1>
          <p className="page-sub" style={{ fontSize: '16px' }}>Gestión y rastreo de activos en tránsito vía Zoom Venezuela (Sandbox)</p>
        </div>
        <div className="status-badge-pro">
          <div className="pulse-indicator"></div>
          <span style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '0.05em' }}>SISTEMA ONLINE</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        <div className="tracking-main">
          
          <div className="section-card search-hero" style={{ padding: '48px', borderRadius: '24px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
            <div className="card-gradient-bg"></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div className="icon-wrap-pro">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 18h4M4 18l2-6 2 4M21 18l-2-6-2 4M10 10l2-4 2 4M10 6a2 2 0 1 1 4 0M12 12v6" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Localizar Envío</h2>
              </div>

              <form onSubmit={handleTrack} className="search-form-pro">
                <div className="input-group-pro">
                  <Search className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Introduce el número de guía (Ej: 71090585)"
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                  />
                  <button type="submit" className="btn-track-pro" disabled={loading || !guia.trim()}>
                    {loading ? <RefreshCw className="anim-spin" size={18} /> : 'Rastrear ahora'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {error && (
            <div className="error-card anim-shake" style={{ marginBottom: '32px' }}>
              <AlertCircle size={24} />
              <div>
                <h4>Error en la consulta</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="result-area">
            {loading ? (
              <div className="section-card loading-state" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="loader-bars"><span></span><span></span><span></span></div>
                <h3 style={{ marginTop: '32px', fontWeight: '600' }}>Sincronizando con Sandbox...</h3>
              </div>
            ) : result ? (
              <div className="result-view anim-fadeUp">
                <div className="section-card" style={{ padding: '32px', marginBottom: '24px', borderLeft: '6px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                      <p className="text-overline">ESTATUS DE ENTREGA</p>
                      <h2 className="status-display">
                        {getStatusIcon(result.estatus)}
                        {result.estatus}
                      </h2>
                    </div>
                    <div className="guia-badge-large">
                      <span>GUÍA</span>
                      <strong>{result.nro_guia}</strong>
                    </div>
                  </div>

                  <div className="route-grid">
                    <div className="route-node">
                      <div className="node-dot"></div>
                      <div className="node-info">
                        <label>ORIGEN</label>
                        <p>{result.origen}</p>
                        <small>{result.remitente}</small>
                      </div>
                    </div>
                    <div className="route-connector"><ArrowRight size={20} /></div>
                    <div className="route-node">
                      <div className="node-dot node-dot--end"></div>
                      <div className="node-info">
                        <label>DESTINO</label>
                        <p>{result.destino}</p>
                        <small>{result.destinatario}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div className="stat-card-pro"><Calendar size={18} /><div style={{marginLeft: '10px'}}><label>Creación</label><p>{result.fecha_creacion}</p></div></div>
                  <div className="stat-card-pro"><Box size={18} /><div style={{marginLeft: '10px'}}><label>Peso</label><p>{result.peso} Kg</p></div></div>
                  <div className="stat-card-pro"><Receipt size={18} /><div style={{marginLeft: '10px'}}><label>Referencia</label><p>{result.referencia || 'N/A'}</p></div></div>
                  <div className="stat-card-pro"><Layers size={18} /><div style={{marginLeft: '10px'}}><label>Servicio</label><p>{result.servicio || 'Currier'}</p></div></div>
                </div>

                <div className="section-card" style={{ padding: '32px' }}>
                  <h3 className="section-title-pro"><History size={20} /> Historial de Movimientos</h3>
                  <div className="timeline-pro">
                    {result.historial?.map((item, idx) => (
                      <div key={idx} className={`timeline-item-pro ${idx === 0 ? 'active' : ''}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>{item.estatus}</h4>
                            <span className="timeline-date">{item.fecha} {item.hora}</span>
                          </div>
                          <p className="timeline-loc"><MapPin size={14} /> {item.ubicacion}</p>
                          {item.observacion && <p className="timeline-obs">{item.observacion}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state-card">
                 <div className="empty-icon-wrap">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M10 18h4M4 18l2-6 2 4M21 18l-2-6-2 4M10 10l2-4 2 4M10 6a2 2 0 1 1 4 0M12 12v6" />
                   </svg>
                 </div>
                 <h3>Rastreo en tiempo real</h3>
                 <p>Ingresa un número de guía para visualizar la hoja de ruta y el estado actual de los equipos.</p>
              </div>
            )}
          </div>
        </div>

        <div className="tracking-sidebar">
          <div className="section-card sidebar-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} className="text-primary" /> Consultas Recientes
            </h3>
            <div className="history-list-pro">
              {history.length > 0 ? (
                <>
                  {history.map((h, i) => (
                    <button 
                      key={i} 
                      className="history-item-pro"
                      onClick={() => { setGuia(h.guia); handleTrack(null, h.guia); }}
                    >
                      <div className="h-left"><strong>{h.guia}</strong><span>{new Date(h.date).toLocaleDateString()}</span></div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                  <button className="clear-btn-pro" onClick={() => { localStorage.removeItem('zoom_sandbox_history'); setHistory([]); }}>Borrar historial</button>
                </>
              ) : (
                <div className="empty-sidebar"><p>No tienes búsquedas recientes.</p></div>
              )}
            </div>
          </div>

          <div className="section-card sandbox-info-card" style={{ padding: '24px' }}>
            <div className="sandbox-header"><Info size={16} /><span>LOGÍSTICA SANDBOX</span></div>
            <p>Conectado dinámicamente al entorno de pruebas de Zoom Venezuela.</p>
            <div className="client-id-badge">CLIENTE: #407940</div>
          </div>
        </div>
      </div>
    </div>
  );
}
