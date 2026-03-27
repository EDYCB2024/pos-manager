import React, { useState } from 'react';
import { trackShipment } from '../lib/zoom';
import { 
  Truck, Search, History, ArrowRight, Package, Clock, MapPin, 
  AlertCircle, CheckCircle2, Info, Receipt, Calendar, Tag, Layers, ExternalLink, Box
} from 'lucide-react';
import './shared.css';

export default function ZoomTracking() {
  const [guia, setGuia] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('zoom_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!guia.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trackShipment(guia.trim());
      if (response.success) {
        setResult(response.data);
        // Save to history
        const newHistory = [
          { 
            guia: guia.trim(), 
            date: new Date().toISOString(), 
            status: response.data.estatus || 'Consultado',
            servicio: response.data.servicio
          },
          ...history.filter(h => h.guia !== guia.trim()).slice(0, 8)
        ];
        setHistory(newHistory);
        localStorage.setItem('zoom_history_v2', JSON.stringify(newHistory));
      } else {
        setError(response.error || 'No se pudo obtener información del envío.');
      }
    } catch (err) {
      setError('Error inesperado al conectar con el servicio de Zoom.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('entrega') || s.includes('recibido') || s.includes('entregado')) return <CheckCircle2 className="text-success" size={24} />;
    if (s.includes('transito') || s.includes('ruta') || s.includes('camino')) return <Clock className="text-primary" size={24} />;
    return <Package className="text-secondary" size={24} />;
  };

  return (
    <div className="zoom-tracking anim-fadeUp" style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Rastreo de Guías Zoom</h1>
          <p className="page-sub">Consulta oficial conectada al servidor de producción de Zoom Venezuela</p>
        </div>
        <div style={{ 
          background: 'var(--accent-dim)', 
          padding: '12px 20px', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid var(--border)'
        }}>
          <Truck className="text-primary" />
          <div>
            <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', opacity: 0.6 }}>Conexión Producción</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>WebServices ZOOM Public</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div className="main-content">
          {/* Search Card */}
          <div className="section-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <form onSubmit={handleTrack} style={{ position: 'relative' }}>
              <div className="search-box" style={{ width: '100%', height: '64px', background: 'var(--bg-primary)', borderRadius: '16px' }}>
                <span className="search-box__icon">
                  <Search size={24} />
                </span>
                <input
                  className="search-box__input"
                  style={{ fontSize: '18px', paddingLeft: '64px' }}
                  placeholder="Introduce el número de guía de Zoom..."
                  value={guia}
                  onChange={(e) => setGuia(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn--primary" 
                disabled={loading || !guia.trim()}
                style={{ position: 'absolute', right: '10px', top: '10px', height: '44px', padding: '0 28px', borderRadius: '12px' }}
              >
                {loading ? 'Consultando...' : 'Rastrear Guía'}
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </form>
          </div>

          {loading && (
            <div className="section-card anim-fadeIn" style={{ padding: '80px 0', textAlign: 'center' }}>
              <div className="loader-ring" style={{ margin: '0 auto 20px' }}></div>
              <h3 style={{ fontWeight: '600' }}>Obteniendo datos de Zoom...</h3>
              <p className="text-secondary">Conectando con webservices.zoom.red</p>
            </div>
          )}

          {error && (
            <div className="alert alert--danger anim-shake" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <AlertCircle size={32} />
              <div>
                <strong style={{ display: 'block' }}>Error en la consulta</strong>
                <span style={{ fontSize: '14px' }}>{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="result-container anim-fadeUp">
              {/* Main Status Header */}
              <div className="section-card" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                  <Truck size={120} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                  <div>
                    <span className="badge badge--primary" style={{ marginBottom: '12px', padding: '6px 14px' }}>ESTADO ACTUAL</span>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getStatusIcon(result.estatus)}
                      {result.estatus}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="text-secondary" style={{ fontSize: '13px', fontWeight: '600' }}>Guía Nro:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                       <Tag size={16} className="text-primary" />
                       <code style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>{result.nro_guia}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> Remitente / Origen
                    </p>
                    <p style={{ fontWeight: '700', fontSize: '16px' }}>{result.remitente || '---'}</p>
                    <p className="text-secondary" style={{ fontSize: '13px' }}>{result.origen}</p>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> Destinatario / Destino
                    </p>
                    <p style={{ fontWeight: '700', fontSize: '16px' }}>{result.destinatario || '---'}</p>
                    <p className="text-secondary" style={{ fontSize: '13px' }}>{result.destino}</p>
                  </div>
                </div>
              </div>

               {/* Detailed Metadata Grid */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { icon: <Receipt size={18} />, label: 'Referencias', value: result.referencia || 'N/A' },
                  { icon: <Calendar size={18} />, label: 'Fecha Guía', value: result.fecha_creacion || 'N/A' },
                  { icon: <Box size={18} />, label: 'Peso / Piezas', value: `${result.peso}Kg / ${result.piezas} pzs` },
                  { icon: <Layers size={18} />, label: 'Servicio', value: result.servicio || 'Mercancía' }
                ].map((item, idx) => (
                  <div key={idx} className="section-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      {item.icon}
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</span>
                    </div>
                    <p style={{ fontWeight: '800', fontSize: '15px' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Tracking Timeline */}
              <div className="section-card" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <History className="text-primary" /> Historial de Movimientos
                </h3>
                
                <div style={{ position: 'relative', paddingLeft: '8px' }}>
                  {result.historial && result.historial.length > 0 ? (
                    <div className="timeline">
                      {result.historial.map((step, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          gap: '24px', 
                          paddingBottom: '32px', 
                          borderLeft: `2px solid ${idx === 0 ? 'var(--accent)' : 'var(--border)'}`,
                          marginLeft: '12px',
                          paddingLeft: '32px',
                          position: 'relative'
                        }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: '-11px', 
                            top: '0', 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: idx === 0 ? 'var(--accent)' : 'var(--bg-primary)',
                            border: `4px solid ${idx === 0 ? 'var(--bg-secondary)' : 'var(--border)'}`,
                            boxShadow: idx === 0 ? '0 0 15px var(--accent-dim)' : 'none'
                          }} />
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ fontSize: '16px', fontWeight: '700', color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {step.estatus}
                              </h4>
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: '700', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border)'
                              }}>
                                {step.fecha} {step.hora}
                              </span>
                            </div>
                            <p style={{ 
                              fontSize: '14px', 
                              color: 'var(--text-muted)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              marginTop: '6px'
                            }}>
                              <MapPin size={14} /> {step.ubicacion}
                            </p>
                            {step.observacion && (
                                <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }} className="text-secondary italic">
                                    "{step.observacion}"
                                </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                       <Info size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                       <p className="text-secondary">No hay historial disponible aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="section-card" style={{ padding: '80px 0', textAlign: 'center', opacity: 0.6 }}>
               <div style={{ 
                width: '140px', 
                height: '140px', 
                background: 'var(--bg-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '4px dashed var(--border)'
              }}>
                <Truck size={64} className="text-muted" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Rastreo de Guías</h2>
              <p className="text-secondary">Introduce el número de guía oficial de Zoom para ver los detalles.</p>
            </div>
          )}
        </div>

        {/* Sidebar History */}
        <div className="sidebar-stats">
          <div className="section-card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={20} className="text-primary" /> Recientes
            </h3>
            
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((h, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setGuia(h.guia); handleTrack(); }}
                    style={{ 
                      background: 'var(--bg-primary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      textAlign: 'left',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="history-item-btn"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '15px' }}>{h.guia}</span>
                      <ArrowRight size={14} className="text-muted" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: '800', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        background: 'var(--accent-dim)', 
                        color: 'var(--accent)'
                      }}>
                        {h.status}
                      </span>
                    </div>
                  </button>
                ))}
                
                <button 
                  onClick={() => { localStorage.removeItem('zoom_history_v2'); setHistory([]); }}
                  style={{ 
                    marginTop: '12px', 
                    fontSize: '12px', 
                    color: 'var(--text-muted)', 
                    textAlign: 'center', 
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    width: '100%'
                  }}
                >
                  Limpiar historial
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p className="text-muted" style={{ fontSize: '14px' }}>No hay consultas previas.</p>
              </div>
            )}
            
            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
            
            <div style={{ background: 'var(--accent-dim)', padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-dim)' }}>
               <h4 style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                 <Info size={14} /> Producción
               </h4>
               <p style={{ fontSize: '12px', lineHeight: '1.4', opacity: 0.8 }}>
                 Usando el motor de búsqueda basado en <code>Eitol/zoom-red-tracking</code> para mayor precisión en datos de peso y piezas.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
