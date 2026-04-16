import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';

const PriorityQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const updatePriority = (key, checked) => {
        const currentPriorities = data.personal.priorities || {};
        updateData('personal', {
            priorities: { ...currentPriorities, [key]: checked }
        });
    };

    const updatePersonal = (field, value) => {
        updateData('personal', { [field]: value });
    };

    const handleNext = () => {
        navigate('/wizard/family');
    };

    return (
        <div className="card">
            <h2>Alguma condição especial?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Marque baixo as opções que se aplicam a você. Isso nos ajuda a identificar se há alguma prioridade legal para o seu atendimento.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                {[
                    { key: 'elderly', label: 'Idoso (Tenho 60 anos ou mais)' },
                    { key: 'pwd', label: 'Pessoa com Deficiência (PcD)' },
                    { key: 'illness', label: 'Possuo Doença Grave (Ex: Câncer, HIV, etc)' },
                    { key: 'urgency', label: 'É um caso de Extrema Urgência (Risco de morte, prisão, etc)' }
                ].map(p => (
                    <label 
                        key={p.key} 
                        style={{ 
                            background: data.personal.priorities?.[p.key] ? '#e8f5e9' : '#f8f9fa', 
                            padding: '16px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            cursor: 'pointer', 
                            border: `2px solid ${data.personal.priorities?.[p.key] ? '#4caf50' : '#ddd'}`,
                            fontSize: '1.1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <input
                            type="checkbox"
                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            checked={data.personal.priorities?.[p.key] || false}
                            onChange={e => updatePriority(p.key, e.target.checked)}
                        />
                        {p.label}
                    </label>
                ))}
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '30px 0' }} />

            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Você está preenchendo isso para outra pessoa?</h3>
            <div className="form-group">
                <select 
                    className="form-control" 
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                    value={data.personal.isRepresented || 'nao'} 
                    onChange={e => updatePersonal('isRepresented', e.target.value)}
                >
                    <option value="nao">Não, eu mesmo buscarei a assistência em meu nome</option>
                    <option value="sim">Sim, estou representando alguém (Ex: filho menor, pessoa interditada)</option>
                </select>
            </div>

            {data.personal.isRepresented === 'sim' && (
                <div className="form-group animate-fade-in" style={{ marginTop: '20px' }}>
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Qual o seu nome? (Representante)</label>
                    <input 
                        className="form-control" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.representativeName || ''} 
                        onChange={e => updatePersonal('representativeName', e.target.value)} 
                    />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/address')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default PriorityQuestions;
