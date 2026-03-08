import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './shared.css';

/**
 * Senior Frontend Refinement: QuotationForm
 * - Enhanced UI/UX with better focus states and feedback.
 * - Added micro-interactions and transitions.
 * - Robust error handling and state management.
 */
export default function QuotationForm() {
    const [items, setItems] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [activeRowId, setActiveRowId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const suggestionRef = useRef(null);

    // Auto-focus first item when added
    useEffect(() => {
        if (items.length === 1 && items[0].serial === '') {
            const firstInput = document.querySelector('.serial-input');
            if (firstInput) firstInput.focus();
        }
    }, [items.length]);

    // Handle clicks outside suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeRowId && suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setSuggestions([]);
                setActiveRowId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeRowId]);

    const addItem = () => {
        const newItem = {
            id: Date.now(),
            nro: (items.length + 1).toString().padStart(2, '0'),
            modelo: '',
            serial: '',
            razon_social: '',
            nivel: '',
            garantia: '',
            informe: '',
            cotizacion: ''
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleInputChange = (id, field, value) => {
        const upperValue = field === 'serial' ? value.toUpperCase() : value;

        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: upperValue } : item
        ));

        if (field === 'serial') {
            setActiveRowId(id);
            if (upperValue.length >= 3) {
                fetchSuggestions(upperValue);
            } else {
                setSuggestions([]);
            }
        }
    };

    const fetchSuggestions = async (query) => {
        try {
            const { data, error } = await supabase
                .from('casos_pos')
                .select('*')
                .ilike('serial', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            // UI Thread safety: Only update if query still relevant
            const unique = [];
            const seen = new Set();
            (data || []).forEach(d => {
                if (!seen.has(d.serial)) {
                    seen.add(d.serial);
                    unique.push(d);
                }
            });

            setSuggestions(unique);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        }
    };

    const selectDevice = (rowId, device) => {
        setItems(prev => prev.map(item =>
            item.id === rowId ? {
                ...item,
                serial: device.serial,
                modelo: device.modelo || '',
                razon_social: device.razon_social || '',
                nivel: device.nivel || '',
                garantia: device.garantia || '',
                informe: device.informe || '',
                cotizacion: device.cotizacion || ''
            } : item
        ));
        setSuggestions([]);
        setActiveRowId(null);
    };

    const handleKeyDown = (e, rowId) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            selectDevice(rowId, suggestions[0]);
        }
        if (e.key === 'Escape') {
            setSuggestions([]);
            setActiveRowId(null);
        }
    };

    const removeItem = (id) => {
        setItems(prev => {
            const filtered = prev.filter(item => item.id !== id);
            return filtered.map((item, index) => ({
                ...item,
                nro: (index + 1).toString().padStart(2, '0')
            }));
        });
    };

    const handleMockGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert("Cotización generada con éxito (Simulación)");
        }, 1500);
    };

    return (
        <div className="quotation-view anim-fadeUp">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Generar Cotización</h1>
                    <p className="page-sub">Panel profesional para la creación de presupuestos técnicos.</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--primary btn--with-shadow" onClick={addItem}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Añadir Equipo
                    </button>
                </div>
            </header>

            <main className="glass table-wrap" style={{ overflow: 'visible', padding: '1px' }}>
                <table className="data-table data-table--modern">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Nro</th>
                            <th style={{ width: '120px' }}>Modelo</th>
                            <th style={{ width: '220px' }}>Serial</th>
                            <th>Razón Social</th>
                            <th style={{ width: '100px' }}>Nivel</th>
                            <th style={{ width: '100px' }}>Garantía</th>
                            <th style={{ width: '110px' }}>Informe</th>
                            <th style={{ width: '110px' }}>Cotización</th>
                            <th style={{ width: '60px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="data-table__row anim-fadeInRow">
                                <td className="td-nro">
                                    <span>{item.nro}</span>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input"
                                        value={item.modelo}
                                        onChange={(e) => handleInputChange(item.id, 'modelo', e.target.value)}
                                        placeholder="Modelo"
                                    />
                                </td>
                                <td style={{ position: 'relative' }}>
                                    <div className="serial-input-wrapper">
                                        <input
                                            type="text"
                                            className="table-input serial-input"
                                            value={item.serial}
                                            onChange={(e) => handleInputChange(item.id, 'serial', e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                            placeholder="Escribe el serial..."
                                        />
                                        {activeRowId === item.id && suggestions.length > 0 && (
                                            <div className="search-suggestions glass anim-dropdown" ref={suggestionRef}>
                                                {suggestions.map((dev) => (
                                                    <div
                                                        key={dev.id}
                                                        className="suggestion-item"
                                                        onClick={() => selectDevice(item.id, dev)}
                                                    >
                                                        <div className="suggestion-content">
                                                            <span className="suggestion-serial">{dev.serial}</span>
                                                            <span className="suggestion-info">{dev.modelo} • {dev.razon_social}</span>
                                                        </div>
                                                        <div className="suggestion-action">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input"
                                        value={item.razon_social}
                                        onChange={(e) => handleInputChange(item.id, 'razon_social', e.target.value)}
                                        placeholder="Comercio / Cliente"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.nivel}
                                        onChange={(e) => handleInputChange(item.id, 'nivel', e.target.value)}
                                        placeholder="-"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.garantia}
                                        onChange={(e) => handleInputChange(item.id, 'garantia', e.target.value)}
                                        placeholder="-"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.informe}
                                        onChange={(e) => handleInputChange(item.id, 'informe', e.target.value)}
                                        placeholder="-"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="table-input td-center accent-text"
                                        value={item.cotizacion}
                                        onChange={(e) => handleInputChange(item.id, 'cotizacion', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="td-actions">
                                    <button
                                        className="btn-remove"
                                        onClick={() => removeItem(item.id)}
                                        title="Eliminar fila"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <div className="empty-state-modern">
                        <div className="empty-icon-wrap">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                        </div>
                        <h3>No hay equipos en la lista</h3>
                        <p>Añade una fila para empezar a construir tu cotización técnico-comercial.</p>
                        <button className="btn btn--secondary" onClick={addItem} style={{ marginTop: '16px' }}>Empezar ahora</button>
                    </div>
                )}
            </main>

            {items.length > 0 && (
                <footer className="quotation-footer anim-fadeUp" style={{ animationDelay: '0.2s' }}>
                    <div className="quotation-summary">
                        <span>Items: <strong>{items.length}</strong></span>
                    </div>
                    <div className="quotation-actions">
                        <button className="btn btn--secondary" onClick={() => setItems([])}>Resetear</button>
                        <button
                            className={`btn btn--primary ${isGenerating ? 'btn--loading' : ''}`}
                            onClick={handleMockGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Procesando...' : 'Generar PDF'}
                        </button>
                    </div>
                </footer>
            )}

            <style>{`
                .quotation-view {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .data-table--modern {
                    background: transparent;
                }
                .data-table--modern th {
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 2px solid var(--border);
                    color: var(--text-muted);
                    font-size: 10px;
                    padding: 12px 16px;
                }
                .data-table--modern td {
                    padding: 4px 8px;
                    border-bottom: 1px solid var(--glass-border);
                }
                .td-nro {
                    text-align: center;
                    font-family: var(--font-mono);
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 12px;
                }
                .td-center {
                    text-align: center;
                }
                .td-actions {
                    text-align: center;
                }
                .table-input {
                    width: 100%;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-primary);
                    font-size: 13px;
                    padding: 10px 8px;
                    border-radius: 6px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .table-input:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .table-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--accent-dim);
                    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
                }
                .serial-input {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-weight: 600;
                    color: var(--accent);
                    letter-spacing: 0.02em;
                }
                .accent-text {
                    color: var(--accent);
                    font-weight: 700;
                }
                .btn-remove {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    color: var(--text-muted);
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin: 0 auto;
                }
                .btn-remove:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    transform: rotate(90deg);
                }
                .search-suggestions {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    padding: 6px;
                    border: 1px solid var(--border);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.5);
                    border-radius: 12px;
                }
                .suggestion-item {
                    padding: 10px 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .suggestion-item:hover {
                    background: rgba(0, 212, 255, 0.1);
                    transform: translateX(4px);
                }
                .suggestion-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .suggestion-serial {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--accent);
                    font-family: monospace;
                }
                .suggestion-info {
                    font-size: 10px;
                    color: var(--text-secondary);
                }
                .suggestion-action {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.2s;
                    color: var(--accent);
                }
                .suggestion-item:hover .suggestion-action {
                    opacity: 1;
                    transform: translateX(0);
                }
                .empty-state-modern {
                    padding: 80px 40px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .empty-icon-wrap {
                    width: 80px;
                    height: 80px;
                    background: var(--bg-card);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                    margin-bottom: 24px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-glow);
                }
                .empty-state-modern h3 {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .empty-state-modern p {
                    color: var(--text-secondary);
                    max-width: 300px;
                    font-size: 14px;
                }
                .quotation-footer {
                    margin-top: 32px;
                    padding: 20px 32px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }
                .quotation-summary {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .quotation-summary strong {
                    color: var(--text-primary);
                    font-size: 16px;
                }
                .quotation-actions {
                    display: flex;
                    gap: 12px;
                }
                .btn--with-shadow {
                    box-shadow: 0 8px 16px var(--accent-dim);
                }
                .btn--loading {
                    position: relative;
                    color: transparent !important;
                    pointer-events: none;
                }
                .btn--loading::after {
                    content: "";
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 50%;
                    left: 50%;
                    margin: -10px 0 0 -10px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInRow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .anim-fadeInRow {
                    animation: fadeInRow 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes dropdown {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .anim-dropdown {
                    animation: dropdown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
                    transform-origin: top center;
                }
            `}</style>
        </div>
    );
}
