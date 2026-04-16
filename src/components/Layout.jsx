import React from 'react';
import { useLocation } from 'react-router-dom';
import ProgressBar from './UI/ProgressBar';

const Layout = ({ children }) => {
    const logoSrc = "/logo_dpu.png"; // We will try to map the placeholder in public if this is missing, but Vite serves from public root

    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ background: '#FFFFFF', borderBottom: '1px solid #e1e4e8', padding: '16px 0', borderTop: '4px solid #003B28' }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                        <img src="/logo_dpu_header.png" alt="DPU Logo" style={{ height: '55px', flexShrink: 0 }} />
                        <div style={{ flexShrink: 0 }}>
                            <h1 style={{ fontSize: '1.4rem', color: '#003B28', margin: 0, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>Defensoria Pública da União</h1>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, whiteSpace: 'nowrap' }}>Garantia de Assistência Jurídica Integral e Gratuita</p>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#003B28', borderLeft: '4px solid #D4AF37', paddingLeft: '16px', marginLeft: '16px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Formulário Socioeconômico
                        </span>
                    </div>
                    <div style={{ position: 'absolute', right: '32px' }}>
                        <a href="/admin" style={{ padding: '10px 20px', background: '#003B28', color: '#FFF', border: 'none', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'inline-block' }}>
                            Área do Administrador
                        </a>
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
                    <p>© 2026 Defensoria Pública da União - Sistema de Geração de Formulário Socioeconômico</p>
                    <p style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '8px' }}>Uso interno e orientativo. A decisão final é prerrogativa do Defensor Público Federal.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
