import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { maskCurrency } from '../../utils/masks';

const IncomeQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const updateMemberIncome = (idx, field, value) => {
        const members = [...data.family.members];
        members[idx] = { ...members[idx], [field]: value };
        
        // Reset benefitType if incomeSource changed
        if (field === 'incomeSource') {
            members[idx].benefitType = '';
        }
        
        updateData('family', { members });
    };

    const handleNext = () => {
        navigate('/wizard/expenses');
    };

    return (
        <div className="card">
            <h2>Sobre a Renda das pessoas da casa</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Agora, para cada pessoa que você adicionou, informe se ela possui alguma fonte de renda (salário, bicos, aposentadoria, Bolsa Família, BPC...).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {(data.family.members || []).map((m, idx) => (
                    <div key={idx} style={{ 
                        background: '#f8f9fa', 
                        padding: '24px', 
                        borderRadius: '8px', 
                        border: '1px solid #dee2e6' 
                    }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#004d40', marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            {m.name} <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>({m.kinship})</span>
                        </h3>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">De onde vem o dinheiro desta pessoa?</label>
                            <select 
                                className="form-control" 
                                style={{ padding: '12px', fontSize: '1.1rem' }}
                                value={m.incomeSource || 'Sem Renda'} 
                                onChange={e => updateMemberIncome(idx, 'incomeSource', e.target.value)}
                            >
                                <option value="Sem Renda">Não possui nenhuma renda</option>
                                <option value="Trabalho Formal">Trabalho c/ Carteira Assinada (CLT)</option>
                                <option value="Informal/Autônomo">Trabalho Informal / Bicos / Autônomo</option>
                                <option value="Benefício Social">Benefício Social (Bolsa Família, BPC...)</option>
                                <option value="Aposentadoria">Aposentadoria ou Pensão</option>
                                <option value="Outros">Outras Fontes</option>
                            </select>
                        </div>

                        {m.incomeSource === 'Benefício Social' && (
                            <div className="form-group animate-fade-in" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Qual é o Benefício Social?</label>
                                <select 
                                    className="form-control" 
                                    style={{ padding: '12px', fontSize: '1.1rem' }}
                                    value={m.benefitType || ''} 
                                    onChange={e => updateMemberIncome(idx, 'benefitType', e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Bolsa Família">Bolsa Família</option>
                                    <option value="BPC">BPC (Idoso ou PcD)</option>
                                    <option value="Outro">Outro</option>
                                </select>

                                {(m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família') && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: '#e3f2fd', color: '#0277bd', borderRadius: '6px', fontSize: '0.9rem' }}>
                                        Dica: O Bolsa Família e o BPC não são contados na renda final pela DPU. Mas é importante informar!
                                    </div>
                                )}
                            </div>
                        )}

                        {m.incomeSource !== 'Sem Renda' && (
                            <div className="form-group animate-fade-in">
                                <label className="form-label">Qual o valor recebido por mês? (Aproximado)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="R$ 0,00" 
                                    style={{ padding: '12px', fontSize: '1.1rem', maxWidth: '250px', background: '#fff' }}
                                    value={m.incomeValue || ''} 
                                    onChange={e => updateMemberIncome(idx, 'incomeValue', maskCurrency(e.target.value))} 
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/family')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default IncomeQuestions;
