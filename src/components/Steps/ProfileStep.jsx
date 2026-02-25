import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { ESTADO_CIVIL } from '../../utils/constants';

const ProfileStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const handleNext = () => {
        // Basic validation
        if (!data.personal.name || !data.personal.cpf || !data.personal.street || !data.personal.number || !data.personal.neighborhood || !data.personal.zipCode) {
            alert("Preencha todos os campos obrigatórios: Nome, CPF, Logradouro, Nº, Bairro e CEP.");
            return;
        }
        navigate('/step/2');
    };

    const updatePersonal = (field, value) => {
        updateData('personal', { [field]: value });
    };

    return (
        <div className="card">
            <h2>1. Cadastro Inicial</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Dados pessoais, endereço, contato e perfil prioritário do requerente.
            </p>

            {/* Identificação */}
            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Identificação</h3>

            <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input className="form-control" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">CPF *</label>
                    <input className="form-control" placeholder="000.000.000-00" value={data.personal.cpf} onChange={e => updatePersonal('cpf', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">RG</label>
                    <input className="form-control" value={data.personal.rg} onChange={e => updatePersonal('rg', e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">Nascimento</label>
                    <input type="date" className="form-control" value={data.personal.birthDate} onChange={e => updatePersonal('birthDate', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Estado Civil</label>
                    <select className="form-control" value={data.personal.civilStatus} onChange={e => updatePersonal('civilStatus', e.target.value)}>
                        <option value="">Selecione...</option>
                        {ESTADO_CIVIL.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Profissão</label>
                <input className="form-control" value={data.personal.profession} onChange={e => updatePersonal('profession', e.target.value)} />
            </div>

            {/* Endereço Separado */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">Logradouro (Rua/Av) *</label>
                    <input className="form-control" placeholder="Rua..." value={data.personal.street} onChange={e => updatePersonal('street', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Nº *</label>
                    <input className="form-control" placeholder="S/N" value={data.personal.number} onChange={e => updatePersonal('number', e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">Bairro *</label>
                    <input className="form-control" value={data.personal.neighborhood} onChange={e => updatePersonal('neighborhood', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">CEP *</label>
                    <input className="form-control" placeholder="00000-000" value={data.personal.zipCode} onChange={e => updatePersonal('zipCode', e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Complemento</label>
                <input className="form-control" placeholder="Apto, Bloco..." value={data.personal.complement} onChange={e => updatePersonal('complement', e.target.value)} />
            </div>


            <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" placeholder="(00) 00000-0000" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
            </div>

            {/* Representação */}
            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Representação e Prioridades</h3>

            <div className="form-group">
                <label className="form-label">Representado por terceiro?</label>
                <select className="form-control" value={data.personal.isRepresented} onChange={e => updatePersonal('isRepresented', e.target.value)}>
                    <option value="nao">Não, requerente próprio</option>
                    <option value="sim">Sim, representado</option>
                </select>
            </div>

            {data.personal.isRepresented === 'sim' && (
                <div className="form-group animate-fade-in">
                    <label className="form-label">Nome Representante</label>
                    <input className="form-control" value={data.personal.representativeName} onChange={e => updatePersonal('representativeName', e.target.value)} />
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                {[
                    { key: 'elderly', label: 'Idoso (60+)' },
                    { key: 'pwd', label: 'Pessoa com Deficiência' },
                    { key: 'illness', label: 'Doença Grave' },
                    { key: 'urgency', label: 'Urgência' }
                ].map(p => (
                    <label key={p.key} style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid #ddd' }}>
                        <input
                            type="checkbox"
                            checked={data.personal.priorities[p.key]}
                            onChange={e => updatePersonal('priorities', { ...data.personal.priorities, [p.key]: e.target.checked })}
                        />
                        {p.label}
                    </label>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button className="btn-primary" onClick={handleNext}>Próximo Passo</button>
            </div>
        </div>
    );
};

export default ProfileStep;
