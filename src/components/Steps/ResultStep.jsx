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
                AVISO: O resultado apresentado é orientativo e não substitui a análise do/a Defensor/a Público/a, que possui independência funcional.
            </div>
        </div>
    );
};

export default ResultStep;
