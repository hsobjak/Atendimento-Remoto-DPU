import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { Plus, Trash2 } from 'lucide-react';
import { maskCurrency, unmaskCurrency } from '../../utils/masks';
import { formatCurrency } from '../../utils/businessRules';
import { TIPOS_DEMANDA } from '../../utils/constants';

const FinancialStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    // Local state for new custom expense
    const [newExpense, setNewExpense] = useState({ description: '', value: '' });

    // Local state for investments
    const [newInvestment, setNewInvestment] = useState({ description: '', value: '' });

    // Local state for new deduction item
    const [newDeduction, setNewDeduction] = useState({ description: '', value: '' });

    const updateDemand = (field, value) => {
        updateData('demand', { [field]: value });
    };

    const updateDeclaration = (field, value) => {
        updateData('demand', {
            declarations: { ...data.demand?.declarations, [field]: value }
        });
    };

    const handleNext = () => {
        // Validation for declarations
        if (!data.demand?.declarations?.truthfulness || !data.demand?.declarations?.hyposufficiency) {
            alert("É necessário aceitar as declarações de veracidade e hipossuficiência.");
            return;
        }
        navigate('/result');
    };

    const updateExpense = (field, value) => {
        updateData('financial', {
            expenses: { ...data.financial.expenses, [field]: value }
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
            value: newExpense.value
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
            value: newDeduction.value
        }];
        updateData('financial', { deductionItems: updated });
        setNewDeduction({ description: '', value: '' });
    };

    const removeDeduction = (index) => {
        const updated = (data.financial.deductionItems || []).filter((_, i) => i !== index);
        updateData('financial', { deductionItems: updated });
    };

    const totalDeductions = (data.financial.deductionItems || []).reduce(
        (acc, d) => acc + unmaskCurrency(d.value), 0
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
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            value={maskCurrency(data.financial?.expenses?.[item.key] || '0')}
                            onChange={(e) => updateExpense(item.key, maskCurrency(e.target.value))}
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
                            {formatCurrency(unmaskCurrency(exp.value))}
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
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            value={newExpense.value}
                            onChange={e => setNewExpense({ ...newExpense, value: maskCurrency(e.target.value) })}
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
                                    <td style={{ padding: '8px 12px' }}>{formatCurrency(unmaskCurrency(ded.value))}</td>
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
                                <td style={{ padding: '8px 12px' }} colSpan={2}>{formatCurrency(totalDeductions)}</td>
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
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            value={newDeduction.value}
                            onChange={e => setNewDeduction({ ...newDeduction, value: maskCurrency(e.target.value) })}
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
                                            <td style={{ padding: '8px 12px' }}>{formatCurrency(unmaskCurrency(inv.value))}</td>
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
                                    type="text"
                                    className="form-control"
                                    placeholder="R$ 0,00"
                                    value={newInvestment.value}
                                    onChange={e => setNewInvestment({ ...newInvestment, value: maskCurrency(e.target.value) })}
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
                                        value: newInvestment.value
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

            {/* ── Observações Adicionais ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '28px', marginBottom: '12px' }}>Observações Adicionais</h3>
            <div className="form-group">
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                    Utilize este espaço para registrar informações relevantes que queira acrescentar ao relatório (ex: ajuda de terceiros, vulnerabilidades específicas).
                </p>
                <textarea
                    className="form-control"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Opcional..."
                    value={data.demand?.observations || ''}
                    onChange={e => updateDemand('observations', e.target.value)}
                />
            </div>

            {/* ── Contexto da Demanda ── */}
            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '28px', marginBottom: '16px' }}>4. Contexto da Demanda</h3>

            <div className="form-group">
                <label className="form-label">Tipo de Demanda</label>
                <select className="form-control" value={data.demand?.type} onChange={e => updateDemand('type', e.target.value)}>
                    <option value="">Selecione...</option>
                    {Object.values(TIPOS_DEMANDA).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Objeto / Pedido</label>
                <input
                    className="form-control"
                    placeholder="Ex: Auxílio-Doença, Medicamento oncológico, Absolvição"
                    value={data.demand?.object}
                    onChange={e => updateDemand('object', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Nº Processo (Se houver)</label>
                <input
                    className="form-control"
                    placeholder="Opcional"
                    value={data.demand?.processNumber}
                    onChange={e => updateDemand('processNumber', e.target.value)}
                />
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>5. Declarações Finais</h3>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#f1f8e9',
                    borderRadius: '6px',
                    border: '1px solid #c5e1a5',
                    cursor: 'pointer',
                    color: '#33691e',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                }}>
                    <input
                        type="checkbox"
                        checked={data.demand?.declarations?.truthfulness}
                        onChange={e => updateDeclaration('truthfulness', e.target.checked)}
                    />
                    Atesto a veracidade das informações prestadas.
                </label>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#f1f8e9',
                    borderRadius: '6px',
                    border: '1px solid #c5e1a5',
                    cursor: 'pointer',
                    color: '#33691e',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                }}>
                    <input
                        type="checkbox"
                        checked={data.demand?.declarations?.hyposufficiency}
                        onChange={e => updateDeclaration('hyposufficiency', e.target.checked)}
                    />
                    Declaro hipossuficiência econômica para fins de assistência.
                </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/2')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext} style={{ background: '#0d47a1' }}>
                    Finalizar Pré-Avaliação
                </button>
            </div>
        </div>
    );
};

export default FinancialStep;
