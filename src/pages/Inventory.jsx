import { useState } from 'react';
import './shared.css';
import './Inventory.css';

const INITIAL_INVENTORY = [
    { id: 1, codigo: 'REP-001', nombre: 'Lector de Tarjetas',   categoria: 'Hardware',     stock: 15,  minStock: 5  },
    { id: 2, codigo: 'REP-002', nombre: 'Impresora Térmica',    categoria: 'Hardware',     stock: 8,   minStock: 3  },
    { id: 3, codigo: 'REP-003', nombre: 'Pantalla LCD N910',    categoria: 'Pantalla',     stock: 4,   minStock: 5  },
    { id: 4, codigo: 'REP-004', nombre: 'Batería 3.7V',         categoria: 'Batería',      stock: 25,  minStock: 10 },
    { id: 5, codigo: 'REP-005', nombre: 'Teclado / Pinpad',     categoria: 'Teclado',      stock: 12,  minStock: 4  },
    { id: 6, codigo: 'REP-006', nombre: 'Cargadores 5V 2A',     categoria: 'Energía',      stock: 40,  minStock: 15 },
    { id: 7, codigo: 'REP-007', nombre: 'Rollos de Papel',      categoria: 'Consumibles',  stock: 100, minStock: 20 },
];

let nextId = INITIAL_INVENTORY.length + 1;

export default function Inventory() {
    const [items, setItems]         = useState(INITIAL_INVENTORY);
    const [searchTerm, setSearchTerm] = useState('');
    const [key, setKey]             = useState(0); // for refresh

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateStock = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, stock: Math.max(0, item.stock + delta) };
            }
            return item;
        }));
    };

    const handleRefresh = () => {
        setItems(INITIAL_INVENTORY);
        setSearchTerm('');
        setKey(k => k + 1);
    };

    const handleAdd = () => {
        const codigo = `REP-${String(nextId).padStart(3, '0')}`;
        const nombre = prompt('Nombre del repuesto:');
        if (!nombre?.trim()) return;
        const categoria = prompt('Categoría:') || 'General';
        const minStock  = parseInt(prompt('Stock mínimo:') || '5', 10);
        setItems(prev => [
            ...prev,
            { id: nextId, codigo, nombre: nombre.trim(), categoria: categoria.trim(), stock: 0, minStock }
        ]);
        nextId++;
    };

    return (
        <div className="inventory-page anim-fadeUp" key={key}>
            {/* ── Header ───────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventario de Repuestos</h1>
                    <p className="page-sub">
                        Control de partes y piezas — {items.length} artículo{items.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="page-header__actions">
                    <div className="search-box">
                        <span className="search-box__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar repuesto, código o categoría..."
                            className="search-box__input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="search-box__clear" onClick={() => setSearchTerm('')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}
                    </div>
                    {/* Refresh */}
                    <button className="btn-icon" onClick={handleRefresh} title="Refrescar inventario">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8M21 3v5h-5" />
                        </svg>
                    </button>
                    {/* Add */}
                    <button className="btn-icon btn-icon--primary" onClick={handleAdd} title="Añadir repuesto">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Table ────────────────────────────────────── */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Repuesto / Parte</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                    No se encontraron repuestos para esta búsqueda.
                                </td>
                            </tr>
                        ) : filteredItems.map(item => {
                            const isLowStock = item.stock <= item.minStock;
                            return (
                                <tr key={item.id} className="data-table__row">
                                    <td>
                                        <code className="serial-code">{item.codigo}</code>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.nombre}</div>
                                    </td>
                                    <td>
                                        <span className="category-tag">{item.categoria}</span>
                                    </td>
                                    <td>
                                        <span className={`stock-badge ${isLowStock ? 'stock-badge--low' : 'stock-badge--ok'}`}>
                                            {item.stock} uds
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.minStock} uds</td>
                                    <td>
                                        {isLowStock
                                            ? <span className="status-badge status-badge--danger">⚠ Bajo Stock</span>
                                            : <span className="status-badge status-badge--success">✓ Disponible</span>
                                        }
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="action-btn action-btn--edit"
                                                onClick={() => handleUpdateStock(item.id, 1)}
                                                title="Añadir una unidad"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            </button>
                                            <button
                                                className="action-btn action-btn--delete"
                                                onClick={() => handleUpdateStock(item.id, -1)}
                                                title="Quitar una unidad"
                                                disabled={item.stock === 0}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
