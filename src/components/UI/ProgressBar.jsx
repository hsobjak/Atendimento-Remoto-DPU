import React from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const wizardPaths = [
        '/wizard/personal',
        '/wizard/address',
        '/wizard/priorities',
        '/wizard/family',
        '/wizard/income',
        '/wizard/expenses',
        '/wizard/assets',
        '/wizard/demand'
    ];

    const currentStepIndex = wizardPaths.indexOf(currentPath);

    // Hide progress bar on welcome, result, or admin pages
    if (currentPath === '/' || currentPath === '/result' || currentPath.startsWith('/admin')) {
        return null;
    }

    const totalSteps = wizardPaths.length;
    // Calculate progress as a percentage
    // Even on step 1, it should show some progress
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#004d40', fontWeight: 'bold' }}>
                    Passo {currentStepIndex + 1} de {totalSteps}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {Math.round(progress)}% Concluído
                </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: '#2e7d32',
                    transition: 'width 0.4s ease-in-out'
                }} />
            </div>
        </div>
    );
};

export default ProgressBar;
