import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { checkEligibility } from '../../utils/businessRules';
import { CheckCircle, Loader } from 'lucide-react';

const ResultStep = () => {
    const { data } = useAssessment();
    const hasSaved = useRef(false);
    const [saveStatus, setSaveStatus] = useState('saving'); // 'saving', 'success', 'error'

    const result = useMemo(() => checkEligibility(data), [data]);

    useEffect(() => {
        const saveToDatabase = async () => {
            if (hasSaved.current || !data.personal?.name) return;
            hasSaved.current = true;

            try {
                const { supabase } = await import('../../utils/supabaseClient');
                const { error } = await supabase
                    .from('assessments')
                    .insert([{
                        applicant_name: data.personal.name,
                        cpf: data.personal.cpf || null,
                        demand_type: data.demand?.type || null,
                        eligibility_status: result.status,
                        full_data: data,
                        analysis_result: result
                    }]);

                if (error) throw error;
                setSaveStatus('success');
            } catch (err) {
                console.error("Erro ao salvar no banco:", err);
                setSaveStatus('error');
            }
        };

        saveToDatabase();
    }, [data, result]);

    const handleRestart = () => {
        window.location.href = '/';
    };

    if (saveStatus === 'saving') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <Loader size={56} color="#004d40" style={{ animation: 'spin 1.2s linear infinite' }} />
                    <h2 style={{ fontSize: '1.6rem', color: '#333' }}>Enviando suas informações...</h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '480px' }}>
                        Por favor, aguarde. Estamos registrando os dados fornecidos.
                    </p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (saveStatus === 'error') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: '#ffebee',
                    marginBottom: 24,
                }}>
                    <span style={{ fontSize: 48 }}>⚠️</span>
                </div>
                <h2 style={{ fontSize: '1.8rem', color: '#c62828', marginBottom: '12px' }}>
                    Erro ao enviar
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px' }}>
                    Ocorreu um problema ao registrar suas informações. Por favor, informe ao atendente da Defensoria para que ele possa auxiliá-lo.
                </p>
                <button
                    className="btn-secondary"
                    onClick={handleRestart}
                    style={{ fontSize: '1rem', padding: '12px 28px' }}
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    // saveStatus === 'success'
    return (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            {/* Ícone de sucesso */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 108,
                height: 108,
                borderRadius: '50%',
                background: '#e0f2f1',
                marginBottom: 28,
            }}>
                <CheckCircle size={64} color="#004d40" />
            </div>

            <h2 style={{ fontSize: '2rem', color: '#004d40', marginBottom: '12px' }}>
                Formulário enviado com sucesso!
            </h2>

            {data.personal?.name && (
                <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '8px' }}>
                    Obrigado, <strong>{data.personal.name}</strong>.
                </p>
            )}

            <p style={{ color: '#666', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 16px' }}>
                Suas informações foram registradas e serão analisadas pela equipe da Defensoria Pública da União.
            </p>

            <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 40px' }}>
                Em breve você será contactado para mais informações sobre o seu atendimento. Não é necessário fazer mais nada agora.
            </p>

            <div style={{
                background: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px 24px',
                display: 'inline-block',
                maxWidth: '480px',
                marginBottom: '40px',
            }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>
                    AVISO: O resultado apresentado será analisado internamente pela Defensoria Pública da União. Esta tela não substitui a análise jurídica feita pelos defensores públicos.
                </p>
            </div>

            <div>
                <button
                    className="btn-secondary"
                    onClick={handleRestart}
                    style={{ fontSize: '1rem', padding: '12px 28px' }}
                >
                    Novo Atendimento
                </button>
            </div>
        </div>
    );
};

export default ResultStep;
