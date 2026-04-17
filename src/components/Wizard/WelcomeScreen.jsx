import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px', 
                opacity: 0.05, 
                transform: 'rotate(15deg)' 
            }}>
                <ShieldCheck size={200} color="var(--color-primary)" />
            </div>

            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '20px', fontWeight: 800 }}>
                Seja muito bem-vindo(a).
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '40px', lineHeight: '1.7', maxWidth: '650px', margin: '0 auto 40px' }}>
                Este assistente ajudará você a preencher as informações necessárias para que a 
                <strong> Defensoria Pública da União</strong> analise o seu caso com agilidade e segurança.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <button 
                    className="btn-primary" 
                    style={{ fontSize: '1.2rem', padding: '16px 48px', borderRadius: '50px' }}
                    onClick={() => navigate('/wizard/personal')}
                >
                    Iniciar Atendimento <ArrowRight size={22} />
                </button>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                    Leva cerca de 5 minutos • Suas informações estão protegidas
                </p>
            </div>

            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #EEE', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-secondary)', marginBottom: '10px' }}><ShieldCheck size={32} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>Sigilo Total</h4>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>Dados protegidos pela LGPD e sigilo profissional.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><ArrowRight size={32} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>Agilidade</h4>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>Triagem automatizada para reduzir filas.</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
