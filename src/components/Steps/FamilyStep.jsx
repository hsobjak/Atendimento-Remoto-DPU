import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { PARENTESCO } from '../../utils/constants';
import { Plus, Trash2 } from 'lucide-react';

const FamilyStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    // Local state for new member form
    const [newMember, setNewMember] = useState({
        name: '', kinship: '', age: '', incomeSource: 'Sem Renda', incomeValue: '0'
    });

    const handleAddMember = () => {
        if (!newMember.name || !newMember.kinship) {
            alert("Informe Nome e Parentesco.");
            return;
        }
        const member = {
            ...newMember,
            incomeValue: parseFloat(newMember.incomeValue) || 0
        };

        const updatedMembers = [...data.family.members, member];
        updateData('family', { members: updatedMembers }); // Context auto-updates totalIncome

        // Reset form
        setNewMember({ name: '', kinship: '', age: '', incomeSource: 'Sem Renda', incomeValue: '0' });
    };

    const removeMember = (index) => {
        const updatedMembers = data.family.members.filter((_, i) => i !== index);
        updateData('family', { members: updatedMembers });
    };

    const handleNext = () => {
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Idade</label>
                        <input type="number" className="form-control" value={newMember.age} onChange={e => setNewMember({ ...newMember, age: e.target.value })} />
                    </div>
                    <div>
                        <label className="form-label">Origem da Renda</label>
                        <select className="form-control" value={newMember.incomeSource} onChange={e => setNewMember({ ...newMember, incomeSource: e.target.value })}>
                            <option value="Sem Renda">Sem Renda</option>
                            <option value="Trabalho Formal">Trabalho Formal (CLT)</option>
                            <option value="Informal/Autônomo">Informal/Autônomo</option>
                            <option value="Benefício Social (BPC/Bolsa Família)">Benefício Social</option>
                            <option value="Aposentadoria">Aposentadoria/Pensão</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Valor (R$)</label>
                    <input type="number" className="form-control" value={newMember.incomeValue} onChange={e => setNewMember({ ...newMember, incomeValue: e.target.value })} />
                </div>

                <button className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={handleAddMember}>
                    <Plus size={16} style={{ verticalAlign: 'middle' }} /> Adicionar Membro
                </button>
            </div>

            {/* Lista de Membros */}
            {data.family.members.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Nome</th>
                                <th style={{ padding: '8px' }}>Parentesco</th>
                                <th style={{ padding: '8px' }}>Renda</th>
                                <th style={{ padding: '8px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.family.members.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{m.name}</td>
                                    <td style={{ padding: '8px' }}>{m.kinship}</td>
                                    <td style={{ padding: '8px' }}>R$ {m.incomeValue.toFixed(2)}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        <button onClick={() => removeMember(idx)} style={{ color: '#c62828', background: 'none' }}><Trash2 size={16} /></button>
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
                        R$ {data.totalFamilyIncome?.toFixed(2) || '0.00'}
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
