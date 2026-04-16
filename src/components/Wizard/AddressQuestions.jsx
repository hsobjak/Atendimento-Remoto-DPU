import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { maskCEP, maskPhone } from '../../utils/masks';

const AddressQuestions = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();

    const handleCEP = async (cep) => {
        const masked = maskCEP(cep);
        updatePersonal('zipCode', masked);

        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
                const cepData = await response.json();
                if (!cepData.erro) {
                    updateData('personal', {
                        ...data.personal,
                        street: cepData.logradouro || '',
                        neighborhood: cepData.bairro || '',
                        complement: cepData.complemento || '',
                        zipCode: masked
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const updatePersonal = (field, value) => {
        updateData('personal', { [field]: value });
    };

    const handleNext = () => {
        if (!data.personal.street || !data.personal.number || !data.personal.neighborhood || !data.personal.zipCode) {
            alert("Logradouro, Número, Bairro e CEP são obrigatórios.");
            return;
        }
        navigate('/wizard/priorities');
    };

    return (
        <div className="card">
            <h2>Onde você mora?</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Precisamos do seu endereço completo para qualquer correspondência ou visita domiciliar caso seja necessário.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>CEP *</label>
                    <input 
                        className="form-control" 
                        placeholder="00000-000" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.zipCode || ''} 
                        onChange={e => handleCEP(e.target.value)} 
                    />
                    <small style={{ color: '#004d40' }}>Dica: Ao digitar o CEP, nós tentamos preencher a rua e bairro pra você!</small>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Nome da Rua, Avenida ou Logradouro *</label>
                    <input 
                        className="form-control" 
                        placeholder="Rua das Flores..." 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.street || ''} 
                        onChange={e => updatePersonal('street', e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Número *</label>
                    <input 
                        className="form-control" 
                        placeholder="123 ou S/N" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.number || ''} 
                        onChange={e => updatePersonal('number', e.target.value)} 
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Bairro *</label>
                    <input 
                        className="form-control" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.neighborhood || ''} 
                        onChange={e => updatePersonal('neighborhood', e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Complemento (Apto, Casa 2, etc)</label>
                    <input 
                        className="form-control" 
                        placeholder="Opcional" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.complement || ''} 
                        onChange={e => updatePersonal('complement', e.target.value)} 
                    />
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '30px 0' }} />

            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>E como podemos te contatar?</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Celular/Telefone (WhatsApp) *</label>
                    <input 
                        className="form-control" 
                        placeholder="(00) 00000-0000" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.phone || ''} 
                        onChange={e => updatePersonal('phone', maskPhone(e.target.value))} 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1.1rem' }}>Telefone de Recado</label>
                    <input 
                        className="form-control" 
                        placeholder="(Opcional)" 
                        style={{ fontSize: '1.1rem', padding: '12px' }}
                        value={data.personal.alternativePhone || ''} 
                        onChange={e => updatePersonal('alternativePhone', maskPhone(e.target.value))} 
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>E-mail</label>
                <input 
                    type="email"
                    className="form-control" 
                    placeholder="Seu e-mail (Opcional)" 
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                    value={data.personal.email || ''} 
                    onChange={e => updatePersonal('email', e.target.value)} 
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-secondary" onClick={() => navigate('/wizard/personal')}>Voltar</button>
                <button className="btn-primary" onClick={handleNext}>Continuar</button>
            </div>
        </div>
    );
};

export default AddressQuestions;
