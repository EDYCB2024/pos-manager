import { useState } from 'react';
import './shared.css';
import './Inventory.css';

const INITIAL_INVENTORY = [
    { id: 1, nombre: 'Lector de Tarjetas', categoria: 'Hardware', stock: 15, minStock: 5 },
    { id: 2, nombre: 'Impresora Térmica', categoria: 'Hardware', stock: 8, minStock: 3 },
    { id: 3, nombre: 'Pantalla LCD N910', categoria: 'Pantalla', stock: 4, minStock: 5 },
    { id: 4, nombre: 'Batería 3.7V', categoria: 'Batería', stock: 25, minStock: 10 },
    { id: 5, nombre: 'Teclado / Pinpad', categoria: 'Teclado', stock: 12, minStock: 4 },
    { id: 6, nombre: 'Cargadores 5V 2A', categoria: 'Energía', stock: 40, minStock: 15 },
    { id: 7, nombre: 'Rollos de Papel', categoria: 'Consumibles', stock: 100, minStock: 20 },
];

export default function Inventory() {
    const [items, setItems] = useState(INITIAL_INVENTORY);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateStock = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newStock = Math.max(0, item.stock + delta);
                return { ...item, stock: newStock };
            }
            return item;
        }));
    };

    return (
        <div className="inventory-page anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventario de Repuestos</h1>
                    <p className="page-sub">Control de partes y piezas disponibles</p>
                </div>
                <div className="search-box">
                    <span className="search-box__icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar repuesto..."
                        className="search-box__input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass inventory-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Repuesto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Mínimo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const isLowStock = item.stock <= item.minStock;
                            return (
                                <tr key={item.id} className="data-table__row">
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{item.nombre}</div>
                                    </td>
                                    <td>{item.categoria}</td>
                                    <td>
                                        <span className={`stock-badge ${isLowStock ? 'stock-badge--low' : 'stock-badge--ok'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td>{item.minStock}</td>
                                    <td>
                                        {isLowStock ?
                                            <span className="status-badge status-badge--danger">Bajo Stock</span> :
                                            <span className="status-badge status-badge--success">Disponible</span>
                                        }
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="action-btn action-btn--edit"
                                                onClick={() => handleUpdateStock(item.id, 1)}
                                                title="Añadir stock"
                                            >
                                                +
                                            </button>
                                            <button
                                                className="action-btn action-btn--delete"
                                                onClick={() => handleUpdateStock(item.id, -1)}
                                                title="Quitar stock"
                                            >
                                                -
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-state__icon">📦</span>
                        <p>No se encontraron repuestos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
