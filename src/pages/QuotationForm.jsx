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
    const [items, setItems] = useState([{
        id: Date.now(),
        nro: '01',
        modelo: '',
        serial: '',
        razon_social: '',
        nivel: '',
        garantia: '',
        informe: '',
        cotizacion: ''
    }]);
    const [suggestions, setSuggestions] = useState([]);
    const [activeRowId, setActiveRowId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
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

    const handleCopyTable = async () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);

        const buildHTMLTable = () => {
            let html = `
                <table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #333;">
                    <thead>
                        <tr>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Nro</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Modelo</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Serial</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Razón Social</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Nivel</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Garantía</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Informe</th>
                            <th style="background-color: #f59e0b; color: white; padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Cotización</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            items.forEach(item => {
                html += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: #666;">${item.nro}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.modelo || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace; color: #d97706;">${item.serial || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${item.razon_social || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.nivel || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.garantia || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.informe || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
                            ${item.cotizacion ? `$${parseFloat(item.cotizacion).toFixed(2)}` : '$0.00'}
                        </td>
                    </tr>
                `;
            });

            const totalAmount = items.reduce((sum, current) => sum + (parseFloat(current.cotizacion) || 0), 0);
            if (totalAmount > 0) {
                html += `
                    <tr>
                        <td colspan="6" style="padding: 8px; border: 1px solid #e5e7eb;"></td>
                        <td style="padding: 10px 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; background-color: #fef3c7;">TOTAL:</td>
                        <td style="padding: 10px 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; font-size: 14px; background-color: #fef3c7;">
                            $${totalAmount.toFixed(2)}
                        </td>
                    </tr>
                `;
            }

            html += `</tbody></table>`;
            return html;
        };

        const htmlTable = buildHTMLTable();

        try {
            // Modern Clipboard API attempt (HTML format)
            const blob = new Blob([htmlTable], { type: 'text/html' });
            const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([clipboardItem]);
        } catch (err) {
            console.error('Failed to copy HTML table natively. Attempting fallback.', err);
            // Fallback for Safari/Firefox older versions and some Windows setups
            const tf = document.createElement('div');
            tf.innerHTML = htmlTable;
            tf.style.position = 'fixed';
            tf.style.pointerEvents = 'none';
            tf.style.opacity = '0';
            document.body.appendChild(tf);
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(tf);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            document.body.removeChild(tf);
        }
    };

    // Calcular el total para mostrarlo tanto en el preview como en el excel
    const totalAmount = items.reduce((sum, current) => sum + (parseFloat(current.cotizacion) || 0), 0);

    return (
        <div className="quotation-container anim-fadeUp">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Generar Cotización</h1>
                    <p className="page-sub">Panel profesional para la creación de presupuestos técnicos.</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--secondary" onClick={() => setItems([{
                        id: Date.now(),
                        nro: '01',
                        modelo: '',
                        serial: '',
                        razon_social: '',
                        nivel: '',
                        garantia: '',
                        informe: '',
                        cotizacion: ''
                    }])}>Resetear</button>

                    <button className="btn btn--primary btn--with-shadow" onClick={addItem}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Añadir Equipo
                    </button>
                </div>
            </header>

            <main className="quotation-main">
                <div className="quotation-table-wrapper">
                    {/* Desktop Header Grid */}
                    <div className="quotation-header-row">
                        <div className="text-center">Nro</div>
                        <div>Modelo</div>
                        <div>Serial</div>
                        <div>Razón Social</div>
                        <div className="text-center">Nivel</div>
                        <div className="text-center">Garantía</div>
                        <div className="text-center">Informe</div>
                        <div className="text-center">Cotización</div>
                        <div></div>
                    </div>

                    {/* Rows */}
                    <div className="quotation-rows">
                        {items.map((item) => (
                            <div key={item.id} className="quotation-row anim-fadeInRow">
                                {/* Nro */}
                                <div className="q-col">
                                    <span className="mobile-label">Nro</span>
                                    <span className="td-nro">{item.nro}</span>
                                </div>

                                {/* Modelo */}
                                <div className="q-col">
                                    <span className="mobile-label">Modelo</span>
                                    <input
                                        type="text"
                                        className="table-input"
                                        value={item.modelo}
                                        onChange={(e) => handleInputChange(item.id, 'modelo', e.target.value)}
                                        placeholder="Ej: S920"
                                    />
                                </div>

                                {/* Serial */}
                                <div className="q-col serial-col">
                                    <span className="mobile-label">Serial</span>
                                    <div className="serial-input-wrapper">
                                        <input
                                            type="text"
                                            className="table-input serial-input"
                                            value={item.serial}
                                            onChange={(e) => handleInputChange(item.id, 'serial', e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                            placeholder="Buscar serial..."
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
                                </div>

                                {/* Razón Social */}
                                <div className="q-col">
                                    <span className="mobile-label">Razón Social</span>
                                    <input
                                        type="text"
                                        className="table-input"
                                        value={item.razon_social}
                                        onChange={(e) => handleInputChange(item.id, 'razon_social', e.target.value)}
                                        placeholder="Cliente / Comercio"
                                    />
                                </div>

                                {/* Nivel */}
                                <div className="q-col">
                                    <span className="mobile-label">Nivel</span>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.nivel}
                                        onChange={(e) => handleInputChange(item.id, 'nivel', e.target.value)}
                                        placeholder="-"
                                    />
                                </div>

                                {/* Garantía */}
                                <div className="q-col">
                                    <span className="mobile-label">Garantía</span>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.garantia}
                                        onChange={(e) => handleInputChange(item.id, 'garantia', e.target.value)}
                                        placeholder="-"
                                    />
                                </div>

                                {/* Informe */}
                                <div className="q-col">
                                    <span className="mobile-label">Informe</span>
                                    <input
                                        type="text"
                                        className="table-input td-center"
                                        value={item.informe}
                                        onChange={(e) => handleInputChange(item.id, 'informe', e.target.value)}
                                        placeholder="-"
                                    />
                                </div>

                                {/* Cotización */}
                                <div className="q-col">
                                    <span className="mobile-label">Cotización</span>
                                    <input
                                        type="text"
                                        className="table-input td-center accent-text"
                                        value={item.cotizacion}
                                        onChange={(e) => handleInputChange(item.id, 'cotizacion', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="q-col text-center mt-actions">
                                    <button
                                        className="btn-remove"
                                        onClick={() => removeItem(item.id)}
                                        title="Eliminar fila"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Remove empty state logic as it always has at least one item */}
                </div>
            </main>

            {items.length > 0 && (
                <footer className="quotation-footer">
                    <div className="quotation-summary">
                        <span>Items: <strong>{items.length}</strong></span>
                    </div>
                    <div className="quotation-actions">
                        <button
                            className="btn btn--secondary btn--outline"
                            onClick={() => setShowPreview(true)}
                        >
                            Vista Previa
                        </button>


                        <button
                            className="btn btn--secondary btn--outline"
                            onClick={handleCopyTable}
                        >
                            {isCopied ? '¡Copiado!' : 'Copiar Tabla'}
                        </button>
                    </div>
                </footer>
            )}

            {showPreview && (
                <div className="modal-overlay" onClick={() => setShowPreview(false)}>
                    <div className="modal modal--wide glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        <div className="modal__header">
                            <h3 className="modal__title">Vista Previa de Cotización</h3>
                            <button className="modal__close" onClick={() => setShowPreview(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="modal__body" style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
                            <div className="preview-document">
                                <h1 style={{ fontSize: '24px', color: 'var(--accent)', marginBottom: '8px' }}>Cotización Técnico-Comercial</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>
                                    Fecha: {new Date().toLocaleDateString()} &nbsp;|&nbsp; Total Equipos: {items.length}
                                </p>

                                <div className="preview-table-wrapper">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>Nro</th>
                                                <th>Modelo</th>
                                                <th>Serial</th>
                                                <th>Razón Social</th>
                                                <th>Nivel</th>
                                                <th>Garantía</th>
                                                <th>Informe</th>
                                                <th className="t-right">Cotización</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.id}>
                                                    <td className="t-center font-mono text-muted">{item.nro}</td>
                                                    <td>{item.modelo || '-'}</td>
                                                    <td className="font-mono" style={{ color: 'var(--accent)' }}>{item.serial || '-'}</td>
                                                    <td><b>{item.razon_social || '-'}</b></td>
                                                    <td className="t-center">{item.nivel || '-'}</td>
                                                    <td className="t-center">{item.garantia || '-'}</td>
                                                    <td className="t-center">{item.informe || '-'}</td>
                                                    <td className="t-right font-mono" style={{ fontWeight: 600 }}>
                                                        {item.cotizacion ? `$${parseFloat(item.cotizacion).toFixed(2)}` : '$0.00'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {totalAmount > 0 && (
                                                <tr className="preview-total-row">
                                                    <td colSpan="6"></td>
                                                    <td className="t-right" style={{ fontWeight: 'bold' }}>TOTAL:</td>
                                                    <td className="t-right font-mono" style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}>
                                                        ${totalAmount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal__footer" style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <button className="btn btn--ghost" onClick={() => setShowPreview(false)}>Cerrar</button>

                            <button className="btn btn--primary" onClick={() => { setShowPreview(false); handleCopyTable(); }}>
                                {isCopied ? '¡Copiado!' : 'Copiar Tabla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .quotation-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .quotation-main {
                    margin-top: 24px;
                    width: 100%;
                }

                .quotation-table-wrapper {
                    width: 100%;
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-premium);
                    overflow: visible; /* Need this for dropdowns */
                }

                .quotation-header-row {
                    display: grid;
                    /* Flexible grid: fixed nro/actions, minmax proportional columns based on content weight */
                    grid-template-columns: 3rem minmax(0, 1fr) minmax(0, 1.5fr) minmax(150px, auto) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1fr) 3rem;
                    gap: 12px;
                    padding: 16px;
                    background: var(--accent-dim); /* Utilizando el mismo color naranja tenue de todo el sistema */
                    border-bottom: 2px solid var(--accent); /* Línea naranja nítida */
                    border-radius: var(--radius-md) var(--radius-md) 0 0;
                    align-items: center;
                    
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--accent);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .quotation-row {
                    display: grid;
                    grid-template-columns: 3rem minmax(0, 1fr) minmax(0, 1.5fr) minmax(150px, auto) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1fr) 3rem;
                    gap: 12px;
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--glass-border);
                    align-items: center;
                    transition: var(--transition);
                }

                .quotation-row:last-child {
                    border-bottom: none;
                }

                .quotation-row:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .q-col {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    min-width: 0; /* Prevents flex/grid blowouts */
                }

                .serial-col {
                    position: relative;
                }

                .mobile-label {
                    display: none;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .text-center {
                    text-align: center;
                }

                .mt-actions {
                    justify-content: center;
                    align-items: center;
                }

                .td-nro {
                    text-align: center;
                    font-family: var(--font-mono, monospace);
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 13px;
                }

                .td-center {
                    text-align: center;
                }

                .table-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid transparent;
                    color: var(--text-primary);
                    font-size: 13px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .table-input:hover {
                    background: rgba(255, 255, 255, 0.04);
                }

                .table-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.06);
                    border-color: var(--accent-dim);
                    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
                }

                .serial-input {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-weight: 600;
                    color: var(--accent);
                    letter-spacing: 0.02em;
                }

                .serial-input::placeholder {
                    font-family: var(--font-sans, inherit);
                    font-weight: 400;
                    color: var(--text-muted);
                }

                .accent-text {
                    color: var(--accent);
                    font-weight: 700;
                }

                .btn-remove {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin: 0 auto;
                }

                .btn-remove:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                /* Mobile Responsiveness Strategy */
                @media (max-width: 1024px) {
                    .quotation-header-row {
                        display: none;
                    }

                    .quotation-row {
                        display: flex;
                        flex-direction: column;
                        padding: 20px;
                        gap: 16px;
                        background: var(--glass-bg);
                        margin-bottom: 8px;
                        border: 1px solid var(--border);
                        border-radius: var(--radius-md);
                    }
                    
                    .quotation-row:last-child {
                        margin-bottom: 0;
                        border-bottom: 1px solid var(--border);
                    }

                    .mobile-label {
                        display: block;
                    }
                    
                    .q-col {
                        text-align: left;
                    }
                    
                    .td-center, .text-center {
                        text-align: left;
                    }

                    .td-nro {
                        text-align: left;
                    }
                    
                    .mt-actions {
                        flex-direction: row;
                        justify-content: flex-end;
                        border-top: 1px solid var(--glass-border);
                        padding-top: 16px;
                    }

                    .quotation-footer {
                        flex-direction: column;
                        gap: 16px;
                        align-items: stretch;
                    }
                    
                    .quotation-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .quotation-actions .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }

                /* Existing dropdown/button styles unmodified */
                .search-suggestions {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    padding: 8px;
                    border: 1px solid var(--border);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.5);
                    border-radius: 12px;
                }
                .suggestion-item {
                    padding: 12px 16px;
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
                    gap: 4px;
                }
                .suggestion-serial {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--accent);
                    font-family: monospace;
                }
                .suggestion-info {
                    font-size: 11px;
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
                    padding: 24px 32px;
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
                
                /* Preview Table Styles */
                .preview-document {
                    background: var(--bg-primary);
                    padding: 32px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                }
                .preview-table-wrapper {
                    overflow-x: auto;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                }
                .preview-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    text-align: left;
                }
                .preview-table th, .preview-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                }
                .preview-table th {
                    background: var(--accent-dim);
                    color: var(--accent);
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.05em;
                }
                .preview-table tr:hover td {
                    background: rgba(255, 255, 255, 0.01);
                }
                .preview-table tr:last-child td {
                    border-bottom: none;
                }
                .t-right { text-align: right; }
                .t-center { text-align: center; }
                .font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
                .text-muted { color: var(--text-muted); }
                .preview-total-row td {
                    background: rgba(251, 146, 60, 0.1) !important;
                    border-top: 2px solid var(--accent) !important;
                }
            `}</style>
        </div>
    );
}
