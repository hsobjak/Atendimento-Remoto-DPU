import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { checkEligibility } from '../../utils/businessRules';
import { CheckCircle, Loader, AlertTriangle, RefreshCcw } from 'lucide-react';

const ResultStep = () => {
    const { data } = useAssessment();
    const hasSaved = useRef(false);
    const [saveStatus, setSaveStatus] = useState('saving'); // 'saving', 'success', 'error'
    const [errorDetail, setErrorDetail] = useState('');

    const result = useMemo(() => checkEligibility(data), [data]);

    useEffect(() => {
        const saveToDatabase = async () => {
            if (hasSaved.current || !data.personal?.name) return;
            hasSaved.current = true;

            console.group("[Supabase Submission Diagnostic]");
            console.log("1. Data validation check:", !!data.personal?.name);
            
            try {
                const { supabase } = await import('../../utils/supabaseClient');
                
                const envUrl = import.meta.env.VITE_SUPABASE_URL;
                const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                
                console.log("2. Environment Variables:", {
                    url: envUrl ? "PRESENT" : "MISSING",
                    key: envKey ? "PRESENT" : "MISSING"
                });

                if (!envUrl || !envKey) {
                    throw new Error("Configuração do Supabase ausente (.env)");
                }

                // Deep copy to ensure serializability
                const cleanData = JSON.parse(JSON.stringify(data));
                console.log("3. Payload prepared:", cleanData.personal.name);

                const { error, status, statusText } = await supabase
                    .from('assessments')
                    .insert([{
                        applicant_name: cleanData.personal.name,
                        cpf: cleanData.personal.cpf || null,
                        demand_type: cleanData.demand?.type || null,
                        eligibility_status: result.status,
                        full_data: cleanData,
                        analysis_result: result
                    }]);

                console.log("4. Response status:", status, statusText);

                if (error) {
                    console.error("5. Supabase Error:", error);
                    setErrorDetail(`${error.code}: ${error.message}`);
                    throw error;
                }
                
                console.log("6. Submission successful!");
                setSaveStatus('success');
            } catch (err) {
                console.error("FATAL ERROR during submission:", err);
                setErrorDetail(err.message || "Erro desconhecido na rede ou servidor.");
                setSaveStatus('error');
            } finally {
                console.groupEnd();
            }
        };

        saveToDatabase();
    }, [data, result]);

    const handleRestart = () => {
        window.location.href = '/';
    };

    if (saveStatus === 'saving') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div className="spinner-container">
                        <Loader size={64} color="var(--color-primary)" className="spinning-icon" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Registrando sua solicitação...</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '480px' }}>
                        Por favor, não feche esta janela. Estamos salvando suas informações nos sistemas da Defensoria.
                    </p>
                </div>
                <style>{`
                    .spinning-icon { animation: spin 2s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spinner-container { 
                        background: rgba(0, 59, 40, 0.05);
                        padding: 30px;
                        border-radius: 50%;
                    }
                `}</style>
            </div>
        );
    }

    if (saveStatus === 'error') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px', borderTop: '6px solid var(--color-accent)' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: '#FFF5F5',
                    marginBottom: 24,
                    color: 'var(--color-accent)'
                }}>
                    <AlertTriangle size={54} />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#C53030', marginBottom: '16px' }}>
                    Não foi possível enviar
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.15rem', maxWidth: '550px', margin: '0 auto 12px' }}>
                    Ocorreu um problema técnico ao tentar salvar seus dados.
                </p>
                <div style={{ 
                    background: '#F7FAFC', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    color: '#718096',
                    fontFamily: 'monospace',
                    maxWidth: '400px',
                    margin: '0 auto 32px',
                    border: '1px solid #E2E8F0'
                }}>
                    Erro: {errorDetail}
                </div>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={() => window.location.reload()}>
                        <RefreshCcw size={18} /> Tentar Novamente
                    </button>
                    <button className="btn-primary" onClick={handleRestart}>
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    // saveStatus === 'success'
    return (
        <div className="card" style={{ textAlign: 'center', padding: '70px 40px', borderTop: '6px solid #48BB78' }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: '#F0FFF4',
                marginBottom: 32,
                color: '#38A169'
            }}>
                <CheckCircle size={68} />
            </div>

            <h2 style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '16px' }}>
                Formulário Enviado!
            </h2>

            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginBottom: '8px', fontWeight: 500 }}>
                {data.personal?.name ? `Tudo certo, ${data.personal.name.split(' ')[0]}!` : 'Tudo certo!'}
            </p>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 32px', lineHeight: 1.7 }}>
                Suas informações foram recebidas com sucesso e já estão disponíveis para análise pela equipe da <strong>Defensoria Pública da União</strong>.
            </p>

            <div style={{
                background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                display: 'inline-block',
                maxWidth: '550px',
                marginBottom: '40px',
                textAlign: 'left'
            }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#D69E2E" /> Próximos Passos:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#4A5568', fontSize: '0.95rem' }}>
                    <li>Aguarde o contato de um de nossos atendentes via telefone ou WhatsApp.</li>
                    <li>Não é necessário preencher o formulário novamente.</li>
                    <li>Tenha seus documentos originais em mãos para a futura análise jurídica.</li>
                </ul>
            </div>

            <div>
                <button className="btn-secondary" onClick={handleRestart} style={{ fontSize: '1rem', padding: '14px 32px' }}>
                    Finalizar Atendimento
                </button>
            </div>
        </div>
    );
};

export default ResultStep;
