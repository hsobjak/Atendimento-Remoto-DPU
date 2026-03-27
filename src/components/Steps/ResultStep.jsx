import React, { useMemo } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { checkEligibility } from '../../utils/businessRules';
import { generatePDF } from '../../utils/pdfGenerator';
import { CheckCircle, XCircle, AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultStep = () => {
    const { data } = useAssessment();
    const navigate = useNavigate();

    // Safety check if accessed directly without data
    const result = useMemo(() => checkEligibility(data), [data]);

    const handleRestart = () => {
        if (confirm('Deseja iniciar um novo atendimento? Todos os dados atuais serão perdidos.')) {
            window.location.href = '/';
        }
    };

    const getStatusIcon = () => {
        if (result.status === 'ELIGIBLE_AUTOMATIC') return <CheckCircle size={64} color="#004d40" />;
        if (result.status === 'NOT_ELIGIBLE') return <XCircle size={64} color="#c62828" />;
        return <AlertTriangle size={64} color="#f9a825" />;
    };

    const getStatusColor = () => {
        if (result.status === 'ELIGIBLE_AUTOMATIC') return '#e0f2f1';
        if (result.status === 'NOT_ELIGIBLE') return '#ffebee';
        return '#fffde7';
    };

    return (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
                {getStatusIcon()}
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#333' }}>{result.message}</h2>
            {data.personal?.name && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Requerente: {data.personal.name}</p>}

            <div style={{
                background: getStatusColor(),
                padding: '20px',
                borderRadius: '8px',
                margin: '20px auto',
                maxWidth: '600px',
                border: '1px solid rgba(0,0,0,0.1)'
            }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                    <strong>Justificativa:</strong> {result.justification}
                </p>
                {result.appliedArticles.length > 0 && (
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>
                        <strong>Fundamentação:</strong> {result.appliedArticles.join(', ')}
                    </p>
                )}
                {result.alerts.length > 0 && (
                    <div style={{ marginTop: '12px', textAlign: 'left' }}>
                        <strong>Alertas:</strong>
                        <ul style={{ marginLeft: '20px' }}>
                            {result.alerts.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Quadro do Artigo 2º */}
            {result.metCriteria && (
                <div style={{
                    margin: '20px auto',
                    maxWidth: '800px',
                    textAlign: 'left',
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '10px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
                        Enquadramento - Art. 2º da Resolução CSDPU nº 240/2025
                    </h3>
                    
                    <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '16px' }}>
                        {result.metCriteriaList && result.metCriteriaList.length > 0 
                            ? `Foram considerados atendidos os incisos: ${result.metCriteriaList.join(', ')}.`
                            : `Nenhum dos incisos foi atingido.`
                        }
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', width: '70%' }}>Critérios do Art. 2º</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '30%' }}>Situação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'I', text: `Inciso I - Renda familiar total até ${data.demand?.type === 'Cível - Saúde (Medicamentos/Tratamento)' ? '5' : '2'} salário(s)-mínimo(s)` },
                                    { id: 'II', text: `Inciso II - Renda per capita até ${data.demand?.type === 'Cível - Saúde (Medicamentos/Tratamento)' ? '1' : '1/2'} salário-mínimo` },
                                    { id: 'III', text: "Inciso III - Requerente titular do Bolsa Família" },
                                    { id: 'IV', text: "Inciso IV - Requerente titular do BPC/LOAS" },
                                    { id: 'V', text: "Inciso V - Requerente idoso(a) com renda previdenciária de até 1 SM" }
                                ].map(cr => (
                                    <tr key={cr.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', color: '#444' }}>{cr.text}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: result.metCriteria[cr.id] ? '#2e7d32' : '#c62828' }}>
                                            {result.metCriteria[cr.id] ? 'Atende aos Critérios' : 'Não atende aos Critérios'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/3')} style={{ borderColor: '#666', color: '#666' }}>
                    Voltar e Editar
                </button>
                <button className="btn-secondary" onClick={handleRestart}>
                    <RotateCcw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Novo Atendimento
                </button>
                <button className="btn-primary" onClick={() => generatePDF(data, result, 'complete')}>
                    <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Relatório Completo
                </button>
                <button className="btn-primary" onClick={() => generatePDF(data, result, 'objective')} style={{ background: '#2e7d32' }}>
                    <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Relatório Objetivo
                </button>
            </div>

            <div style={{ marginTop: '40px', fontSize: '0.8rem', color: '#999', padding: '0 20px' }}>
                AVISO: O resultado apresentado é orientativo e não substitui a análise do/a Defensor/a Público/a Federal, que possui independência funcional.
            </div>
        </div>
    );
};

export default ResultStep;
