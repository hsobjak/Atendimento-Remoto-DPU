import React from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const stepMatch = currentPath.match(/\/step\/(\d+)/);
    const currentStep = stepMatch ? parseInt(stepMatch[1]) : 0;

    if (currentPath === '/result') return null;

    const steps = [
        { num: 1, label: '1. Cadastro' },
        { num: 2, label: '2. Família/Renda' },
        { num: 3, label: '3. Financeiro' },
    ];

    const progress = (currentStep / steps.length) * 100;

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                {steps.map((s) => (
                    <div key={s.num} style={{
                        color: s.num <= currentStep ? 'var(--color-primary)' : '#ccc',
                        fontWeight: s.num === currentStep ? 'bold' : 'normal',
                        fontSize: '0.85rem'
                    }}>
                        {s.label}
                    </div>
                ))}
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--color-secondary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    );
};

export default ProgressBar;
