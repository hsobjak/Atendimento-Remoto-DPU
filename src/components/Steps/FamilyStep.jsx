import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { PARENTESCO } from '../../utils/constants';
import { Plus, Trash2, Pencil, X } from 'lucide-react';


import { maskCPF, maskCurrency, unmaskCurrency } from '../../utils/masks';

import { formatCurrency } from '../../utils/businessRules';

const FamilyStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    // Local state for new member form
    const [newMember, setNewMember] = useState({
        name: '', kinship: '', age: '', cpf: '',
        incomeSource: 'Sem Renda', benefitType: '', incomeValue: '0',
        otherIncomes: []
    });
    const [editIndex, setEditIndex] = useState(null);

    // Auto-edit applicant on mount if present
    React.useEffect(() => {
        const members = data.family.members || [];
        const reqIdx = members.findIndex(m => m.kinship === 'Requerente (Próprio)');
        
        if (reqIdx > -1 && members[reqIdx].incomeValue === '0' && !members[reqIdx].age) {
            setEditIndex(reqIdx);
            setNewMember({
                ...members[reqIdx],
                incomeValue: maskCurrency(members[reqIdx].incomeValue)
            });
        }
    }, []); // Run only once on mount

    const handleAddMember = () => {
        if (!newMember.name || !newMember.kinship) {
            alert("Informe Nome e Parentesco.");
            return;
        }
        const member = {
            ...newMember,
            incomeValue: newMember.incomeValue
        };

        let updatedMembers;
        if (editIndex !== null) {
            updatedMembers = [...data.family.members];
            updatedMembers[editIndex] = member;
            setEditIndex(null);
        } else {
            updatedMembers = [...data.family.members, member];
        }

        updateData('family', { members: updatedMembers });

        // Reset form
        setNewMember({ 
            name: '', kinship: '', age: '', cpf: '',
            incomeSource: 'Sem Renda', benefitType: '', incomeValue: '0',
            otherIncomes: []
        });
    };

    const handleEditMember = (index) => {
        setEditIndex(index);
        const member = data.family.members[index];
        setNewMember({
            ...member,
            incomeValue: maskCurrency(member.incomeValue || '0'),
            otherIncomes: (member.otherIncomes || []).map(inc => ({
                ...inc,
                incomeValue: maskCurrency(inc.incomeValue || '0')
            }))
        });
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setNewMember({ 
            name: '', kinship: '', age: '', cpf: '',
            incomeSource: 'Sem Renda', benefitType: '', incomeValue: '0',
            otherIncomes: []
        });
    };

    const removeMember = (index) => {
        const updatedMembers = data.family.members.filter((_, i) => i !== index);
        updateData('family', { members: updatedMembers });
    };

    const addOtherIncome = () => {
        setNewMember(prev => ({
            ...prev,
            otherIncomes: [...prev.otherIncomes, { id: Date.now(), incomeSource: 'Sem Renda', benefitType: '', incomeValue: '0' }]
        }));
    };

    const removeOtherIncome = (id) => {
        setNewMember(prev => ({
            ...prev,
            otherIncomes: prev.otherIncomes.filter(inc => inc.id !== id)
        }));
    };

    const updateOtherIncome = (id, field, value) => {
        setNewMember(prev => ({
            ...prev,
            otherIncomes: prev.otherIncomes.map(inc => inc.id === id ? { ...inc, [field]: value } : inc)
        }));
    };

    const handleNext = () => {
        if (data.family.members.length === 0) {
            alert("É obrigatório informar a composição familiar e a renda. Adicione ao menos um membro (o próprio assistido, se for o caso).");
            return;
        }
        navigate('/step/3');
    };

    return (
        <div className="card">
            <h2>2. Núcleo Familiar e Renda</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Adicione os membros e identifique <strong>individualmente</strong> a fonte de renda de cada um.
            </p>

            {/* Formulario Adicionar */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '16px', color: '#444' }}>Composição Familiar</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Nome Completo</label>
                        <input className="form-control" placeholder="Nome do familiar" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="form-label">Parentesco</label>
                        <select className="form-control" value={newMember.kinship} onChange={e => setNewMember({ ...newMember, kinship: e.target.value })}>
                            <option value="">Selecione...</option>
                            {PARENTESCO.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">CPF (Opcional)</label>
                        <input className="form-control" placeholder="000.000.000-00" value={newMember.cpf} onChange={e => setNewMember({ ...newMember, cpf: maskCPF(e.target.value) })} />
                    </div>
                    <div>
                        <label className="form-label">Idade</label>
                        <input type="number" className="form-control" value={newMember.age} onChange={e => setNewMember({ ...newMember, age: e.target.value })} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Origem da Renda</label>
                    <select className="form-control" value={newMember.incomeSource} onChange={e => setNewMember({ ...newMember, incomeSource: e.target.value, benefitType: '' })}>
                        <option value="Sem Renda">Sem Renda</option>
                        <option value="Trabalho Formal">Trabalho Formal (CLT)</option>
                        <option value="Informal/Autônomo">Informal/Autônomo</option>
                        <option value="Benefício Social">Benefício Social</option>
                        <option value="Aposentadoria">Aposentadoria/Pensão</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>

                {/* Campo condicional: tipo de benefício social */}
                {newMember.incomeSource === 'Benefício Social' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Qual benefício?</label>
                        <select
                            className="form-control"
                            value={newMember.benefitType}
                            onChange={e => setNewMember({ ...newMember, benefitType: e.target.value })}
                        >
                            <option value="">Selecione o benefício...</option>
                            <option value="BPC">BPC – Benefício de Prestação Continuada</option>
                            <option value="Bolsa Família">Bolsa Família</option>
                            <option value="Outro">Outro benefício social</option>
                        </select>
                        {(newMember.benefitType === 'BPC' || newMember.benefitType === 'Bolsa Família') && (
                            <div style={{
                                marginTop: '8px',
                                padding: '10px 14px',
                                background: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: '#7d5700'
                            }}>
                                ⚠️ <strong>Atenção:</strong> Este benefício não será contabilizado na renda familiar, conforme portaria.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Valor (R$)</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="R$ 0,00"
                    value={newMember.incomeValue}
                    onChange={e => setNewMember({ ...newMember, incomeValue: maskCurrency(e.target.value) })}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <button 
                    className="btn-secondary" 
                    onClick={addOtherIncome} 
                    style={{ background: 'none', border: 'none', color: '#004d40', fontWeight: 'bold', padding: 0, textDecoration: 'underline' }}
                >
                    + Outras fontes de renda
                </button>
            </div>

            {newMember.otherIncomes.map((inc, idx) => (
                <div key={inc.id} style={{ background: '#f5f5f5', padding: '16px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #004d40', position: 'relative' }}>
                    <button 
                        onClick={() => removeOtherIncome(inc.id)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        Remover
                    </button>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">{idx + 2}ª Origem da Renda</label>
                        <select className="form-control" value={inc.incomeSource} onChange={e => { updateOtherIncome(inc.id, 'incomeSource', e.target.value); updateOtherIncome(inc.id, 'benefitType', ''); }}>
                            <option value="Sem Renda">Sem Renda</option>
                            <option value="Trabalho Formal">Trabalho Formal (CLT)</option>
                            <option value="Informal/Autônomo">Informal/Autônomo</option>
                            <option value="Benefício Social">Benefício Social</option>
                            <option value="Aposentadoria">Aposentadoria/Pensão</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    {inc.incomeSource === 'Benefício Social' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label">Qual benefício?</label>
                            <select
                                className="form-control"
                                value={inc.benefitType}
                                onChange={e => updateOtherIncome(inc.id, 'benefitType', e.target.value)}
                            >
                                <option value="">Selecione o benefício...</option>
                                <option value="BPC">BPC – Benefício de Prestação Continuada</option>
                                <option value="Bolsa Família">Bolsa Família</option>
                                <option value="Outro">Outro benefício social</option>
                            </select>
                            {(inc.benefitType === 'BPC' || inc.benefitType === 'Bolsa Família') && (
                                <div style={{ marginTop: '8px', padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', fontSize: '0.85rem', color: '#7d5700' }}>
                                    ⚠️ <strong>Atenção:</strong> Este benefício não será contabilizado na renda familiar.
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="form-label">Valor (R$)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="R$ 0,00"
                            value={inc.incomeValue}
                            onChange={e => updateOtherIncome(inc.id, 'incomeValue', maskCurrency(e.target.value))}
                        />
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" style={{ flex: 1, borderStyle: editIndex !== null ? 'solid' : 'dashed' }} onClick={handleAddMember}>
                    {editIndex !== null ? <Pencil size={16} style={{ verticalAlign: 'middle' }} /> : <Plus size={16} style={{ verticalAlign: 'middle' }} />}
                    {editIndex !== null ? ' Salvar Alterações' : ' Adicionar Membro'}
                </button>
                {editIndex !== null && (
                    <button className="btn-secondary" style={{ background: '#eee', color: '#666' }} onClick={handleCancelEdit}>
                        <X size={16} style={{ verticalAlign: 'middle' }} /> Cancelar
                    </button>
                )}
            </div>


            {/* Lista de Membros */}
            {data.family.members.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Nome</th>
                                <th style={{ padding: '8px' }}>CPF</th>
                                <th style={{ padding: '8px' }}>Parentesco</th>
                                <th style={{ padding: '8px' }}>Renda</th>
                                <th style={{ padding: '8px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.family.members.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee', background: editIndex === idx ? '#fff3cd' : 'transparent' }}>
                                    <td style={{ padding: '8px' }}>{m.name}</td>
                                    <td style={{ padding: '8px' }}>{m.cpf || '-'}</td>
                                    <td style={{ padding: '8px' }}>{m.kinship}</td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ marginBottom: (m.otherIncomes && m.otherIncomes.length > 0) ? '4px' : '0' }}>
                                            {(m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família')
                                                ? <span style={{ color: '#888', fontStyle: 'italic' }}>{formatCurrency(unmaskCurrency(m.incomeValue))} (desconsiderado)</span>
                                                : formatCurrency(unmaskCurrency(m.incomeValue))
                                            } <span style={{ fontSize: '0.8rem', color: '#666' }}>({m.incomeSource})</span>
                                        </div>
                                        {m.otherIncomes && m.otherIncomes.map((inc, i) => (
                                            <div key={i} style={{ paddingTop: '4px', borderTop: '1px dashed #ddd' }}>
                                                {(inc.benefitType === 'BPC' || inc.benefitType === 'Bolsa Família')
                                                    ? <span style={{ color: '#888', fontStyle: 'italic' }}>{formatCurrency(unmaskCurrency(inc.incomeValue || '0'))} (desconsiderado)</span>
                                                    : formatCurrency(unmaskCurrency(inc.incomeValue || '0'))
                                                } <span style={{ fontSize: '0.8rem', color: '#666' }}>({inc.incomeSource})</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        <button onClick={() => handleEditMember(idx)} style={{ color: '#004d40', background: 'none', marginRight: '8px' }} title="Editar"><Pencil size={16} /></button>
                                        <button onClick={() => removeMember(idx)} style={{ color: '#c62828', background: 'none' }} title="Remover"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Resumo Financeiro */}
            <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '12px', color: '#444' }}>Resumo Financeiro</h4>
                <div className="form-group">
                    <label className="form-label">Renda Familiar Bruta (Soma Automática)</label>
                    <div style={{ background: '#e9ecef', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {formatCurrency(data.totalFamilyIncome)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/1')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Próximo Passo</button>
            </div>
        </div>
    );
};

export default FamilyStep;
