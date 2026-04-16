import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';

const AssetsQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const updateAssets = (field, value) => {
        updateData('financial', {
            assets: { ...data.financial.assets, [field]: value }
        });
    };

    const handleNext = () => {
        navigate('/wizard/demand');
    };

    return (
        <div className="card">
            <h2>Você possui algum desses bens?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Por último na parte financeira, precisamos saber se a casa em que você mora é própria e se você tem algum veículo.
            </p>

            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                    🏡 Em relação à moradia e imóveis:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { value: 'nao', label: 'Não possuo imóvel próprio (Moro de aluguel, favor, ou situação de rua)' },
                        { value: 'sim_moradia', label: 'Possuo apenas a casa onde eu moro' },
                        { value: 'sim_extra', label: 'Possuo minha casa e também outros imóveis (sítio, outra casa, terreno)' }
                    ].map(opt => (
                        <label key={opt.value} style={{ 
                            padding: '16px', 
                            background: data.financial.assets?.realEstate === opt.value ? '#e3f2fd' : '#f8f9fa', 
                            border: `2px solid ${data.financial.assets?.realEstate === opt.value ? '#1976d2' : '#dee2e6'}`, 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            fontSize: '1.1rem'
                        }}>
                            <input 
                                type="radio" 
                                name="imovel" 
                                style={{ transform: 'scale(1.5)' }}
                                value={opt.value} 
                                checked={data.financial.assets?.realEstate === opt.value}
                                onChange={e => updateAssets('realEstate', e.target.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                    🚗 Veículos:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { value: 'nao', label: 'Não possuo nenhum carro ou moto' },
                        { value: 'sim_trabalho', label: 'Possuo um veículo popular (usado para locomoção ou trabalho)' },
                        { value: 'sim_luxo', label: 'Possuo carro de luxo ou de alto valor' }
                    ].map(opt => (
                        <label key={opt.value} style={{ 
                            padding: '16px', 
                            background: data.financial.assets?.vehicle === opt.value ? '#e3f2fd' : '#f8f9fa', 
                            border: `2px solid ${data.financial.assets?.vehicle === opt.value ? '#1976d2' : '#dee2e6'}`, 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            fontSize: '1.1rem'
                        }}>
                            <input 
                                type="radio" 
                                name="veiculo" 
                                style={{ transform: 'scale(1.5)' }}
                                value={opt.value} 
                                checked={data.financial.assets?.vehicle === opt.value}
                                onChange={e => updateAssets('vehicle', e.target.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '30px 0' }} />

            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                    💰 Investimentos / Poupança:
                </label>
                <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Você possui dinheiro guardado em poupança, previdência privada, ações ou outros investimentos?
                </p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <input type="radio" name="hasInvestments" value="nao" style={{ transform: 'scale(1.5)' }} 
                            checked={data.financial.hasInvestments !== 'sim'} 
                            onChange={() => updateData('financial', { hasInvestments: 'nao', investments: [] })} 
                        />
                        Não possuo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <input type="radio" name="hasInvestments" value="sim" style={{ transform: 'scale(1.5)' }} 
                            checked={data.financial.hasInvestments === 'sim'} 
                            onChange={() => updateData('financial', { hasInvestments: 'sim' })} 
                        />
                        Sim, possuo
                    </label>
                </div>

                {data.financial.hasInvestments === 'sim' && (
                    <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        {(data.financial.investments || []).map((inv, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#e0f2f1', borderRadius: '6px', marginBottom: '8px', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: '#004d40' }}>{inv.description}</strong><br/>
                                    <span style={{ color: '#555' }}>R$ {inv.value}</span>
                                </div>
                                <button onClick={() => {
                                    const updated = (data.financial.investments || []).filter((_, i) => i !== idx);
                                    updateData('financial', { investments: updated });
                                }} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}>
                                    Remover
                                </button>
                            </div>
                        ))}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '16px', alignItems: 'flex-end', marginTop: '16px' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Tipo (Ex: Poupança Caixa)</label>
                                <input
                                    id="invDesc"
                                    className="form-control"
                                    placeholder="Do que se trata?"
                                />
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor Acumulado</label>
                                <input
                                    id="invVal"
                                    type="text"
                                    className="form-control"
                                    placeholder="R$ 0,00"
                                    onChange={(e) => e.target.value = e.target.value.replace(/[^0-9,.]/g, '')}
                                />
                            </div>
                            <button className="btn-secondary" style={{ height: '44px' }} onClick={() => {
                                const desc = document.getElementById('invDesc').value;
                                const val = document.getElementById('invVal').value;
                                if (!desc || !val) { alert('Informe o tipo e o valor'); return; }
                                const updated = [...(data.financial.investments || []), { description: desc, value: val }];
                                updateData('financial', { investments: updated });
                                document.getElementById('invDesc').value = '';
                                document.getElementById('invVal').value = '';
                            }}>
                                Adicionar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/expenses')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default AssetsQuestions;
