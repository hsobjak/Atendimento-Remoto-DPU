import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { ESTADO_CIVIL } from '../../utils/constants';
import { maskCPF } from '../../utils/masks';

const PersonalQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const updatePersonal = (field, value) => {
        updateData('personal', { [field]: value });
    };

    const handleNext = () => {
        if (!data.personal.name || !data.personal.cpf || !data.personal.age) {
            alert("Nome, CPF e Idade são campos obrigatórios.");
            return;
        }

        // Auto-sync applicant to family members if "Não, requerente próprio"
        const members = [...(data.family.members || [])];
        const reqIdx = members.findIndex(m => m.kinship === 'Requerente (Próprio)');

        if (reqIdx > -1) {
            members[reqIdx] = { ...members[reqIdx], name: data.personal.name, cpf: data.personal.cpf, age: data.personal.age || '' };
        } else {
            members.unshift({
                name: data.personal.name,
                cpf: data.personal.cpf,
                kinship: 'Requerente (Próprio)',
                age: data.personal.age || '',
                incomeSource: 'Sem Renda',
                incomeValue: '0'
            });
        }
        updateData('family', { members });

        navigate('/wizard/address');
    };

    return (
        <div className="card">
            <h2>Vamos começar pelos seus dados básicos</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Conte para nós como você se chama e seus documentos de identificação essenciais.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>Qual o seu Nome Completo? *</label>
                <input 
                    className="form-control" 
                    placeholder="Seu nome inteiro"
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                    value={data.personal.name || ''} 
                    onChange={e => updatePersonal('name', e.target.value)} 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>E o seu CPF? *</label>
                    <input 
                        className="form-control" 
                        placeholder="000.000.000-00" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.cpf || ''} 
                        onChange={e => updatePersonal('cpf', maskCPF(e.target.value))} 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Qual o número do seu RG? (Opcional)</label>
                    <input 
                        className="form-control" 
                        placeholder="Somente os números"
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.rg || ''} 
                        onChange={e => updatePersonal('rg', e.target.value)} 
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Qual a sua Data de Nascimento?</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.birthDate || ''} 
                        onChange={e => updatePersonal('birthDate', e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Idade *</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Ex: 35"
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.age || ''} 
                        onChange={e => updatePersonal('age', e.target.value)} 
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Qual o seu Estado Civil?</label>
                    <select 
                        className="form-control" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.civilStatus || ''} 
                        onChange={e => updatePersonal('civilStatus', e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {ESTADO_CIVIL.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Sua profissão principal (Opcional)</label>
                    <input 
                        className="form-control" 
                        placeholder="Ex: Do lar, Pedreiro, Estudante..."
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.profession || ''} 
                        onChange={e => updatePersonal('profession', e.target.value)} 
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default PersonalQuestions;
