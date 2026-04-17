import React from 'react';
import ProgressBar from './UI/ProgressBar';

const Layout = ({ children }) => {
    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ 
                background: '#FFFFFF', 
                borderBottom: '1px solid #e1e4e8', 
                padding: '20px 0', 
                borderTop: '5px solid var(--color-primary)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                zIndex: 10
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <img src="/logo_dpu_header.png" alt="DPU Logo" style={{ height: '60px', flexShrink: 0 }} />
                        <div style={{ borderLeft: '2px solid #EEE', paddingLeft: '20px' }}>
                            <h1 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700, lineHeight: 1.2 }}>
                                Defensoria Pública da União
                            </h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                Geração de Formulário Socioeconômico
                            </p>
                        </div>
                    </div>
                    <div>
                        <a href="/admin" className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px', textDecoration: 'none' }}>
                            Área do Administrador
                        </a>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, padding: '60px 0' }}>
                <div className="container">
                    <ProgressBar />
                    <div className="content-wrapper" style={{ maxWidth: '850px', margin: '0 auto' }}>
                        {children}
                    </div>
                </div>
            </main>

            <footer style={{ background: 'var(--color-primary)', color: 'white', padding: '32px 0', marginTop: 'auto' }}>
                <div className="container" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <p style={{ fontWeight: 500 }}>© 2026 Defensoria Pública da União</p>
                    <p style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0' }}>
                        Sistema de triagem orientativa conforme Resolução CSDPU nº 240/2025. 
                        A decisão final sobre o atendimento é prerrogativa do Defensor Público Federal.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
