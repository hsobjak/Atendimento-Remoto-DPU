import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { PARENTESCO } from '../../utils/constants';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const FamilyQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const [newMember, setNewMember] = useState({ name: '', kinship: '', age: '' });
    const [editIndex, setEditIndex] = useState(null);

    const handleAddMember = () => {
        if (!newMember.name || !newMember.kinship) {
            alert("Informe o Nome e o Parentesco do familiar.");
            return;
        }

        const memberData = {
            ...newMember,
            incomeSource: 'Sem Renda',
            benefitType: '',
            incomeValue: '0',
            otherIncomes: []
        };

        let updatedMembers;
        if (editIndex !== null) {
            updatedMembers = [...data.family.members];
            updatedMembers[editIndex] = { ...updatedMembers[editIndex], ...newMember };
            setEditIndex(null);
        } else {
            updatedMembers = [...data.family.members, memberData];
        }

        updateData('family', { members: updatedMembers });
        setNewMember({ name: '', kinship: '', age: '' });
    };

    const handleEditMember = (index) => {
        setEditIndex(index);
        const member = data.family.members[index];
        setNewMember({ name: member.name, kinship: member.kinship, age: member.age || '' });
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setNewMember({ name: '', kinship: '', age: '' });
    };

    const removeMember = (index) => {
        // Prevent removing the applicant
        if (data.family.members[index].kinship === 'Requerente (Próprio)') {
            alert("Você não pode remover a si mesmo da família.");
            return;
        }
        const updatedMembers = data.family.members.filter((_, i) => i !== index);
        updateData('family', { members: updatedMembers });
    };

    const handleNext = () => {
        navigate('/wizard/income');
    };

    return (
        <div className="card">
            <h2>Quem mora na mesma casa que você?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Precisamos saber quantas pessoas compõem a sua família que dividem o mesmo teto e as mesmas despesas.
                <br/><strong>Você já está na lista abaixo.</strong> Adicione os outros que moram com você, se houver.
            </p>

            {/* List of members */}
            <div style={{ marginBottom: '30px' }}>
                {(data.family.members || []).map((m, idx) => (
                    <div key={idx} style={{ 
                        background: editIndex === idx ? '#fff3cd' : '#f5f5f5', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: m.kinship === 'Requerente (Próprio)' ? '4px solid #004d40' : '4px solid #aaa'
                    }}>
                        <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{m.name}</span>
                            <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666', background: '#e0e0e0', padding: '4px 8px', borderRadius: '12px' }}>
                                {m.kinship}
                            </span>
                            {m.age && <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>({m.age} anos)</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleEditMember(idx)} style={{ background: 'none', border: 'none', color: '#004d40', cursor: 'pointer' }}><Pencil size={20} /></button>
                            {m.kinship !== 'Requerente (Próprio)' && (
                                <button onClick={() => removeMember(idx)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}><Trash2 size={20} /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Form to add new member */}
            <div style={{ background: '#e8f5e9', padding: '24px', borderRadius: '8px', border: '1px dashed #4caf50' }}>
                <h4 style={{ marginBottom: '16px', color: '#2e7d32' }}>
                    {editIndex !== null ? 'Alterar pessoa' : '+ Adicionar pessoa que mora com você'}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '20px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Nome Completo do Familiar</label>
                        <input className="form-control" style={{ padding: '10px' }} value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="form-label">O que essa pessoa é sua?</label>
                        <select className="form-control" style={{ padding: '10px' }} value={newMember.kinship} onChange={e => setNewMember({ ...newMember, kinship: e.target.value })}>
                            <option value="">Selecione...</option>
                            {PARENTESCO.filter(p => p !== 'Requerente (Próprio)').map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '16px' }}>
                    <div style={{ maxWidth: '200px' }}>
                        <label className="form-label">Idade (Quantos anos?)</label>
                        <input type="number" className="form-control" style={{ padding: '10px' }} value={newMember.age} onChange={e => setNewMember({ ...newMember, age: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ background: '#4caf50', color: 'white', border: 'none' }} onClick={handleAddMember}>
                        {editIndex !== null ? 'Salvar Edição' : 'Adicionar Familiar'}
                    </button>
                    {editIndex !== null && (
                        <button className="btn-secondary" onClick={handleCancelEdit}>
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/priorities')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Já adicionei todos, Continuar</button>
            </div>
        </div>
    );
};

export default FamilyQuestions;
