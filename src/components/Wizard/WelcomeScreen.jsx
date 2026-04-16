import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '2rem', color: '#004d40', marginBottom: '16px' }}>Olá! Seja muito bem-vindo(a).</h1>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '40px', lineHeight: '1.6' }}>
                Para entendermos a sua situação e verificarmos como a Defensoria Pública da União pode te auxiliar, 
                precisamos fazer algumas perguntinhas sobre você e quem mora na sua casa.<br/><br/>
                Não se preocupe, é rápido e todas as informações são mantidas em sigilo absoluto.
            </p>
            <button 
                className="btn-primary" 
                style={{ fontSize: '1.2rem', padding: '12px 32px' }}
                onClick={() => navigate('/wizard/personal')}
            >
                Começar
            </button>
        </div>
    );
};

export default WelcomeScreen;
