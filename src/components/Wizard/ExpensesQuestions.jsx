import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { maskCurrency, unmaskCurrency } from '../../utils/masks';
import { formatCurrency } from '../../utils/businessRules';
import { Trash2, Plus } from 'lucide-react';

const ExpensesQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    // Local state para despesas extraordinárias e personalizadas
    const [newDeduction, setNewDeduction] = useState({ description: '', value: '' });
    const [newCustomExpense, setNewCustomExpense] = useState({ description: '', value: '' });

    const updateExpense = (field, value) => {
        updateData('financial', {
            expenses: { ...data.financial.expenses, [field]: value }
        });
    };

    const addCustomExpense = () => {
        if (!newCustomExpense.description || !newCustomExpense.value) {
            alert('Por favor, informe do que se trata o custo e o valor.');
            return;
        }
        const updated = [...(data.financial.customExpenses || []), {
            description: newCustomExpense.description,
            value: newCustomExpense.value
        }];
        updateData('financial', { customExpenses: updated });
        setNewCustomExpense({ description: '', value: '' });
    };

    const removeCustomExpense = (index) => {
        const updated = (data.financial.customExpenses || []).filter((_, i) => i !== index);
        updateData('financial', { customExpenses: updated });
    };

    const addDeduction = () => {
        if (!newDeduction.description || !newDeduction.value) {
            alert('Por favor, informe do que se trata o custo e o valor.');
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

    const handleNext = () => {
        navigate('/wizard/assets');
    };

    return (
        <div className="card">
            <h2>Quais são os gastos fixos da casa?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Coloque aqui o valor aproximado do que vocês gastam todo mês.
                Se não tiver conta de gás ou água separada, pode deixar em branco.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {[
                    { label: 'Aluguel / Prestação da casa', key: 'rent' },
                    { label: 'Conta de Água', key: 'water' },
                    { label: 'Conta de Luz', key: 'light' },
                    { label: 'Mercado / Alimentação', key: 'food' },
                    { label: 'Saúde / Remédios de uso contínuo', key: 'health' },
                    { label: 'Passagem / Transporte', key: 'transport' }
                ].map((item) => (
                    <div className="form-group" key={item.key}>
                        <label className="form-label">{item.label}</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            style={{ padding: '12px', fontSize: '1.1rem' }}
                            value={maskCurrency(data.financial?.expenses?.[item.key] || '')}
                            onChange={(e) => updateExpense(item.key, maskCurrency(e.target.value))}
                        />
                    </div>
                ))}
            </div>

            {/* Lista de gastos extras inseridos */}
            {(data.financial.customExpenses || []).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    {(data.financial.customExpenses || []).map((exp, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '8px', alignItems: 'center' }}>
                            <div>
                                <strong style={{ color: '#444' }}>{exp.description}</strong><br/>
                                <span style={{ color: '#555' }}>R$ {exp.value}</span>
                            </div>
                            <button onClick={() => removeCustomExpense(idx)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Form para adicionar novos gastos básicos */}
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc', marginBottom: '40px' }}>
                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px', fontWeight: 'bold' }}>+ Adicionar outro gasto fixo</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '16px', alignItems: 'flex-end' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Descrição (Ex: Internet, Gás)</label>
                        <input
                            className="form-control"
                            placeholder="Do que se trata?"
                            value={newCustomExpense.description}
                            onChange={e => setNewCustomExpense({ ...newCustomExpense, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor Mensal</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            value={newCustomExpense.value}
                            onChange={e => setNewCustomExpense({ ...newCustomExpense, value: maskCurrency(e.target.value) })}
                        />
                    </div>
                    <button className="btn-secondary" onClick={addCustomExpense} style={{ height: '44px' }}>
                        Adicionar
                    </button>
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '30px 0' }} />

            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#004d40' }}>Gastos Extraordinários / Pensão</h3>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                Existe algum outro gasto alto na família que comprometa a renda? (Exemplo: Pensão Alimentícia que você paga, fraldas especiais, etc).
            </p>

            {(data.financial.deductionItems || []).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    {(data.financial.deductionItems || []).map((ded, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#ffebee', borderRadius: '6px', marginBottom: '8px', alignItems: 'center' }}>
                            <div>
                                <strong style={{ color: '#c62828' }}>{ded.description}</strong><br/>
                                <span style={{ color: '#555' }}>R$ {ded.value}</span>
                            </div>
                            <button onClick={() => removeDeduction(idx)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '16px', alignItems: 'flex-end', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                <div>
                    <label className="form-label">O que é este gasto?</label>
                    <input
                        className="form-control"
                        placeholder="Ex: Pensão Alimentícia"
                        style={{ padding: '12px' }}
                        value={newDeduction.description}
                        onChange={e => setNewDeduction({ ...newDeduction, description: e.target.value })}
                    />
                </div>
                <div>
                    <label className="form-label">Valor Mês</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="R$ 0,00"
                        style={{ padding: '12px' }}
                        value={newDeduction.value}
                        onChange={e => setNewDeduction({ ...newDeduction, value: maskCurrency(e.target.value) })}
                    />
                </div>
                <button className="btn-secondary" onClick={addDeduction} style={{ padding: '12px 20px', height: '48px' }}>
                    Adicionar
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/income')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default ExpensesQuestions;
