import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';

const FinancialStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/step/4');
    };

    const updateExpense = (field, value) => {
        updateData('financial', {
            expenses: { ...data.financial.expenses, [field]: parseFloat(value) || 0 }
        });
    };

    const updateExtra = (field, value) => {
        updateData('financial', {
            extraDeduction: { ...data.financial.extraDeduction, [field]: value }
        });
    };

    const updateAssets = (field, value) => {
        updateData('financial', {
            assets: { ...data.financial.assets, [field]: value }
        });
    };

    return (
        <div className="card">
            <h2>3. Análise Financeira</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Registro de despesas essenciais, deduções permitidas e patrimônio.
            </p>

            <h3 style={{ fontSize: '1rem', color: '#444', marginBottom: '16px' }}>Despesas Mensais (Informadas)</h3>

            <div style={{ display: 'grid', gap: '12px' }}>
                {[
                    { label: 'Aluguel', key: 'rent' },
                    { label: 'Água', key: 'water' },
                    { label: 'Luz', key: 'light' },
                    { label: 'Aliment.', key: 'food' },
                    { label: 'Saúde', key: 'health' },
                    { label: 'Transp.', key: 'transport' }
                ].map((item) => (
                    <div key={item.key}>
                        <label className="form-label" style={{ fontSize: '0.9rem' }}>{item.label}</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="0,00"
                            value={data.financial.expenses?.[item.key] || ''}
                            onChange={(e) => updateExpense(item.key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>Deduções Extras (Não-Automáticas)</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '12px' }}>
                * BPC e Bolsa Família são deduzidos automaticamente na próxima etapa. Informe aqui apenas gastos extraordinários (Saúde, etc).
            </p>

            <div className="form-group">
                <label className="form-label">Valor Extra a Deduzir (R$)</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="0,00"
                    value={data.financial.extraDeduction?.value || ''}
                    onChange={(e) => updateExtra('value', parseFloat(e.target.value) || 0)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Justificativa</label>
                <input
                    className="form-control"
                    placeholder="Ex: Gastos com tratamento médico contínuo"
                    value={data.financial.extraDeduction?.justification || ''}
                    onChange={(e) => updateExtra('justification', e.target.value)}
                />
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>Patrimônio</h3>

            <div className="form-group">
                <label className="form-label">Imóvel?</label>
                <select
                    className="form-control"
                    value={data.financial.assets?.realEstate || ''}
                    onChange={(e) => updateAssets('realEstate', e.target.value)}
                >
                    <option value="">Selecione...</option>
                    <option value="nao">Não possui</option>
                    <option value="sim_moradia">Sim, único (Moradia)</option>
                    <option value="sim_extra">Sim, possui outros imóveis</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Veículo?</label>
                <select
                    className="form-control"
                    value={data.financial.assets?.vehicle || ''}
                    onChange={(e) => updateAssets('vehicle', e.target.value)}
                >
                    <option value="">Selecione...</option>
                    <option value="nao">Não possui</option>
                    <option value="sim_trabalho">Sim, popular/trabalho</option>
                    <option value="sim_luxo">Sim, luxo/alto valor</option>
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/2')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Próximo Passo</button>
            </div>
        </div>
    );
};

export default FinancialStep;
