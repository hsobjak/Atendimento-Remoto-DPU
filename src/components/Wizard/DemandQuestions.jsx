import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { TIPOS_DEMANDA } from '../../utils/constants';

const DemandQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const updateDemand = (field, value) => {
        updateData('demand', { [field]: value });
    };

    const updateDeclaration = (field, value) => {
        updateData('demand', {
            declarations: { ...data.demand?.declarations, [field]: value }
        });
    };

    const handleNext = () => {
        if (!data.demand?.type || !data.demand?.object) {
            alert('Por favor, informe a área do direito e o que precisa ser pedido.');
            return;
        }

        if (!data.demand?.declarations?.truthfulness || !data.demand?.declarations?.hyposufficiency) {
            alert("Você precisa concordar com as duas declarações no final da página para prosseguirmos.");
            return;
        }
        
        navigate('/result');
    };

    return (
        <div className="card">
            <h2>Por fim, como podemos ajudar?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                O que fez você procurar a Defensoria Pública? Conte-nos um resumo do seu problema.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>Em qual destas áreas se encaixa o seu pedido? *</label>
                <select 
                    className="form-control" 
                    style={{ fontSize: '1.1rem', padding: '14px' }}
                    value={data.demand?.type || ''} 
                    onChange={e => updateDemand('type', e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {Object.values(TIPOS_DEMANDA).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
                    Caso não tenha certeza, escolha a que parece mais próxima do seu problema.
                </small>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>Descreva em poucas palavras o que você precisa: *</label>
                <input
                    className="form-control"
                    placeholder="Ex: Preciso conseguir um remédio que o SUS não tem, ou Quero aposentar..."
                    style={{ fontSize: '1.1rem', padding: '14px' }}
                    value={data.demand?.object || ''}
                    onChange={e => updateDemand('object', e.target.value)}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '40px' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>Você já tem um Processo na Justiça sobre isso?</label>
                <input
                    className="form-control"
                    placeholder="Se tiver o número, digite aqui. Se não tiver, deixe em branco."
                    style={{ fontSize: '1.1rem', padding: '14px' }}
                    value={data.demand?.processNumber || ''}
                    onChange={e => updateDemand('processNumber', e.target.value)}
                />
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '30px 0' }} />

            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#c62828' }}>Termo de Veracidade</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                Para finalizar, apenas precisamos que você concorde com os termos abaixo de que as informações são verdadeiras. A declaração falsa sujeita o autor às penalidades da Lei (Crime de Falsidade Ideológica).
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: '#f1f8e9',
                    borderRadius: '8px',
                    border: '2px solid #c5e1a5',
                    cursor: 'pointer',
                    color: '#33691e',
                    fontSize: '1.1rem'
                }}>
                    <input
                        type="checkbox"
                        style={{ transform: 'scale(1.5)' }}
                        checked={data.demand?.declarations?.truthfulness || false}
                        onChange={e => updateDeclaration('truthfulness', e.target.checked)}
                    />
                    Declaro, sob as penas da Lei, que as informações que digitei aqui são verdadeiras.
                </label>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: '#f1f8e9',
                    borderRadius: '8px',
                    border: '2px solid #c5e1a5',
                    cursor: 'pointer',
                    color: '#33691e',
                    fontSize: '1.1rem'
                }}>
                    <input
                        type="checkbox"
                        style={{ transform: 'scale(1.5)' }}
                        checked={data.demand?.declarations?.hyposufficiency || false}
                        onChange={e => updateDeclaration('hyposufficiency', e.target.checked)}
                    />
                    Declaro que não tenho condições de pagar um advogado particular sem prejudicar meu sustento.
                </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/assets')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext} style={{ background: '#2e7d32', padding: '14px 24px', fontSize: '1.1rem' }}>
                    Concluir Envio
                </button>
            </div>
        </div>
    );
};

export default DemandQuestions;
