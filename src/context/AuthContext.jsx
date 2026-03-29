import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('pos_demo_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        // En modo demo, aceptamos cualquier login o fallamos si queremos simular
        const demoUser = { id: 'demo-123', name: 'Usuario Demo', email: email || 'demo@posmanager.pro', role: 'admin' };
        setUser(demoUser);
        localStorage.setItem('pos_demo_user', JSON.stringify(demoUser));
        return { success: true };
    };

    const loginAsDemo = async () => {
        const demoUser = { id: 'demo-123', name: 'Expert User', email: 'demo@posmanager.pro', role: 'admin' };
        setUser(demoUser);
        localStorage.setItem('pos_demo_user', JSON.stringify(demoUser));
        return { success: true };
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('pos_demo_user');
    };

    const checkSession = () => {
        // La sesión se recupera del localStorage arriba
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, checkSession, loading, loginAsDemo }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
