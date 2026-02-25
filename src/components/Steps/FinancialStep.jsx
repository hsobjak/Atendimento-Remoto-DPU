import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { Plus, Trash2 } from 'lucide-react';

const FinancialStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    // Local state for new custom expense
    const [newExpense, setNewExpense] = useState({ description: '', value: '' });

    // Local state for investments
    const [newInvestment, setNewInvestment] = useState({ description: '', value: '' });

    // Local state for new deduction item
    const [newDeduction, setNewDeduction] = useState({ description: '', value: '' });

    const handleNext = () => {
        navigate('/step/4');
    };

    const updateExpense = (field, value) => {
        updateData('financial', {
            expenses: { ...data.financial.expenses, [field]: parseFloat(value) || 0 }
        });
    };

    const updateAssets = (field, value) => {
        updateData('financial', {
            assets: { ...data.financial.assets, [field]: value }
        });
    };

    // --- Custom Expenses ---
    const addCustomExpense = () => {
        if (!newExpense.description || !newExpense.value) {
            alert('Informe a descrição e o valor da despesa.');
            return;
        }
        const updated = [...(data.financial.customExpenses || []), {
            description: newExpense.description,
            value: parseFloat(newExpense.value) || 0
        }];
        updateData('financial', { customExpenses: updated });
        setNewExpense({ description: '', value: '' });
    };

    const removeCustomExpense = (index) => {
        const updated = (data.financial.customExpenses || []).filter((_, i) => i !== index);
        updateData('financial', { customExpenses: updated });
    };

    // --- Deduction Items ---
    const addDeduction = () => {
        if (!newDeduction.description || !newDeduction.value) {
            alert('Informe a descrição e o valor da dedução.');
            return;
        }
        const updated = [...(data.financial.deductionItems || []), {
            description: newDeduction.description,
            value: parseFloat(newDeduction.value) || 0
        }];
        updateData('financial', { deductionItems: updated });
        setNewDeduction({ description: '', value: '' });
    };

    const removeDeduction = (index) => {
        const updated = (data.financial.deductionItems || []).filter((_, i) => i !== index);
        updateData('financial', { deductionItems: updated });
    };

    const totalDeductions = (data.financial.deductionItems || []).reduce(
        (acc, d) => acc + (parseFloat(d.value) || 0), 0
    );

    return (
        <div className="card">
            <h2>3. Análise Financeira</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Registro de despesas essenciais, deduções permitidas e patrimônio.
            </p>

            {/* ── Despesas Mensais Fixas ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginBottom: '16px' }}>Despesas Mensais (Informadas)</h3>

            <div style={{ display: 'grid', gap: '12px' }}>
                {[
                    { label: 'Aluguel', key: 'rent' },
                    { label: 'Água', key: 'water' },
                    { label: 'Luz', key: 'light' },
                    { label: 'Alimentação', key: 'food' },
                    { label: 'Saúde', key: 'health' },
                    { label: 'Transporte', key: 'transport' }
                ].map((item) => (
                    <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: 0 }}>{item.label}</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="0,00"
                            value={data.financial.expenses?.[item.key] || ''}
                            onChange={(e) => updateExpense(item.key, e.target.value)}
                        />
                    </div>
                ))}

                {/* Despesas extras adicionadas */}
                {(data.financial.customExpenses || []).map((exp, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 36px', alignItems: 'center', gap: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: 0, color: '#555' }}>
                            {exp.description}
                        </label>
                        <div style={{ background: '#f0f0f0', padding: '8px 12px', borderRadius: '4px', fontSize: '0.9rem' }}>
                            R$ {exp.value.toFixed(2)}
                        </div>
                        <button
                            onClick={() => removeCustomExpense(idx)}
                            style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Formulário para adicionar despesa extra */}
            <div style={{
                marginTop: '16px',
                padding: '14px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px dashed #ccc'
            }}>
                <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '10px', fontWeight: 600 }}>
                    + Adicionar outra despesa
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Descrição</label>
                        <input
                            className="form-control"
                            placeholder="Ex: Medicamento contínuo"
                            value={newExpense.description}
                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor (R$)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="0,00"
                            value={newExpense.value}
                            onChange={e => setNewExpense({ ...newExpense, value: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn-secondary"
                        onClick={addCustomExpense}
                        style={{ whiteSpace: 'nowrap', height: '40px' }}
                    >
                        <Plus size={14} style={{ verticalAlign: 'middle' }} /> Adicionar
                    </button>
                </div>
            </div>

            {/* ── Deduções Extras ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '28px', marginBottom: '8px' }}>
                Deduções Extras (Não-Automáticas)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '14px' }}>
                * BPC e Bolsa Família são excluídos automaticamente da renda. Informe aqui gastos extraordinários dedutíveis (tratamentos, pensão alimentícia, etc).
            </p>

            {/* Lista de deduções */}
            {(data.financial.deductionItems || []).length > 0 && (
                <div style={{ marginBottom: '14px', border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Descrição</th>
                                <th style={{ padding: '8px 12px' }}>Valor</th>
                                <th style={{ padding: '8px 12px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.financial.deductionItems || []).map((ded, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px 12px' }}>{ded.description}</td>
                                    <td style={{ padding: '8px 12px' }}>R$ {ded.value.toFixed(2)}</td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => removeDeduction(idx)}
                                            style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                                <td style={{ padding: '8px 12px' }}>Total de Deduções</td>
                                <td style={{ padding: '8px 12px' }} colSpan={2}>R$ {totalDeductions.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* Formulário para adicionar dedução */}
            <div style={{
                padding: '14px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px dashed #ccc'
            }}>
                <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '10px', fontWeight: 600 }}>
                    + Adicionar dedução
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Descrição</label>
                        <input
                            className="form-control"
                            placeholder="Ex: Plano de saúde, pensão alimentícia"
                            value={newDeduction.description}
                            onChange={e => setNewDeduction({ ...newDeduction, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor (R$)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="0,00"
                            value={newDeduction.value}
                            onChange={e => setNewDeduction({ ...newDeduction, value: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn-secondary"
                        onClick={addDeduction}
                        style={{ whiteSpace: 'nowrap', height: '40px' }}
                    >
                        <Plus size={14} style={{ verticalAlign: 'middle' }} /> Adicionar
                    </button>
                </div>
            </div>

            {/* ── Patrimônio ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '28px', marginBottom: '16px' }}>Patrimônio</h3>

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

            {/* ── Investimentos Financeiros ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '28px', marginBottom: '8px' }}>Investimentos Financeiros</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '14px' }}>
                O assistido possui investimentos financeiros (poupança, CDB, ações, fundos, etc.)?
            </p>

            {/* Botões Sim / Não */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {['nao', 'sim'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => updateData('financial', { hasInvestments: opt, investments: opt === 'nao' ? [] : (data.financial.investments || []) })}
                        style={{
                            padding: '8px 28px',
                            borderRadius: '6px',
                            border: '2px solid',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            borderColor: data.financial.hasInvestments === opt ? (opt === 'sim' ? '#2e7d32' : '#c62828') : '#ccc',
                            background: data.financial.hasInvestments === opt ? (opt === 'sim' ? '#e8f5e9' : '#ffebee') : '#fff',
                            color: data.financial.hasInvestments === opt ? (opt === 'sim' ? '#2e7d32' : '#c62828') : '#666',
                        }}
                    >
                        {opt === 'sim' ? '✔ Sim' : '✖ Não'}
                    </button>
                ))}
            </div>

            {/* Formulário e lista de investimentos (só aparece se Sim) */}
            {data.financial.hasInvestments === 'sim' && (
                <div>
                    {/* Lista de investimentos adicionados */}
                    {(data.financial.investments || []).length > 0 && (
                        <div style={{ marginBottom: '14px', border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#eee', textAlign: 'left' }}>
                                        <th style={{ padding: '8px 12px' }}>Tipo de Investimento</th>
                                        <th style={{ padding: '8px 12px' }}>Valor Aprox.</th>
                                        <th style={{ padding: '8px 12px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.financial.investments || []).map((inv, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px 12px' }}>{inv.description}</td>
                                            <td style={{ padding: '8px 12px' }}>R$ {parseFloat(inv.value).toFixed(2)}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        const updated = (data.financial.investments || []).filter((_, i) => i !== idx);
                                                        updateData('financial', { investments: updated });
                                                    }}
                                                    style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Formulário para novo investimento */}
                    <div style={{ padding: '14px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '10px', fontWeight: 600 }}>+ Adicionar investimento</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: '10px', alignItems: 'flex-end' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Tipo de investimento</label>
                                <input
                                    className="form-control"
                                    placeholder="Ex: Poupança, CDB, Ações, Tesouro..."
                                    value={newInvestment.description}
                                    onChange={e => setNewInvestment({ ...newInvestment, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor aprox. (R$)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0,00"
                                    value={newInvestment.value}
                                    onChange={e => setNewInvestment({ ...newInvestment, value: e.target.value })}
                                />
                            </div>
                            <button
                                className="btn-secondary"
                                style={{ whiteSpace: 'nowrap', height: '40px' }}
                                onClick={() => {
                                    if (!newInvestment.description || !newInvestment.value) {
                                        alert('Informe o tipo e o valor do investimento.');
                                        return;
                                    }
                                    const updated = [...(data.financial.investments || []), {
                                        description: newInvestment.description,
                                        value: parseFloat(newInvestment.value) || 0
                                    }];
                                    updateData('financial', { investments: updated });
                                    setNewInvestment({ description: '', value: '' });
                                }}
                            >
                                <Plus size={14} style={{ verticalAlign: 'middle' }} /> Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/2')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Próximo Passo</button>
            </div>
        </div>
    );
};

export default FinancialStep;
