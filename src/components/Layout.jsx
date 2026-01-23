import React from 'react';
import { useLocation } from 'react-router-dom';
import ProgressBar from './UI/ProgressBar';

const Layout = ({ children }) => {
    const logoSrc = "/logo_dpu.png"; // We will try to map the placeholder in public if this is missing, but Vite serves from public root

    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ background: '#FFFFFF', borderBottom: '1px solid #e1e4e8', padding: '16px 0', borderTop: '4px solid #003B28' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src="/logo_dpu_header.png" alt="DPU Logo" style={{ height: '55px' }} />
                        <div>
                            <h1 style={{ fontSize: '1.4rem', color: '#003B28', margin: 0, fontWeight: 700, lineHeight: 1.1 }}>Defensoria Pública da União</h1>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Garantia de Assistência Jurídica Integral e Gratuita</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#003B28', borderLeft: '4px solid #D4AF37', paddingLeft: '10px' }}>
                            Formulário Socioeconômico
                        </span>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, padding: '40px 0' }}>
                <div className="container">
                    <ProgressBar />
                    {children}
                </div>
            </main>

            <footer style={{ background: 'var(--color-primary)', color: 'white', padding: '24px 0', marginTop: 'auto' }}>
                <div className="container" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    <p>© 2026 Defensoria Pública da União - Sistema de Triagem Assistida por IA</p>
                    <p style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '8px' }}>Uso interno e orientativo. A decisão final é prerrogativa do Defensor Público.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
